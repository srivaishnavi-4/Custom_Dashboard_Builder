<template>
  <div class="modal-overlay">
    <div class="delete-modal">
      
      <!-- Header -->
      <div class="modal-header">
        <h3>Delete</h3>
        <button class="close-btn" @click="$emit('close')">
          <img src="../assets/close.svg" alt="close" class="close-icon">
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <p>Are you sure you want to delete the <strong>{{ order_id }}</strong>?</p>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <hlx-button @click.native="$emit('close')">Cancel</hlx-button>
        <hlx-button class="primary" @click.native="$emit('confirm')">Delete</hlx-button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  order_id: String
})
defineEmits(['close', 'confirm'])
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}


.delete-modal {
  background: white;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
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

.close-icon {
  width: 14px;
  height: 14px;
}

.modal-body {
  padding: 24px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #374151;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fafafa;
}
</style>