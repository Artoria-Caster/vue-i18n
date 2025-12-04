<template>
  <div class="order-management">
    <h2>订单管理</h2>

    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部订单" name="all">
        <order-list :orders="allOrders" :status-filter="'all'" />
      </el-tab-pane>
      <el-tab-pane label="待支付" name="pending">
        <order-list :orders="pendingOrders" :status-filter="'pending'" />
      </el-tab-pane>
      <el-tab-pane label="已完成" name="completed">
        <order-list :orders="completedOrders" :status-filter="'completed'" />
      </el-tab-pane>
      <el-tab-pane label="已取消" name="cancelled">
        <order-list :orders="cancelledOrders" :status-filter="'cancelled'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import OrderList from '../components/OrderList.vue';

export default {
  name: 'OrderManagement',
  components: {
    OrderList
  },
  data() {
    return {
      activeTab: 'all',
      allOrders: [
        { 
          id: 'ORD20240115001', 
          customer: '张三', 
          product: '苹果iPhone 15 Pro', 
          amount: 7999, 
          status: 'pending', 
          createTime: '2024-01-15 10:30:00',
          remark: '请尽快发货'
        },
        { 
          id: 'ORD20240115002', 
          customer: '李四', 
          product: '华为MateBook笔记本', 
          amount: 5999, 
          status: 'completed', 
          createTime: '2024-01-14 15:20:00',
          remark: '客户要求包邮'
        },
        { 
          id: 'ORD20240115003', 
          customer: '王五', 
          product: '耐克运动鞋', 
          amount: 599, 
          status: 'cancelled', 
          createTime: '2024-01-13 09:15:00',
          remark: '客户主动取消'
        }
      ]
    };
  },
  computed: {
    pendingOrders() {
      return this.allOrders.filter(order => order.status === 'pending');
    },
    completedOrders() {
      return this.allOrders.filter(order => order.status === 'completed');
    },
    cancelledOrders() {
      return this.allOrders.filter(order => order.status === 'cancelled');
    }
  },
  methods: {
    handleTabClick(tab) {
      console.log(`切换到${tab.label}标签页`);
    }
  },
  mounted() {
    console.log('订单管理页面加载完成');
    this.$message.info(`当前共有${this.allOrders.length}个订单`);
  }
};
</script>

<style scoped>
.order-management {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style>
