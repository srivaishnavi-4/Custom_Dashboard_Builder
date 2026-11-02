
<template>
  <div class="widget-renderer">

    <!-- KPI -->
    <div
      v-if="widget.type === 'kpi'"
      class="kpi-content"
    >
      <span class="widget-value">
        {{ formatValue(
          get_kpi_value(),
          is_currency_metric(widget.metric)
            ? 'currency'
            : (widget.data_format || 'number'),
          widget.precision
        ) }}
      </span>
    </div>

    <!-- TABLE -->
    <div
      v-else-if="widget.type === 'table'"
      class="table-content"
    >

      <!-- Table scrolling area -->
      <div class="table-scroll">

        <div
          v-if="paginated_table_data.length === 0"
          class="empty-table-state"
        >
          No data
        </div>

        <table
          v-else
          class="mini-table"
          :style="{
            fontSize: (widget.font_size || 14) + 'px'
          }"
        >
          <thead
            :style="{
              backgroundColor: widget.header_bg || '#f9fafb'
            }"
          >
            <tr>
              <th
                v-for="col in active_columns"
                :key="col.value"
              >
                {{ col.name }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in paginated_table_data"
              :key="row._id || row.order_id"
            >
              <td
                v-for="col in active_columns"
                :key="col.value"
              >

                <template v-if="col.value === 'order_id'">
                  {{ row.order_id || '-' }}
                </template>

                <template v-else-if="col.value === 'customer_id'">
                  {{ row.customer_id || '-' }}
                </template>

                <template v-else-if="col.value === 'customer_name'">
                  {{
                    [row.first_name, row.last_name]
                      .filter(Boolean)
                      .join(' ') || '-'
                  }}
                </template>

                <template v-else-if="col.value === 'email_id'">
                  {{ row.email || '-' }}
                </template>

                <template v-else-if="col.value === 'order_date'">
                  {{
                    row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString()
                      : '-'
                  }}
                </template>

                <template v-else-if="col.value === 'address'">
                  {{ row.address || '-' }}
                </template>

                <template
                  v-else-if="
                    col.value === 'total_amount' ||
                    col.value === 'unit_price'
                  "
                >
                  {{ format_currency(row[col.value]) }}
                </template>

                <template v-else>
                  {{ row[col.value] ?? '-' }}
                </template>

              </td>
            </tr>
          </tbody>
        </table>

      </div>

      <!-- Independent table pagination -->
      <div class="table-pagination">

        <!-- Rows per page -->
        <div class="pagination-left">

          <span>Rows per page</span>

          <select
            :value="page_size"
            @change="change_page_size($event.target.value)"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="20">20</option>
          </select>

        </div>

        <!-- Page information and navigation -->
        <div class="pagination-right">

          <span class="record-count">
            {{ pagination_start }}–{{ pagination_end }}
            of {{ filtered_table_data.length }}
          </span>

          <button
            type="button"
            :disabled="current_page <= 1"
            @click="go_to_page(current_page - 1)"
          >
            Previous
          </button>

          <span class="page-number">
            {{ current_page }} / {{ total_pages }}
          </span>

          <button
            type="button"
            :disabled="current_page >= total_pages"
            @click="go_to_page(current_page + 1)"
          >
            Next
          </button>

        </div>

      </div>

    </div>

    <!-- CHARTS -->
    <div
      v-else
      class="chart-content"
    >
      <apexchart
        width="100%"
        height="100%"
        :type="widget.type"
        :options="get_chart_options()"
        :series="get_chart_series()"
      />
    </div>

  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  watch,
  computed
} from 'vue'

import axios from 'axios'
import apexchart from 'vue3-apexcharts'


// ======================================================
// PROPS
// ======================================================

const props = defineProps({
  widget: {
    type: Object,
    required: true
  },

  // Global dashboard time filter
  timeFilter: {
    type: String,
    default: 'All time'
  }
})


// ======================================================
// CHART DATA
// ======================================================

const chart_data = ref({
  labels: [],
  values: [],
  pie_labels: [],
  pie_values: [],
  table: [],
  kpi: {
    totalSales: 0,
    totalOrders: 0
  }
})


// ======================================================
// TABLE COLUMN DEFINITIONS
// ======================================================

const all_column_definitions = [
  { name: 'Order ID', value: 'order_id' },
  { name: 'Customer ID', value: 'customer_id' },
  { name: 'Customer name', value: 'customer_name' },
  { name: 'Email id', value: 'email_id' },
  { name: 'Address', value: 'address' },
  { name: 'Order date', value: 'order_date' },
  { name: 'Product', value: 'product' },
  { name: 'Created by', value: 'created_by' },
  { name: 'Status', value: 'status' },
  { name: 'Total amount', value: 'total_amount' },
  { name: 'Unit price', value: 'unit_price' },
  { name: 'Quantity', value: 'quantity' }
]


const active_columns = computed(() => {

  const saved_cols = props.widget.table_columns || [
    'order_id',
    'customer_name',
    'product',
    'total_amount',
    'status'
  ]

  return all_column_definitions.filter(column =>
    saved_cols.includes(column.value)
  )

})


// ======================================================
// INDEPENDENT TABLE PAGINATION STATE
// ======================================================

// Current table page
const current_page = ref(1)

// Rows displayed on each page
const page_size = ref(
  Number(props.widget.table_pagination) || 5
)


// ======================================================
// TABLE FILTER HELPER
// ======================================================

const get_row_value = (row, attribute) => {

  if (attribute === 'customer_name') {
    return `${row.first_name || ''} ${row.last_name || ''}`.trim()
  }

  if (attribute === 'email_id') {
    return row.email
  }

  if (attribute === 'order_date') {
    return row.createdAt
  }

  return row[attribute]
}


const matches_filter = (row, filter) => {

  if (
    !filter.attribute ||
    !filter.operator ||
    String(filter.value ?? '').trim() === ''
  ) {
    return true
  }

  const raw_value = get_row_value(row, filter.attribute)

  if (raw_value === undefined || raw_value === null) {
    return false
  }

  const actual = String(raw_value).trim()
  const expected = String(filter.value).trim()

  const actual_number = Number(actual)
  const expected_number = Number(expected)

  const numeric_attributes = [
    'quantity',
    'unit_price',
    'total_amount'
  ]

  const is_numeric = numeric_attributes.includes(
    filter.attribute
  )

  switch (filter.operator) {

    case '=':
      return is_numeric
        ? actual_number === expected_number
        : actual.toLowerCase() === expected.toLowerCase()

    case '!=':
      return is_numeric
        ? actual_number !== expected_number
        : actual.toLowerCase() !== expected.toLowerCase()

    case '>':
      return is_numeric
        ? actual_number > expected_number
        : actual > expected

    case '>=':
      return is_numeric
        ? actual_number >= expected_number
        : actual >= expected

    case '<':
      return is_numeric
        ? actual_number < expected_number
        : actual < expected

    case '<=':
      return is_numeric
        ? actual_number <= expected_number
        : actual <= expected

    case 'contains':
      return actual.toLowerCase().includes(
        expected.toLowerCase()
      )

    default:
      return true
  }

}


// ======================================================
// TABLE-SPECIFIC FILTERING AND SORTING
// ======================================================

const filtered_table_data = computed(() => {

  // Start with globally filtered backend data
  let data = Array.isArray(chart_data.value.table)
    ? [...chart_data.value.table]
    : []


  // Apply only this table widget's filters
  if (props.widget.table_apply_filter) {

    const filters = (
      props.widget.table_filters || []
    ).filter(filter =>
      filter.attribute &&
      filter.operator &&
      String(filter.value ?? '').trim() !== ''
    )

    if (filters.length) {

      data = data.filter(row =>
        filters.every(filter =>
          matches_filter(row, filter)
        )
      )

    }

  }


  // Apply table sorting
  data.sort((a, b) => {

    const date_a = new Date(
      a.createdAt || 0
    ).getTime()

    const date_b = new Date(
      b.createdAt || 0
    ).getTime()

    return props.widget.table_sort === 'asc'
      ? date_a - date_b
      : date_b - date_a

  })

  return data

})


// ======================================================
// TABLE PAGINATION
// ======================================================

// Calculate total pages
const total_pages = computed(() => {

  return Math.max(
    1,
    Math.ceil(
      filtered_table_data.value.length / page_size.value
    )
  )

})


// Calculate first visible row
const pagination_start = computed(() => {

  if (filtered_table_data.value.length === 0) {
    return 0
  }

  return (
    (current_page.value - 1) * page_size.value
  ) + 1

})


// Calculate last visible row
const pagination_end = computed(() => {

  return Math.min(
    current_page.value * page_size.value,
    filtered_table_data.value.length
  )

})


// Display only the records belonging to the current page
const paginated_table_data = computed(() => {

  const start = (
    current_page.value - 1
  ) * page_size.value

  const end = start + page_size.value

  return filtered_table_data.value

})


// Navigate between pages
const go_to_page = (page) => {

  if (
    page >= 1 &&
    page <= total_pages.value
  ) {
    current_page.value = page
  }

}


// Change the number of rows per page
const change_page_size = (size) => {

  page_size.value = Number(size) || 5

  current_page.value = 1

}


// Reset pagination when filtered records change
watch(
  filtered_table_data,
  () => {
    current_page.value = 1
  }
)


// Synchronize pagination with widget configuration
watch(
  () => props.widget.table_pagination,
  (new_value) => {

    page_size.value = Number(new_value) || 5

    current_page.value = 1

  }
)


// ======================================================
// CURRENCY FORMATTING
// ======================================================

const is_currency_metric = (metric) => {

  return [
    'unit_price',
    'total_amount'
  ].includes(metric)

}


const format_currency = (value) => {

  const amount = Number(value)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(
    Number.isFinite(amount) ? amount : 0
  )

}


// ======================================================
// KPI FORMATTING
// ======================================================

const formatValue = (value, format, precision) => {

  const number = Number(value)

  const safe_number = Number.isFinite(number)
    ? number
    : 0

  const p = Math.max(
    0,
    Math.min(10, Number(precision ?? 0))
  )

  const final_format = format || 'number'


  if (final_format === 'currency') {

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: p,
      maximumFractionDigits: p
    }).format(safe_number)

  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: p,
    maximumFractionDigits: p
  }).format(safe_number)

}


const get_kpi_value = () => {

  const metric = props.widget.metric

  if (metric === 'total_amount') {
    return chart_data.value.kpi.totalSales ?? 0
  }

  if (metric === 'unit_price') {
    return (
      chart_data.value.kpi.metricValue ??
      chart_data.value.kpi.totalSales ??
      0
    )
  }

  if (metric === 'quantity') {
    return (
      chart_data.value.kpi.metricValue ??
      chart_data.value.kpi.totalSales ??
      0
    )
  }

  if (props.widget.aggregation === 'count') {
    return chart_data.value.kpi.totalOrders ?? 0
  }

  return (
    chart_data.value.kpi.metricValue ??
    chart_data.value.kpi.totalSales ??
    0
  )

}


// ======================================================
// GLOBAL FILTER + API DATA FETCHING
// ======================================================

const fetch_data = async () => {

  // Global time filter is passed to the backend
  const params = {

    time: props.timeFilter,

    metric: props.widget.metric || 'total_amount',

    aggregation: props.widget.aggregation || 'sum',

    x_axis: props.widget.x_axis || 'createdAt',

    y_axis: props.widget.y_axis || 'total_amount',

    chart_data: props.widget.chart_data || 'status'

  }


  try {

    const res = await axios.get(
      'http://localhost:3000/api/charts',
      { params }
    )


    // All widgets use data returned for the global time filter
    chart_data.value = {

      labels: res.data.barChart?.labels || [],

      values: (
        res.data.barChart?.values || []
      ).map(Number),

      pie_labels: res.data.pieChart?.labels || [],

      pie_values: (
        res.data.pieChart?.values || []
      ).map(Number),

      // Do not overwrite this with an unfiltered /api/orders request
      table: Array.isArray(res.data.table)
        ? res.data.table
        : [],

      kpi: res.data.kpi || {
        totalSales: 0,
        totalOrders: 0
      }

    }

  } catch (error) {

    console.error(
      'Failed to load chart data:',
      error
    )

  }

}


// Initial data loading
onMounted(() => {
  fetch_data()
})


// ======================================================
// WATCH GLOBAL FILTER AND WIDGET DATA CONFIGURATION
// ======================================================

watch(
  () => [

    props.widget.type,

    props.widget.metric,

    props.widget.aggregation,

    props.widget.x_axis,

    props.widget.y_axis,

    props.widget.chart_data,

    props.timeFilter

  ],
  () => {

    current_page.value = 1

    fetch_data()

  },
  { deep: true }
)


// ======================================================
// CHART AXIS FORMATTING
// ======================================================

const format_axis_name = (axis_string) => {

  if (!axis_string) return ''

  const name_map = {

    createdAt: 'Order Date',

    total_amount: 'Total Amount',

    unit_price: 'Unit Price',

    customer_name: 'Customer Name',

    customer_id: 'Customer ID',

    email_id: 'Email ID',

    order_date: 'Order Date',

    created_by: 'Created By',

    quantity: 'Quantity',

    product: 'Product',

    status: 'Status'

  }

  if (name_map[axis_string]) {
    return name_map[axis_string]
  }

  return axis_string
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    )

}


const format_axis_value = (value, field) => {

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return ''
  }

  if (is_currency_metric(field)) {
    return format_currency(value)
  }

  return value

}


// ======================================================
// CHART OPTIONS
// ======================================================

const get_chart_options = () => {

  const mainColor =
    props.widget.chart_color || '#54BD95'

  const show_labels =
    props.widget.show_data_labels === true


  const options = {

    chart: {

      toolbar: {
        show: false
      },

      fontFamily: 'Open Sans, sans-serif',

      animations: {
        enabled: false
      },

      parentHeightOffset: 0

    },

    colors: [mainColor],

    stroke: {

      show: true,

      curve: 'smooth',

      width: 2

    },

    dataLabels: {

      enabled: show_labels || false,

      style: {

        fontSize: '12px',

        fontFamily: 'Open Sans, sans-serif',

        fontWeight: 'bold'

      }

    },

    tooltip: {

      enabled: true,

      theme: 'light',

      y: {

        formatter: (value) => {

          if (
            is_currency_metric(
              props.widget.y_axis || props.widget.metric
            )
          ) {
            return format_currency(value)
          }

          return value

        }

      }

    },

    grid: {

      borderColor: '#f3f4f6',

      strokeDashArray: 4,

      padding: {

        top: 10,

        right: 10,

        bottom: 0,

        left: 15

      }

    }

  }


  // ====================================================
  // PIE CHART
  // ====================================================

  if (props.widget.type === 'pie') {

    const total = chart_data.value.pie_values.reduce(
      (sum, value) =>
        sum + Number(value || 0),
      0
    ) || 1


    options.chart = {
      ...options.chart,
      height: '100%'
    }


    options.colors = [

      mainColor,

      '#F59E0B',

      '#EF4444',

      '#3B82F6'

    ]


    options.labels =
      chart_data.value.pie_labels.length
        ? chart_data.value.pie_labels
        : ['No Data']


    options.legend = {

      show: props.widget.show_legend !== false,

      position: 'bottom',

      horizontalAlign: 'center',

      fontSize: '13px',

      fontFamily: 'Open Sans, sans-serif',

      markers: {

        radius: 0,

        size: 8

      },

      formatter: (seriesName, opts) => {

        const value = Number(
          opts.w.globals.series[
            opts.seriesIndex
          ] || 0
        )

        const percent = (
          (value / total) * 100
        ).toFixed(0)

        return `${seriesName} (${percent}%)`

      },

      itemMargin: {
        vertical: 5
      }

    }


    options.dataLabels = {

      enabled: show_labels,

      formatter: (value, opts) => {

        const series_value = Number(
          opts.w.globals.series[
            opts.seriesIndex
          ] || 0
        )

        const percent = total
          ? (series_value / total) * 100
          : 0

        return `${percent.toFixed(0)}%`

      },

      style: {

        fontSize: '12px',

        fontFamily: 'Open Sans, sans-serif',

        fontWeight: 'bold',

        colors: ['#fff']

      }

    }


    options.stroke = {

      show: true,

      width: 3,

      colors: ['#ffffff'],

      lineCap: 'butt'

    }


    options.fill = {
      type: 'solid'
    }


  // ====================================================
  // SCATTER CHART
  // ====================================================

  } else if (props.widget.type === 'scatter') {

    options.stroke = {
      width: 0
    }


    options.markers = {

      size: 6,

      colors: [mainColor],

      strokeColors: '#fff',

      strokeWidth: 1,

      hover: {
        size: 8
      }

    }


    options.xaxis = {

      type: 'numeric',

      position: 'bottom',

      offsetX: 10,

      title: {

        text:
          format_axis_name(props.widget.x_axis) ||
          'X-Axis'

      },

      labels: {

        style: {

          fontSize: '11px',

          fontFamily: 'Open Sans, sans-serif'

        },

        rotate: 0,

        hideOverlappingLabels: true,

        showDuplicates: false,

        trim: true,

        formatter: (value) => {

          return format_axis_value(
            value,
            props.widget.x_axis
          )

        }

      },

      tickAmount: 10,

      axisBorder: {

        show: true,

        color: '#e5e7eb'

      },

      axisTicks: {

        show: true,

        color: '#e5e7eb'

      }

    }


    options.yaxis = {

      title: {

        text:
          format_axis_name(props.widget.y_axis) ||
          'Y-Axis'

      },

      offsetX: -10,

      axisBorder: {

        show: true,

        color: '#e5e7eb'

      },

      axisTicks: {

        show: true,

        color: '#e5e7eb'

      },

      labels: {

        style: {

          fontSize: '11px',

          fontFamily: 'Open Sans, sans-serif'

        },

        formatter: (value) => {

          return format_axis_value(
            value,
            props.widget.y_axis
          )

        }

      }

    }


  // ====================================================
  // BAR / LINE / AREA CHARTS
  // ====================================================

  } else {

    options.plotOptions = {

      bar: {

        borderRadius: 0,

        columnWidth: '60%'

      }

    }


    options.markers = {

      size: 5,

      colors: [mainColor],

      strokeColors: '#fff',

      strokeWidth: 2,

      hover: {
        size: 7
      }

    }


    options.xaxis = {

      categories: chart_data.value.labels.length
        ? chart_data.value.labels
        : ['No Data'],

      title: {

        text:
          format_axis_name(props.widget.x_axis) ||
          'X-Axis'

      },

      labels: {

        rotate: 0,

        rotateAlways: false,

        trim: false,

        maxHeight: 60,

        style: {

          fontSize: '11px',

          fontFamily: 'Open Sans, sans-serif'

        },

        formatter: (value) => {

          if (
            value === undefined ||
            value === null
          ) {
            return ''
          }

          return format_axis_value(
            value,
            props.widget.x_axis
          )

        }

      },

      axisBorder: {

        show: true,

        color: '#e5e7eb'

      },

      axisTicks: {

        show: true,

        color: '#e5e7eb'

      }

    }


    options.yaxis = {

      title: {

        text:
          format_axis_name(props.widget.y_axis) ||
          'Y-Axis'

      },

      axisBorder: {

        show: true,

        color: '#e5e7eb'

      },

      axisTicks: {

        show: true,

        color: '#e5e7eb'

      },

      labels: {

        style: {

          fontSize: '11px',

          fontFamily: 'Open Sans, sans-serif'

        },

        formatter: (value) => {

          if (
            is_currency_metric(props.widget.y_axis)
          ) {
            return format_currency(value)
          }

          return Math.round(value)

        }

      }

    }


    options.grid.padding.bottom = 0


    // Area chart gradient
    if (props.widget.type === 'area') {

      options.fill = {

        type: 'gradient',

        gradient: {

          shadeIntensity: 1,

          opacityFrom: 0.4,

          opacityTo: 0.05,

          stops: [0, 100]

        }

      }

    }

  }


  return options

}


// ======================================================
// CHART SERIES
// ======================================================

const get_chart_series = () => {

  // Pie
  if (props.widget.type === 'pie') {

    return chart_data.value.pie_values.length
      ? chart_data.value.pie_values
      : [0]

  }


  // Scatter
  if (props.widget.type === 'scatter') {

    return [{

      name: 'Data',

      data: chart_data.value.values.map(
        (value, index) => [
          index + 1,
          Number(value || 0)
        ]
      )

    }]

  }


  // Bar / Line / Area
  return [{

    name:
      format_axis_name(props.widget.y_axis) ||
      'Total',

    data: chart_data.value.values.length
      ? chart_data.value.values
      : [0]

  }]

}

</script>


<style scoped>

/* =====================================================
   MAIN WIDGET
===================================================== */

.widget-renderer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}


/* =====================================================
   CHART
===================================================== */

.chart-content {
  width: 100%;
  height: 100%;
  padding: 0;
}


/* =====================================================
   KPI
===================================================== */

.kpi-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.widget-value {
  font-family: 'Open Sans', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #111827;
}


/* =====================================================
   TABLE
===================================================== */

.table-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  position: relative;
}


/* Scrollable table body */

.table-scroll {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: auto;
}


/* Table */

.mini-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Open Sans', sans-serif;
}


/* Sticky table heading */

.mini-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}


/* Heading cells */

.mini-table th {
  background-color: #f9fafb;
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
}


/* Body cells */

.mini-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
  background-color: #ffffff;
  white-space: nowrap;
}


/* Empty table */

.empty-table-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 150px;
  color: #9ca3af;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
}


/* =====================================================
   TABLE PAGINATION
===================================================== */

.table-pagination {
  flex-shrink: 0;
  min-height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: #6b7280;
}


/* Left pagination section */

.pagination-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-left select {
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  color: #374151;
  outline: none;
  cursor: pointer;
}


/* Right pagination section */

.pagination-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-count {
  white-space: nowrap;
}

.page-number {
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
}


/* Previous and Next */

.pagination-right button {
  padding: 5px 9px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  color: #374151;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  cursor: pointer;
}

.pagination-right button:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-right button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}


/* =====================================================
   RESPONSIVE PAGINATION
===================================================== */

@media (max-width: 500px) {

  .table-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-left,
  .pagination-right {
    justify-content: center;
  }

}

</style>
