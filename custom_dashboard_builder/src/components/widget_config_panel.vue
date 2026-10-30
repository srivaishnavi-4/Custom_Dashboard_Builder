<template>
  <div class="config-panel">
    <div class="config-header">
      <h3>Widget configuration</h3>
      <button class="close-config" @click="$emit('close')">✕</button>
    </div>
    
    <div class="config-tabs">
      <button 
        :class="['tab-btn', { active: active_tab === 'data' }]" 
        @click="active_tab = 'data'"
      >
        Data
      </button>
      <button 
        :class="['tab-btn', { active: active_tab === 'styling' }]" 
        @click="active_tab = 'styling'"
      >
        Styling
      </button>
    </div>

    <div class="config-body" v-if="is_ready">
      
      <!-- tab -->
      <div v-show="active_tab === 'data'">
        
        <div class="input-group">
          <label>Widget title *</label>
          <hlx-input 
            v-model:value="local_widget.title" 
            :pre-val="local_widget.title"
            :key="'title-' + render_key"
            :custom-error="errors.title"
            :display-error="errors.title"
            :custom-error-message="errors.title ? 'Please fill the field' : ''"
          />
        </div>

        <!-- <div class="input-group">
          <hlx-select 
            v-model:value="local_widget.type"
            :pre-value="local_widget.type"
            :key="'type-' + render_key"
            :options="widget_type_options"
            :label="'name'"
            :prop-value="'value'"
            placeholder-value="Widget type *"
            :label-animation="true"
            :fixbutton="false"
          />
        </div> -->

        <div class="input-group">
          <label>Description</label>
          <hlx-input 
            v-model:value="local_widget.description" 
            :pre-val="local_widget.description"
            :key="'desc-' + render_key"
          />
        </div>

        <h4 class="config-section-title">Widget size</h4>
        <div class="row-group">
          <div class="input-group half">
            <label>Width (Cols) *</label>
            <hlx-input 
              v-model:value="local_widget.w" 
              :pre-val="local_widget.w"
              :key="'w-' + render_key"
              type="number"
              :custom-error="errors.w"
              :display-error="errors.w"
              :custom-error-message="errors.w ? 'Please fill the field' : ''"
            />
          </div>
          <div class="input-group half">
            <label>Height (Rows) *</label>
            <hlx-input 
              v-model:value="local_widget.h" 
              :pre-val="local_widget.h"
              :key="'h-' + render_key"
              type="number"
              :custom-error="errors.h"
              :display-error="errors.h"
              :custom-error-message="errors.h ? 'Please fill the field' : ''"
            />
          </div>
        </div>

        <h4 class="config-section-title">Data setting</h4>

        <!-- tbl setting -->
        <template v-if="local_widget.type === 'table'">
          <div class="input-group">
            <hlx-multi-select
              :pre-value="local_widget.table_columns"
              :key="'cols-' + render_key"
              :required="true"
              :options="column_options"
              :placeholder="'Choose columns *'"
              :label-animation="true"
              :prop-value="'value'"
              :label="'name'"
              @selected-array="(selected) => local_widget.table_columns = selected.map(item => item.value || item)"
            ></hlx-multi-select>
          </div>

          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.table_sort"
              :pre-value="local_widget.table_sort"
              :key="'sort-' + render_key"
              :options="sort_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Sort by"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.table_pagination"
              :pre-value="local_widget.table_pagination"
              :key="'page-' + render_key"
              :options="pagination_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Pagination"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group checkbox-group">
 <hlx-input
    :type="'single-checkbox'"
    :checked="local_widget.table_apply_filter"
  />          </div>
          <p>{{ local_widget.table_apply_filter }}</p>
        </template>
        <div
  v-if="local_widget.table_apply_filter"
  class="filter-config-section"
>
  <div class="row-group">

    <div class="input-group">
      <hlx-select
        v-model:value="local_widget.filter_column"
        :options="filter_column_options"
        :label="'name'"
        :prop-value="'value'"
        placeholder-value="Choose attribute"
        :label-animation="true"
      />
    </div>

    <div class="input-group">
      <hlx-select
        v-model:value="local_widget.filter_operator"
        :options="operator_options"
        :label="'name'"
        :prop-value="'value'"
        placeholder-value="Operator"
        :label-animation="true"
      />
    </div>

  </div>

  <div class="input-group">
    <hlx-input
      v-model:value="local_widget.filter_value"
      placeholder-value="Value"
    />
  </div>
</div>

        <!-- chart setting -->
        <template v-else-if="['bar', 'line', 'area', 'scatter'].includes(local_widget.type)">
          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.x_axis"
              :pre-value="local_widget.x_axis"
              :key="'xaxis-' + render_key"
              :options="axis_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Choose X - axis data"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.y_axis"
              :pre-value="local_widget.y_axis"
              :key="'yaxis-' + render_key"
              :options="axis_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Choose Y - axis data"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group checkbox-group">
            <hlx-checkbox v-model:checked="local_widget.show_data_labels" label="Show data label" />
          </div>
        </template>

        <!-- pie chart -->
        <template v-else-if="local_widget.type === 'pie'">
          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.chart_data"
              :pre-value="local_widget.chart_data"
              :key="'chartdata-' + render_key"
              :options="chart_data_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Choose chart data *"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>
          <div class="input-group checkbox-group">
            <hlx-checkbox v-model:checked="local_widget.show_legend" label="Show legend" />
          </div>
        </template>

        <!-- KPI -->
        <template v-else-if="local_widget.type === 'kpi'">
          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.metric"
              :pre-value="local_widget.metric"
              :key="'metric-' + render_key"
              :options="metric_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Select metric *"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.aggregation"
              :pre-value="local_widget.aggregation"
              :key="'agg-' + render_key"
              :options="aggregation_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Aggregation *"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group">
            <hlx-select 
              v-model:value="local_widget.data_format"
              :pre-value="local_widget.data_format"
              :key="'format-' + render_key"
              :options="format_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="Data format *"
              :label-animation="true"
              :fixbutton="false"
            />
          </div>

          <div class="input-group">
            <label>Decimal Precision *</label>
            <hlx-input 
              v-model:value="local_widget.precision" 
              :pre-val="local_widget.precision"
              :key="'prec-' + render_key"
              type="number"
            />
          </div>
        </template>

      </div>

      <!-- style tab -->
      <div v-show="active_tab === 'styling'">
        <div class="input-group">
          <label>Font size (px)</label>
          <hlx-input 
            v-model:value="local_widget.font_size" 
            :pre-val="local_widget.font_size"
            :key="'fs-' + render_key"
            type="number"
          />
        </div>

        <div class="input-group">
          <label>Chart Color</label>
          <div class="color-picker-group">
            <input type="color" v-model="local_widget.chart_color" class="color-swatch" />
            <hlx-input 
              v-model:value="local_widget.chart_color" 
              :pre-val="local_widget.chart_color"
              :key="'color-' + render_key"
            />
          </div>
        </div>
      </div>

    </div>

    <div class="config-footer">
      <hlx-button class="cnl-btn" @click.native="$emit('close')">Cancel</hlx-button>
      <hlx-button class="primary" @click.native="save">Save</hlx-button>
    </div>
  </div>
</template>

<script setup>

import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  widget: { type: Object, required: true }
})

const emit = defineEmits(['close', 'save'])

const active_tab = ref('data')
const is_ready = ref(false)
const render_key = ref(0)


const local_widget = ref({ ...props.widget })

// watch the widget change
watch(() => props.widget, (newWidget) => {
  if (newWidget) {
    local_widget.value = { 
      ...newWidget,
      // Ensure default fallbacks if values are missing
      title: newWidget.title || 'Untitled',
      type: newWidget.type || 'kpi', 
      description: newWidget.description || '',
      w: newWidget.w || 4,
      h: newWidget.h || 4,
      metric: newWidget.metric || '',
      aggregation: newWidget.aggregation || '',
      data_format: newWidget.data_format || 'number',
      precision: newWidget.precision !== undefined ? newWidget.precision : 0,
      table_columns: newWidget.table_columns || ['customer_name', 'product', 'total_amount'],
      table_sort: newWidget.table_sort || 'asc',
      table_pagination: newWidget.table_pagination || 5,
      table_apply_filter: newWidget.table_apply_filter || false,
      x_axis: newWidget.x_axis || '',
      y_axis: newWidget.y_axis || '',
      show_data_labels: newWidget.show_data_labels || false,
      chart_data: newWidget.chart_data || '',
      show_legend: newWidget.show_legend !== undefined ? newWidget.show_legend : true,
      font_size: newWidget.font_size || 14,
      chart_color: newWidget.chart_color || '#54BD95',
      filter_column: newWidget.filter_column || '',
filter_operator: newWidget.filter_operator || '=',
filter_value: newWidget.filter_value || ''
    }
  }
}, { deep: true, immediate: true })

// Wait before rendering to let the custom hlx components register properly
onMounted(() => {
  setTimeout(() => {
    is_ready.value = true
    render_key.value++ // Force the custom inputs to read the data
  }, 150)
})

const errors = ref({ title: false, w: false, h: false })

const filter_column_options = [
  { name: 'Product', value: 'product' },
  { name: 'Quantity', value: 'quantity' },
  { name: 'Status', value: 'status' },
  { name: 'Unit Price', value: 'unit_price' },
  { name: 'Total Amount', value: 'total_amount' }
]

const operator_options = [
  { name: '=', value: '=' },
  { name: '≠', value: '!=' },
  { name: '>', value: '>' },
  { name: '>=', value: '>=' },
  { name: '<', value: '<' },
  { name: '<=', value: '<=' },
  { name: 'Contains', value: 'contains' }
]

const widget_type_options = [
  { name: 'KPI', value: 'kpi' },
  { name: 'Bar Chart', value: 'bar' },
  { name: 'Line Chart', value: 'line' },
  { name: 'Pie Chart', value: 'pie' },
  { name: 'Area Chart', value: 'area' },
  { name: 'Scatter Plot', value: 'scatter' },
  { name: 'Table', value: 'table' }
]

const metric_options = [
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

const aggregation_options = [
  { name: 'Sum', value: 'sum' },
  { name: 'Average', value: 'average' },
  { name: 'Count', value: 'count' }
]

const format_options = [
  { name: 'Number', value: 'number' },
  { name: 'Currency', value: 'currency' }
]

const column_options = [
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

const sort_options = [
  { name: 'Ascending', value: 'asc' },
  { name: 'Descending', value: 'desc' }
]

const pagination_options = [
  { name: '5', value: 5 },
  { name: '10', value: 10 },
  { name: '15', value: 15 }
]

const axis_options = [
  { name: 'Order date', value: 'createdAt' },
  { name: 'Product', value: 'product' },
  { name: 'Status', value: 'status' },
  { name: 'Total amount', value: 'total_amount' },
  { name: 'Unit price', value: 'unit_price' },
  { name: 'Quantity', value: 'quantity' }
]

const chart_data_options = [
  { name: 'Product', value: 'product' },
  { name: 'Quantity', value: 'quantity' },
  { name: 'Unit price', value: 'unit_price' },
  { name: 'Total amount', value: 'total_amount' },
  { name: 'Status', value: 'status' },
  { name: 'Created by', value: 'created_by' }
]

const save = () => {
  Object.keys(errors.value).forEach(key => errors.value[key] = false)
  let has_error = false
  if (!local_widget.value.title) { errors.value.title = true; has_error = true }
  if (!local_widget.value.w) { errors.value.w = true; has_error = true }
  if (!local_widget.value.h) { errors.value.h = true; has_error = true }
  if (has_error) return
  emit('save', local_widget.value)
}
</script>

<style scoped>

.config-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

/* Config Header */
.config-header {
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.config-header h3 {
  margin: 0;
  font-family: 'Quicksand', sans-serif;
  font-size: 18px;
}

.close-config {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #9ca3af;
}


.config-tabs {
  display: flex;
  padding: 10px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 10px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #10b981;
  border-bottom: 2px solid #10b981;
}

/* Config Body */
.config-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 16px;
}

.row-group {
  display: flex;
  gap: 16px;
}

.row-group .half {
  flex: 1;
}

.config-section-title {
  font-family: 'Quicksand', sans-serif;
  font-size: 14px;
  color: #374151;
  margin: 12px 0 4px 0;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
}

.config-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
}

.input-group label {
  position: absolute;
  top: -8px;
  left: 10px;
  background: white;
  padding: 0 4px;
  font-size: 11px;
  color: #6b7280;
  font-family: 'Open Sans', sans-serif;
  z-index: 10;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.checkbox-group label {
  position: static;
  background: none;
  padding: 0;
  font-size: 14px;
  color: #374151;
}

/* color Picker  */
.color-picker-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-swatch {
  width: 44px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.cnl-btn{
  border: 1px solid black;
}
.filter-section {
  padding: 12px;
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}

</style>