
<template>
  <div class="page-container">
    <div class="content-card">

      <!-- Toast notification -->
      <hlx-alert-notification :notify="notification" :auto-close="true" />

      <!-- Header -->
      <div class="header-area">
        <hlx-button @click="handle_back" class="back-btn">
          <img src="../assets/arrow-left-regular.svg" alt="back">
        </hlx-button>

        <div>
          <h1 class="page-title">Configure dashboard</h1>
          <p class="page-subtitle">
            Configure your dashboard to start viewing analytics
          </p>
        </div>
      </div>

      <!-- Main content layout -->
      <div class="builder-layout">

        <!-- Left sidebar -->
        <div class="sidebar">
          <div class="section">
            <label class="section-label">Show data for</label>

            <hlx-select
              v-model:value="selected_time"
              :options="time_options"
              :label="'name'"
              :prop-value="'value'"
              placeholder-value="All time"
              :label-animation="true"
            />
          </div>

          <div class="section">
            <label class="section-label">Widget library</label>
            <p class="hint-text">Drag and drop your canvas</p>

            <!-- Charts -->
            <div class="accordion">
              <div
                class="accordion-header"
                @click="toggle_category('charts')"
              >
                <span>Charts</span>
                <img
                  src="../assets/up-arrow.svg"
                  alt="uparrow"
                  :class="{ rotate: open_categories.charts }"
                  class="arrow-icon"
                >
              </div>

              <div
                v-show="open_categories.charts"
                class="accordion-content"
              >
                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'bar')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/bar-chart-icon.svg" alt="">
                  </div>
                  <span>Bar Chart</span>
                </div>

                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'line')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/line-chart-icon.svg" alt="">
                  </div>
                  <span>Line Chart</span>
                </div>

                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'pie')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/pie-chart-icon.svg" alt="">
                  </div>
                  <span>Pie Chart</span>
                </div>

                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'area')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/area-chart-icon.svg" alt="">
                  </div>
                  <span>Area Chart</span>
                </div>

                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'scatter')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/scatter-plot-icon.svg" alt="">
                  </div>
                  <span>Scatter Plot</span>
                </div>
              </div>
            </div>

            <!-- Tables -->
            <div class="accordion">
              <div
                class="accordion-header"
                @click="toggle_category('tables')"
              >
                <span>Tables</span>
                <img
                  src="../assets/up-arrow.svg"
                  alt="uparrow"
                  :class="{ rotate: open_categories.tables }"
                  class="arrow-icon"
                >
              </div>

              <div
                v-show="open_categories.tables"
                class="accordion-content"
              >
                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'table')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/table-icon.svg" alt="">
                  </div>
                  <span>Table</span>
                </div>
              </div>
            </div>

            <!-- KPIs -->
            <div class="accordion">
              <div
                class="accordion-header"
                @click="toggle_category('kpis')"
              >
                <span>KPIs</span>
                <img
                  src="../assets/up-arrow.svg"
                  alt="uparrow"
                  :class="{ rotate: open_categories.kpis }"
                  class="arrow-icon"
                >
              </div>

              <div
                v-show="open_categories.kpis"
                class="accordion-content"
              >
                <div
                  class="widget-item"
                  draggable="true"
                  @dragstart="on_drag_start($event, 'kpi')"
                >
                  <span class="drag-handle">
                    <img src="../assets//dragable.svg" alt="drag">
                  </span>
                  <div class="widget-icon-bg">
                    <img src="../assets/kpi-card-icon.svg" alt="">
                  </div>
                  <span>KPI Value</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Scrollable canvas -->
        <div
          ref="canvasArea"
          class="canvas-area"
          @dragover.prevent="on_drag_over"
          @dragleave="on_drag_leave"
          @drop.prevent="on_drop"
        >
          <div class="grid-container" ref="gridContainer">

            <!-- Grid background grows as rows are added -->
            <div
              v-for="n in grid_cell_count"
              :key="'bg-' + n"
              class="grid-cell"
            ></div>

            <!-- Drag preview -->
            <div
              v-if="drag_preview"
              class="drag-preview"
              :style="{
                gridColumnStart: drag_preview.x + 1,
                gridColumnEnd: drag_preview.x + drag_preview.w + 1,
                gridRowStart: drag_preview.y + 1,
                gridRowEnd: drag_preview.y + drag_preview.h + 1
              }"
            >
              <div class="preview-content">
                <img
                  src="../assets/dragable.svg"
                  class="drag-icon"
                  alt="drag"
                >
                <span class="preview-text">
                  {{ get_name_for_type(dragged_type) }}
                </span>
              </div>
            </div>

            <!-- Final widgets -->
            <div
              v-for="widget in widgets"
              :key="widget.id"
              class="widget-card"
              :style="{
                gridColumnStart: Number(widget.x || 0) + 1,
                gridColumnEnd: Number(widget.x || 0) + Number(widget.w || 1) + 1,
                gridRowStart: Number(widget.y || 0) + 1,
                gridRowEnd: Number(widget.y || 0) + Number(widget.h || 1) + 1
              }"
              draggable="true"
              @dragstart="on_widget_drag_start($event, widget)"
              @dragend="on_widget_drag_end"
            >
              <div class="widget-header">
                <span class="widget-title">{{ widget.title }}</span>

                <div class="widget-actions">
                  <button
                    class="action-btn delete"
                    draggable="false"
                    @mousedown.stop
                    @click.stop="open_delete(widget)"
                    title="Delete"
                  >
                    <img src="../assets/delete-iocn.svg.svg" alt="delete">
                  </button>

                  <button
                    class="action-btn settings"
                    draggable="false"
                    @mousedown.stop
                    @click.stop="open_config(widget)"
                    title="Settings"
                  >
                    <img src="../assets/setting..svg" alt="settings">
                  </button>
                </div>
              </div>

              <div class="widget-body">
                <widget_renderer
                  :key="widget.key || widget.id"
                  :widget="widget"
                  :timeFilter="selected_time"
                />

                <img
                  src="../assets/dragable.svg"
                  class="widget-drag-icon"
                  alt="drag"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="footer-actions">
        <hlx-button @click="handle_back">Cancel</hlx-button>
        <hlx-button class="primary" @click="open_save_modal">
          Save
        </hlx-button>
      </div>

      <!-- Delete modal -->
      <div v-if="is_delete_open" class="modal-overlay">
        <div class="custom-modal">
          <div class="custom-modal-header">
            <h3>Delete</h3>
            <button
              class="close-btn"
              @click="is_delete_open = false"
            >
              <img src="../assets/close.svg" alt="close">
            </button>
          </div>

          <div class="custom-modal-body">
            <p>
              Are you sure you want to delete the
              <strong>{{ widget_to_delete?.title }}</strong> widget?
            </p>
          </div>

          <div class="custom-modal-footer">
            <hlx-button @click="is_delete_open = false">
              Cancel
            </hlx-button>
            <hlx-button class="primary" @click="confirm_delete">
              Delete
            </hlx-button>
          </div>
        </div>
      </div>

      <!-- Unsaved changes modal -->
      <div v-if="is_unsaved_open" class="modal-overlay">
        <div class="custom-modal">
          <div class="custom-modal-header">
            <h3>Unsaved changes</h3>
            <button
              class="close-btn"
              @click="is_unsaved_open = false"
            >
              <img src="../assets/close.svg" alt="close">
            </button>
          </div>

          <div class="custom-modal-body">
            <p>
              Do you want to save your changes before navigating away?
            </p>
          </div>

          <div class="custom-modal-footer unsaved-footer">
            <hlx-button
              @click="discard_changes"
              class="discard-btn"
            >
              Discard
            </hlx-button>

            <hlx-button
              class="primary"
              @click="save_and_leave"
            >
              Save
            </hlx-button>
          </div>
        </div>
      </div>

      <!-- Save dashboard modal -->
      <div v-if="is_save_modal_open" class="modal-overlay">
        <div class="custom-modal">
          <div class="custom-modal-header">
            <h3>Save Dashboard</h3>
            <button
              class="close-btn"
              @click="is_save_modal_open = false"
            >
              <img src="../assets/close.svg" alt="close">
            </button>
          </div>

          <div class="custom-modal-body">
            <p style="margin-bottom: 16px;">
              Give your dashboard a name so you can easily find it later.
            </p>

            <hlx-input
              v-model:value="dashboard_name"
              placeholder-value="e.g. Sales Overview 2026"
              :label-animation="true"
            />
          </div>

          <div class="custom-modal-footer">
            <hlx-button @click="is_save_modal_open = false">
              Cancel
            </hlx-button>
            <hlx-button class="primary" @click="confirm_save">
              Save Dashboard
            </hlx-button>
          </div>
        </div>
      </div>

      <!-- Widget config panel -->
      <widget_config_panel
        v-if="is_config_open && active_widget"
        :widget="active_widget"
        @close="is_config_open = false"
        @save="save_config"
      />

    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
  computed,
  nextTick
} from 'vue'

import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

import widget_config_panel from '../components/widget_config_panel.vue'
import widget_renderer from '../components/widget_renderer.vue'

const router = useRouter()
const route = useRoute()

const gridContainer = ref(null)
const canvasArea = ref(null)

// Notification state
const notification = ref({})

// Unsaved changes state
const is_unsaved_open = ref(false)
const has_unsaved_changes = ref(false)

// Config state
const is_config_open = ref(false)
const active_widget = ref(null)

// Save dashboard modal state
const is_save_modal_open = ref(false)
const dashboard_name = ref('My Dashboard')
const editing_dashboard_id = ref(null)

// Grid state
const MIN_ROWS = 14

const grid_rows = computed(() => {
  if (!widgets.value.length) {
    return MIN_ROWS
  }

  const lastRow = Math.max(
    ...widgets.value.map(
      widget =>
        Number(widget.y || 0) +
        Number(widget.h || 1)
    )
  )

  return Math.min(Math.max(lastRow + 5, MIN_ROWS),MAX_ROWS)
})

const grid_cell_count = computed(
  () => grid_rows.value * 14
)
// Drag state
let dragged_type = null
let dragged_widget = null

const widgets = ref([])
const drag_preview = ref(null)

// Delete state
const is_delete_open = ref(false)
const widget_to_delete = ref(null)

// Auto-scroll state
let auto_scroll_frame = null
let last_drag_position = null

// Track whether an existing dashboard is being loaded.
const is_loading_dashboard = ref(false)

const get_name_for_type = (type) => {
  const names = {
    bar: 'Bar Chart',
    line: 'Line Chart',
    pie: 'Pie Chart',
    area: 'Area Chart',
    scatter: 'Scatter Plot',
    table: 'Table',
    kpi: 'KPI Value'
  }

  return names[type] || 'Widget'

}
const hasCollision = (
  x,
  y,
  w,
  h,
  ignoreId = null
) => {
  return widgets.value.some(widget => {

    if (
      ignoreId &&
      widget.id === ignoreId
    ) {
      return false
    }

    return !(
      x + w <= widget.x ||
      x >= widget.x + widget.w ||
      y + h <= widget.y ||
      y >= widget.y + widget.h
    )
  })
}
const findNextAvailablePosition = (
  x,
  y,
  w,
  h,
  ignoreId = null
) => {

  let newY = y

  while (
    hasCollision(
      x,
      newY,
      w,
      h,
      ignoreId
    )
  ) {
    newY++
  }

  return newY
}
const MAX_ROWS=40
// Ensure the grid has enough rows to contain a widget.
const ensure_grid_rows = (required_row) => {
  if (required_row > MAX_ROWS) {
    return
  }
}

// Config logic
const open_config = (widget) => {
  active_widget.value = JSON.parse(JSON.stringify(widget))
  is_config_open.value = true
}

const save_config = (updated_widget) => {
  const index = widgets.value.findIndex(
    widget => widget.id === updated_widget.id
  )

  if (index !== -1) {
    const original = widgets.value[index]

    widgets.value[index] = {
      ...updated_widget,
      x: original.x,
      y: original.y,
      key: Date.now()
    }
  }

  is_config_open.value = false

  notification.value = {
    type: 'success',
    message: 'All set! Your widget settings have been updated!'
  }
}

// Drag from the widget library
const on_drag_start = (event, type) => {
  dragged_type = type
  dragged_widget = null

  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', type)
}

// Drag an existing widget
const on_widget_drag_start = (event, widget) => {
  dragged_widget = widget
  dragged_type = widget.type

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(widget.id))
}

// Stop dragging an existing widget.
const on_widget_drag_end = () => {
  stop_auto_scroll()
  drag_preview.value = null
  dragged_type = null
  dragged_widget = null
}

// Scroll automatically when the pointer is near the top or bottom.
const start_auto_scroll = (event) => {
  last_drag_position = {
    clientX: event.clientX,
    clientY: event.clientY
  }

  if (auto_scroll_frame === null) {
    auto_scroll_frame = requestAnimationFrame(auto_scroll_step)
  }
}

const auto_scroll_step = () => {
  const canvas = canvasArea.value
  const position = last_drag_position

  if (!canvas || !position || !dragged_type) {
    auto_scroll_frame = null
    return
  }

  const rect = canvas.getBoundingClientRect()
  const edge_size = 70
  const scroll_speed = 12

  if (position.clientY > rect.bottom - edge_size) {
    canvas.scrollTop += scroll_speed
  } else if (position.clientY < rect.top + edge_size) {
    canvas.scrollTop -= scroll_speed
  }

  auto_scroll_frame = requestAnimationFrame(auto_scroll_step)
}

const stop_auto_scroll = () => {
  if (auto_scroll_frame !== null) {
    cancelAnimationFrame(auto_scroll_frame)
    auto_scroll_frame = null
  }

  last_drag_position = null
}

// Calculate the row and column under the pointer.
const on_drag_over = (event) => {
  if (!dragged_type || !gridContainer.value || !canvasArea.value) {
    return
  }

  start_auto_scroll(event)

  const grid = gridContainer.value
  const grid_rect = grid.getBoundingClientRect()
  const gap = 6

  const col_width = (grid_rect.width - (13 * gap)) / 14

  // Keep the original 14-column layout.
  const first_cell = grid.querySelector('.grid-cell')
  const base_row_height = first_cell
    ? first_cell.getBoundingClientRect().height
    : 40

  // Height of the original 14 rows.
  const original_grid_height =
    (14 * base_row_height) + (13 * gap)

  const mouse_x = event.clientX - grid_rect.left
  const mouse_y = event.clientY - grid_rect.top

  let col = Math.floor(mouse_x / (col_width + gap))
  let row

  // Original rows use their actual rendered height.
  // Additional rows use the 40px auto-row height.
  if (mouse_y < original_grid_height) {
    row = Math.floor(mouse_y / (base_row_height + gap))
  } else {
    row = 14 + Math.floor(
      (mouse_y - original_grid_height) / (40 + gap)
    )
  }

  col = Math.max(0, col)
  row = Math.max(0, row)

  let w = 4
let h = 5

if (dragged_type === 'table') {
  w = 6
  h = 6
}

if (dragged_type === 'kpi') {
  w = 3
  h = 2
}
if (dragged_type === 'pie') {
  w = 5
  h = 5
}
  if (col + w > 14) {
    col = 14 - w
  }

  // Extend the grid before placing the preview.
  ensure_grid_rows(row + h)

  drag_preview.value = {
    x: col,
    y: row,
    w,
    h
  }
}

const on_drag_leave = (event) => {
  // Ignore transitions between elements inside the canvas.
  if (
    event.relatedTarget &&
    canvasArea.value?.contains(event.relatedTarget)
  ) {
    return
  }

  drag_preview.value = null
}

// Drop a new widget or move an existing widget.
const on_drop = async () => {
  if (!dragged_type || !drag_preview.value) {
    stop_auto_scroll()

    dragged_type = null
    dragged_widget = null
    drag_preview.value = null

    return
  }

  const pos = { ...drag_preview.value }

pos.y = findNextAvailablePosition(
  pos.x,
  pos.y,
  pos.w,
  pos.h,
  dragged_widget?.id
)

  ensure_grid_rows(pos.y + pos.h)

  if (dragged_widget) {
    const index = widgets.value.findIndex(
      widget => widget.id === dragged_widget.id
    )

    if (index !== -1) {
     widgets.value[index] = {
  ...widgets.value[index],
  x: pos.x,
  y: pos.y,
  w: widgets.value[index].w,
  h: widgets.value[index].h,
  key: Date.now()
}
    }
  } else {
    widgets.value.push({
  id: Date.now().toString(),
  type: dragged_type,
  title: get_name_for_type(dragged_type),

  w: pos.w,
  h: pos.h,
  x: pos.x,
  y: pos.y,

  metric: '',
  aggregation: '',
  data_format: 'number',
  precision: 0,

  table_columns: [
    'customer_name',
    'product',
    'total_amount'
  ],

  table_sort: 'asc',
  table_pagination: 5,

  /* TABLE FILTER */
  table_apply_filter: false,

  table_filters: [
    {
      attribute: '',
      operator: '=',
      value: ''
    }
  ],

  /* CHART SETTINGS */
  x_axis: '',
  y_axis: '',
  chart_data: '',

  show_data_labels: false,
  show_legend: true,

  /* STYLING */
  font_size: 14,
  chart_color: '#54BD95',
  header_bg: '#D8D8D8',

  key: Date.now()
})
  }

  stop_auto_scroll()

  dragged_type = null
  dragged_widget = null
  drag_preview.value = null

  await nextTick()
}

// Delete logic
const open_delete = (widget) => {
  widget_to_delete.value = widget
  is_delete_open.value = true
}

const confirm_delete = () => {
  if (!widget_to_delete.value) return

  widgets.value = widgets.value.filter(
    widget => widget.id !== widget_to_delete.value.id
  )

  is_delete_open.value = false
  widget_to_delete.value = null

  notification.value = {
    type: 'success',
    message: 'Done! Your widget has been removed'
  }
}

// Unsaved changes logic
watch(
  widgets,
  () => {
    if (!is_loading_dashboard.value) {
      has_unsaved_changes.value = true
    }
  },
  { deep: true }
)

const handle_back = () => {
  if (has_unsaved_changes.value) {
    is_unsaved_open.value = true
  } else {
    router.push('/dashboard')
  }
}

const discard_changes = () => {
  is_unsaved_open.value = false
  has_unsaved_changes.value = false
  router.push('/dashboard')
}

// Save existing changes before leaving.
const save_and_leave = async () => {
  if (!dashboard_name.value.trim()) {
    is_unsaved_open.value = false
    open_save_modal()
    return
  }

  try {
    await axios.post('http://localhost:3000/api/dashboard/save', {
      id: editing_dashboard_id.value,
      name: dashboard_name.value,
      widgets: widgets.value
    })

    has_unsaved_changes.value = false
    is_unsaved_open.value = false

    notification.value = {
      type: 'success',
      message: 'All set! Your changes have been saved successfully!'
    }

    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error) {
    console.error('Failed to save dashboard:', error)

    notification.value = {
      type: 'error',
      message: 'Failed to save dashboard. Please try again.'
    }
  }
}

// Time filter
const selected_time = ref('All time')

const time_options = [
  { name: 'All time', value: 'All time' },
  { name: 'Today', value: 'Today' },
  { name: 'Last 7 Days', value: 'Last 7 Days' },
  { name: 'Last 30 Days', value: 'Last 30 Days' },
  { name: 'Last 90 Days', value: 'Last 90 Days' }
]

// Accordion state
const open_categories = reactive({
  charts: true,
  tables: true,
  kpis: true
})

const toggle_category = (category) => {
  open_categories[category] = !open_categories[category]
}

// Load an existing dashboard for editing.
onMounted(async () => {
  const url_id = route.query.id

  if (!url_id) return

  editing_dashboard_id.value = String(url_id)
  is_loading_dashboard.value = true

  try {
    const res = await axios.get(
      'http://localhost:3000/api/dashboard'
    )

    const dashboards = Array.isArray(res.data)
      ? res.data
      : [res.data]

    const found = dashboards.find(
      dashboard => String(dashboard._id) === String(url_id)
    )

    if (found) {
      dashboard_name.value = found.name || 'My Dashboard'

      widgets.value = Array.isArray(found.widgets)
        ? found.widgets.map(widget => ({
            ...widget,
            x: Number(widget.x || 0),
            y: Number(widget.y || 0),
            w: Number(widget.w || 4),
            h: Number(widget.h || 4)
          }))
        : []

      const last_row = widgets.value.reduce(
        (max, widget) => Math.max(
          max,
          widget.y + widget.h
        ),
        14
      )

      grid_rows.value = Math.max(14, last_row)

      await nextTick()

      if (canvasArea.value) {
        canvasArea.value.scrollTop = 0
      }
    } else {
      notification.value = {
        type: 'error',
        message: 'The requested dashboard could not be found.'
      }
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)

    notification.value = {
      type: 'error',
      message: 'Failed to load the saved dashboard.'
    }
  } finally {
    is_loading_dashboard.value = false
    has_unsaved_changes.value = false
  }
})

// Save dashboard modal
const open_save_modal = async () => {

  // Dashboard already saved once
  if (editing_dashboard_id.value) {
    await confirm_save()
    return
  }

  // First save only
  is_save_modal_open.value = true
}

// Save a new dashboard or update an existing dashboard.
const confirm_save = async () => {
  if (!dashboard_name.value.trim()) {
    notification.value = {
      type: 'error',
      message: 'Please enter a dashboard name.'
    }
    return
  }

  try {
    const res = await axios.post(
      'http://localhost:3000/api/dashboard/save',
      {
        id: editing_dashboard_id.value,
        name: dashboard_name.value.trim(),
        widgets: widgets.value
      }
    )

    // Keep the existing dashboard ID when the API returns it.
    const saved_id = res.data?._id || res.data?.id

    if (saved_id) {
      editing_dashboard_id.value = String(saved_id)
    }

    has_unsaved_changes.value = false
    is_save_modal_open.value = false

    notification.value = {
      type: 'success',
      message: 'All set! Your dashboard has been saved!'
    }

    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (error) {
    console.error('Failed to save dashboard:', error)

    notification.value = {
      type: 'error',
      message: 'Failed to save dashboard. Please try again.'
    }
  }
}

// Clean up the animation when leaving the component.
onBeforeUnmount(() => {
  stop_auto_scroll()
})
</script>

<style scoped>
/* Page layout */
.page-container {
  background-color: #f3f4f6;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  box-sizing: border-box;
}

.content-card {
  background-color: #ffffff;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
}

/* Header */
.header-area {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 40px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.page-title {
  font-family: 'Quicksand', sans-serif;
  font-size: 20px;
  color: #111827;
  margin: 0 0 4px 0;
  font-weight: 600;
}

.page-subtitle {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Builder layout */
.builder-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  min-width: 280px;
  flex: 0 0 280px;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  background-color: #ffffff;
  box-sizing: border-box;
}

.section-label {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.hint-text {
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 12px 0;
}

/* Accordion */
.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fafafa;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 6px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #ffffff;
}

.widget-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
  border-radius: 6px;
  cursor: grab;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #4b5563;
}

.widget-item:hover {
  background: #f3f4f6;
}

.drag-handle img {
  width: 12px;
}

.widget-icon-bg {
  width: 24px;
  height: 24px;
  background: #eef2f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Canvas: preserve sidebar width and use remaining screen width */
.canvas-area {
  flex: 1;
  min-width: 0;
  min-height: 0;

  background: #ffffff;
  padding: 20px;

  overflow-y: auto;
  overflow-x: hidden;

  position: relative;
  box-sizing: border-box;

  display: block;
}

/* Grid: keep 14 columns and extend vertically */
.grid-container {
  display: grid;

  grid-template-columns:
    repeat(14, minmax(0, 1fr));

  grid-template-rows:
    repeat(
      v-bind(grid_rows),
      90px
    );

  grid-auto-rows: 90px;

  gap: 6px;

  width: 100%;
  min-width: 0;

  height: auto;

  align-content: start;

  position: relative;
  box-sizing: border-box;
}
.grid-cell {
  background-color: #f3f4f6;
  border-radius: 4px;
  min-width: 0;
}

/* Drag preview */
.drag-preview {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  pointer-events: none;
  min-width: 0;
  min-height: 0;
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
}

.preview-content .drag-icon {
  width: 20px;
  height: 20px;
}

.preview-text {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
}

/* Final widgets */
.widget-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 10;
  cursor: grab;
  min-height: 180px;
}

.widget-card:active {
  cursor: grabbing;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #f3f4f6;
  background: white;
  position: relative;
  flex-shrink: 0;
}

.widget-title {
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: #6b7280;
}

.widget-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.widget-card:hover .widget-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn img {
  width: 16px;
  height: 16px;
}

.widget-body {
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.widget-value {
  font-family: 'Open Sans', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.widget-drag-icon {
  width: 16px;
  height: 16px;
  opacity: 0;
  transition: opacity 0.2s;
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 5;
  pointer-events: none;
}

.widget-card:hover .widget-drag-icon {
  opacity: 0.5;
}

/* Footer */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 10px 40px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  flex-shrink: 0;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-modal {
  background: white;
  width: 450px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.custom-modal-header h3 {
  margin: 0;
  font-family: 'Quicksand', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn img {
  width: 14px;
  height: 14px;
}

.custom-modal-body {
  padding: 24px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #374151;
}

.custom-modal-body p {
  margin: 0;
}

.custom-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fafafa;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.unsaved-footer {
  justify-content: flex-end;
  gap: 12px;
}

.discard-btn {
  color: #ef4444 !important;
  border-color: #ef4444 !important;
}
@media (max-width: 1400px) {
  .grid-container {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .builder-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .grid-container {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 1400px) {
  .grid-container {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .builder-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .grid-container {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.widget-body {
  overflow: hidden;
}

.chart-content {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
.widget-card {
  overflow: hidden;
}

</style>
