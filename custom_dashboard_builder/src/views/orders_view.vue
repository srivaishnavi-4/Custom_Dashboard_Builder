<template>
  <div class="page-container">
    <div class="content-card">

      <!-- toaster notification -->
      <hlx-alert-notification :notify="notification" :auto-close="true" />

      <div class="top-header">
        <h1 class="page-title">Customer Orders</h1>
        <p class="page-subtitle">View and manage customer orders and details</p>
      </div>
      
      <div class="navigation-bar">
        
        <!-- left side: tabs -->
        <div class="tabs-area">
          <div class="tab" @click="router.push('/dashboard')">
            <img :src="dashboard_black_icon" class="tab-icon" alt="Dashboard" />
            <span>Dashboard</span>
          </div>
          <div class="tab active">
            <img :src="table_green_icon" class="tab-icon" alt="Table" />
            <span>Table</span>
          </div>
        </div>

        <!-- search and create order -->
        <div v-if="orders.length > 0" class="actions-area">
          <hlx-search @search-key="search" :search-style="'style1'" class="search-bar"/>
          
          <hlx-button class="primary" @click="is_form_open = true">
            <span class="btn-content">
              <img src="../assets/create-order-icon.svg" alt="create" class="btn-icon">
              <span>Create Order</span>
            </span>
          </hlx-button>
        </div>

      </div>

      <!-- table content -->
      <div v-if="orders.length > 0" class="table-area" >
        
        <hlx-table 
          :column-count="active_columns.length + 2"
          :border="['table','header','horizontal']"
          :bold-headers="false"
          :row-hover="true"
          theme="grey"
          :striped-rows="false"
          :re-arrange-columns="re_arrange"
          :re-arrange-heads="theads"
          @close-rearrange="arrange(false)"
          @apply-rearranged-columns="apply_columns"
          :height="500"
        >
          <template #thead>
            <!-- serial number (fixed left) -->
            <hlx-table-head :width="60" align="center" fixed="left">S.no</hlx-table-head>

            <!-- dynamic columns (configurable via rearrange) -->
            <hlx-table-head
              v-for="(col, index) in active_columns"
              :key="col.prop || index"
              :prop="col.prop"
              :width="col.width || 150"
              :resizable="col.resizable"
            >
              {{ col.label }}
            </hlx-table-head>

            <!-- actions column (fixed right) -->
            <hlx-table-head :width="60" align="center" fixed="right">
              <div class="cell-wrapper">
                <div class="action-icon" @click="open_rearrange">
                  <img src="../assets/setting..svg" alt="settings" class="gear-icon" />
                </div>
              </div>
            </hlx-table-head>
          </template>

          <template #tbody>
            <tr v-for="(order, index) in pagination_orders" :key="order._id">
              <!-- serial number -->
              <hlx-table-cell align="center" fixed="left">
                {{ (current_page - 1) * rows_per_page + index + 1 }}
              </hlx-table-cell>

              <!-- dynamic cells -->
              <hlx-table-cell
                v-for="(col, col_index) in active_columns"
                :key="col.prop || col_index"
                :align="col.align || 'left'"
              >
                <!-- status badge -->
                <template v-if="col.prop === 'status'">
                  <span :class="['status-badge', order.status.toLowerCase().replace(' ', '-')]">
                    {{ order.status }}
                  </span>
                </template>

                <!-- currency -->
                <template v-else-if="col.prop === 'total_amount' || col.prop === 'unit_price'">
                  {{ new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(order[col.prop] || 0) }}
                </template>

                <!-- date -->
                <template v-else-if="col.prop === 'createdAt'">
                  {{ new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) }}
                  {{ new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}
                </template>

                <!-- customer name -->
                <template v-else-if="col.prop === 'customer_name'">
                  {{ order.first_name }} {{ order.last_name }}
                </template>

                <!-- order id -->
                <template v-else-if="col.prop === 'order_id'">
                  {{ order.order_id || '-' }}
                </template>

                <!-- customer id -->
                <template v-else-if="col.prop === 'customer_id'">
                  {{ order.customer_id || '-' }}
                </template>

                <!-- phone (handles object type) -->
                <template v-else-if="col.prop === 'phone'">
                  {{ typeof order.phone === 'object' ? (order.phone.number || JSON.stringify(order.phone)) : order.phone }}
                </template>

                <!-- address (combines multiple fields) -->
                <template v-else-if="col.prop === 'address'">
                  {{ order.address }}, {{ order.city }}, {{ order.state }}, {{ order.postal_code }}, {{ order.country }}
                </template>

                <!-- default -->
                <template v-else>
                  {{ order[col.prop] || '-' }}
                </template>
              </hlx-table-cell>

              <!-- actions -->
              <hlx-table-cell align="center" fixed="right">
                <div class="cell-wrapper">
                  <div class="action-icon" @click="toggle_menu(index)">⋮</div>
                  
                  <div v-if="active_menu_index === index" class="menu-wrapper">
                    <hlx-context-menu
                      :options="menu_options"
                      :data="order._id"
                      :show="true"
                      @chosen="handle_menu_choice"
                    />
                  </div>
                </div>
              </hlx-table-cell>            
            </tr>
            
            <tr v-if="filtered_orders.length === 0">
              <hlx-table-cell :colspan="active_columns.length + 2" align="center" style="padding: 20px; color: #6b7280;">
                No orders found matching "{{ search_key }}"
              </hlx-table-cell>
            </tr>
          </template>
        </hlx-table>
      </div>

      <!-- empty state -->
      <div v-else-if="orders.length === 0" class="empty-state-area">
        <div class="empty-content">
          <div class="icon-wrapper">
            <img src="../assets/no-table-icon.svg" class="empty-icon" alt="No orders">
          </div>
          <h2 class="empty-title">No Orders Yet</h2>
          <p class="empty-text">Click Create Order and enter your order information</p>
          <hlx-button class="primary" @click="is_form_open = true">
            <span class="btn-content">
              <img src="../assets/create-order-icon.svg" alt="create order" class="btn-icon">
              <span>Create Order</span>
            </span>
          </hlx-button>
        </div>
      </div>

      <!-- pagination footer -->
<div v-if="orders.length > 0" class="action-area">
  <hlx-pagination
    :key="pagination_key"
    :total="filtered_orders.length"
    :background="false"
    :show-page="current_page"
    :rows-per-page="String(rows_per_page)"
    :rows-per-page-list="['5', '10', '15']"
    @current-page="show_page"
    @updated:rows-per-page="handle_rows_per_page_change"
    enable-rows-per-page
    enable-go-to
  />
</div>

      <!-- modals -->
      <order_form 
        v-if="is_form_open" 
        @close="is_form_open = false" 
        @saved="handle_order_saved" 
      />

      <order_form 
        v-if="is_edit_open" 
        :key="selected_order ? selected_order._id : 'new'"
        :edit_data="selected_order"
        @close="is_edit_open = false" 
        @saved="handle_edit_saved" 
      />

      <delete_modal 
        v-if="is_delete_open" 
        :order_id="selected_order?.order_id || ''"        @close="is_delete_open = false"
        @confirm="confirm_delete"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import dashboard_black_icon from '../assets/dashborad-icon-black.svg' 
import table_green_icon from '../assets/table-icon-green.svg'

import order_form from '../components/order_form.vue'
import delete_modal from '../components/delete_modal.vue'

const router = useRouter()

const is_form_open=ref(false)
const is_edit_open=ref(false)
const is_delete_open=ref(false)
const selected_order=ref(null)
const orders=ref([])
const search_key=ref('')
const notification=ref({})

// pagination
const current_page = ref(1)
const rows_per_page = ref(10)
const pagination_key = ref(0)

const show_page = (page) => {
  current_page.value = Number(page)
}

const handle_rows_per_page_change = (value) => {
  rows_per_page.value = Number(value)
  current_page.value = 1

  // Reinitialize the component with the updated selection
  pagination_key.value++
}
// rearrange state
const re_arrange=ref(false)

// default columns (never modified)
const default_theads=[
  { prop: 'customer_id', label: 'Customer ID', width: 120, checked: true, disabled: false, resizable: true },
  { prop: 'customer_name', label: 'Customer name', width: 150, checked: true, disabled: false, resizable: true },
  { prop: 'email', label: 'Email id', width: 200, checked: true, disabled: false, resizable: true },
  { prop: 'phone', label: 'Phone number', width: 150, checked: true, disabled: false, resizable: true },
  { prop: 'address', label: 'Address', width: 250, checked: true, disabled: false, resizable: true },
  { prop: 'order_id', label: 'Order ID', width: 120, checked: true, disabled: false, resizable: true },
  { prop: 'createdAt', label: 'Order date', width: 180, checked: true, disabled: false, resizable: true },
  { prop: 'product', label: 'Product', width: 220, checked: true, disabled: false, resizable: true },
  { prop: 'quantity', label: 'Quantity', width: 100, checked: true, disabled: false, resizable: true, align: 'center' },
  { prop: 'unit_price', label: 'Unit price', width: 120, checked: true, disabled: false, resizable: true, align: 'center' },
  { prop: 'total_amount', label: 'Total amount', width: 130, checked: true, disabled: false, resizable: true, align: 'center' },
  { prop: 'status', label: 'Status', width: 130, checked: true, disabled: false, resizable: true },
  { prop: 'created_by', label: 'Created by', width: 180, checked: true, disabled: false, resizable: true }
]

// active columns (starts as default, replaced by saved prefs)
const theads=ref([...default_theads])

// only checked columns
const active_columns=computed(() => {
  return theads.value.filter(col => col.checked === true)
})

// save preferences (must be defined before apply_columns)
const save_preferences_db=async (updated_heads) => {
  try {
    const columns_to_save=updated_heads.map(col => ({
      prop: col.prop,
      label: col.label,
      checked: col.checked,
      disabled: col.disabled,
      width: col.width,
      align: col.align,
      resizable: col.resizable
    }))

    await axios.post('http://localhost:3000/api/preferences/save', {
      user_id: 'default_user',
      page: 'orders_table',
      columns: columns_to_save
    })

    console.log('Preferences saved successfully')
  } catch (err) {
    console.error('Failed to save preferences:', err)
  }
}

// load preferences (robust - handles partial saves)
const load_preferences_from_db=async()=>{
  try {
    const res=await axios.get('http://localhost:3000/api/preferences', {
      params: { user_id: 'default_user', page: 'orders_table' }
    })

    const saved_columns=res.data.columns || []

    if (saved_columns.length > 0) {
      // 1. Merge saved columns with their default configs
      const from_saved=saved_columns
        .map(saved => {
          const def_col=default_theads.find(d => d.prop === saved.prop)
          return def_col ? { ...def_col, ...saved } : null
        })
        .filter(Boolean)

      // 2. Find defaults that were NOT in saved_columns
      const saved_props = saved_columns.map(c => c.prop)
      const missing_defaults = default_theads.filter(d => !saved_props.includes(d.prop))

      // 3. Combine: saved first (in saved order), then missing defaults
      theads.value=[...from_saved, ...missing_defaults]
    }
    // If saved_columns is empty, theads stays as [...default_theads]
  } catch (err) {
    console.error('Failed to load preferences:', err)
  }
}

// open rearrange modal
const open_rearrange=()=>{
  re_arrange.value=true
}

// close modal
const arrange=(val)=>{
  re_arrange.value = val
}

// apply columns
const apply_columns=(updated_heads) => {
  theads.value=updated_heads
  re_arrange.value=false
  save_preferences_db(updated_heads)
}

// menu options
const menu_options=[
  { label: 'Edit', icon: 'icon-edit-regular' },
  { label: 'Delete', icon: 'icon-trash-regular' }
]

const active_menu_index=ref(-1)

const toggle_menu=(index)=> {
  active_menu_index.value = active_menu_index.value === index ? -1 : index
}

const handle_menu_choice=(action)=> {
  const clicked_index=active_menu_index.value
  const order=pagination_orders.value[clicked_index]
  
  active_menu_index.value= -1 
  selected_order.value=order

  if (action === 'Edit') {
    is_edit_open.value = false 
    setTimeout(()=>{ is_edit_open.value = true }, 50)
  } else if (action === 'Delete') {
    is_delete_open.value = false
    setTimeout(()=>{ is_delete_open.value = true }, 50)
  }
}

const confirm_delete=async () => {
  if (!selected_order.value) return

  try {
    await axios.delete(`http://localhost:3000/api/orders/${selected_order.value._id}`)
    is_delete_open.value=false
    fetch_orders()
    push_notification('Order deleted successfully')
  } catch (err) {
    console.log('Failed to delete:', err)
    alert('Failed to delete the order.')
  }
}

// get data
const fetch_orders=async ()=>{
  try {
    const response = await axios.get('http://localhost:3000/api/orders')
    orders.value = response.data
  } catch (err) {
    console.error("Failed to fetch orders:", err)
  }
}

const search=(key)=>{
  search_key.value = key
  current_page.value = 1
}

const push_notification=(message)=>{
  notification.value={ type: 'success', message: message }
}

const filtered_orders = computed(() => {
  if (!search_key.value) return orders.value

  const key = search_key.value.toLowerCase().trim()
  if (!key) return orders.value

  return orders.value.filter((order) => {
    
    const searchable_data = []

          // Search by actual customer and order IDs
        if (order.order_id) {
          searchable_data.push(order.order_id);
        }

        if (order.customer_id) {
          searchable_data.push(order.customer_id);
        }

    // customer name
    if (order.first_name || order.last_name) {
      searchable_data.push(`${order.first_name || ''} ${order.last_name || ''}`.trim());
    }

    // date
    if (order.createdAt) {
      const date = new Date(order.createdAt);
      searchable_data.push(date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
      searchable_data.push(date.toLocaleDateString()); 
    }

    // search throw all fiels
    Object.keys(order).forEach((field) => {
      const value = order[field]
      if (value === null || value === undefined) return

      // for nested handling of the phone 
      if (typeof value === 'object') {
        Object.values(value).forEach((inner) => {
          if (inner !== null && inner !== undefined) {
            searchable_data.push(String(inner))
          }
        })
        return
      }

      // for string and number
      searchable_data.push(String(value))
    })

    // check for the search key
    const combined_string = searchable_data.join(' ').toLowerCase()
    return combined_string.includes(key)
  })
})

const pagination_orders=computed(()=>{
  const start=(current_page.value - 1) * rows_per_page.value
  const end=start + rows_per_page.value
  return filtered_orders.value.slice(start, end)
})

const handle_order_saved=()=>{
  is_form_open.value = false
  fetch_orders()
  push_notification('Order created successfully')
}


const handle_edit_saved=()=>{
  is_edit_open.value = false
  fetch_orders()
  push_notification('Order updated successfully')
}

onMounted(()=>{
  fetch_orders()
  load_preferences_from_db()
})
</script>

<style scoped>
/* layout */
.page-container {
  background-color: #f3f4f6;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  box-sizing: border-box;
}

.content-card {
  background-color: #ffffff;
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.top-header {
  margin-bottom: 10px;
}

.page-title {
  font-family: 'Quicksand', sans-serif;
  font-size: 24px;
  color: #111827;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.page-subtitle {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* nav */
.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.tabs-area {
  display: flex;
  gap: 32px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab.active {
  color: #54BD95;
  border-bottom-color: #54BD95;
}

.tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.actions-area {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-bottom: 0px;
}

/* empty state */
.empty-state-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-wrapper {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.search-bar{
  bottom: -1px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.empty-title {
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-text {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* table area */
.table-area {
  flex: 1;
  overflow: visible !important;
}

.action-area {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  margin-top: 16px;
  /* border-top: 1px solid #e5e7eb; */
}

/* gear icon */
.action-gear {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.gear-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.gear-icon:hover {
  opacity: 1;
}

/* menu and icon */
.cell-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-wrapper {
  position: absolute;
  top: 0%;
  right: 150px;
  transform: translateY(-50%);
  z-index: 100;
}

.action-icon {
  font-size: 20px;
  font-weight: bold;
  color: #374151;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  transition: all 0.2s;
  user-select: none;
}

.action-icon:hover {
  background-color: #e6f9f0;
  color: #10b981;
}

/* status badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.completed {
  background: #e6f9f0;
  color: #10b981;
}

.status-badge.pending {
  background: #fef3c7;
  color: #f59e0b;
}

.status-badge.in-progress {
  background: #dbeafe;
  color: #3b82f6;
}

/* context menu overrides */
:deep(.hlx-context-menu) {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  padding: 8px 0 !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  min-width: 120px;
}

:deep(.hlx-context-menu-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px !important;
  font-family: 'Open Sans', sans-serif !important;
  font-size: 14px !important;
  color: #4b5563 !important;
  cursor: pointer;
}

:deep(.hlx-context-menu-item:hover) {
  background-color: #f3f4f6 !important;
  color: #111827 !important;
}
</style>