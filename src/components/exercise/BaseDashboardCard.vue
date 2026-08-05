<template>
  <div class="base-dashboard-card">
    <!-- 이름 있는 Slot -->
    <div class="card-header">
      <slot name="header"></slot>
    </div>

    <!-- 기본 Slot -->
    <div class="card-body">
      <slot></slot>
    </div>

    <!-- 이름 있는 Slot -->
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.base-dashboard-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
}

.card-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.card-footer {
  margin-top: 10px;
  font-size: 13px;
  color: #777;
}
</style>
