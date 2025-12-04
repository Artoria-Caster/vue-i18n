<template>
  <div class="order-management">
    <h2>{{ $t('common.texthytrqw') }}</h2>

    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane :label="$t('common.textavj59v')" name="all">
        <order-list :orders="allOrders" :status-filter="'all'" />
      </el-tab-pane>
      <el-tab-pane :label="$t('common.textehbda')" name="pending">
        <order-list :orders="pendingOrders" :status-filter="'pending'" />
      </el-tab-pane>
      <el-tab-pane :label="$t('common.texte7hbq')" name="completed">
        <order-list :orders="completedOrders" :status-filter="'completed'" />
      </el-tab-pane>
      <el-tab-pane :label="$t('common.texte68dg')" name="cancelled">
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
        customer: this.$t('common.textglwp'),
        product: this.$t('common.text1l8h93'),
        amount: 7999,
        status: 'pending',
        createTime: '2024-01-15 10:30:00',
        remark: this.$t('common.text8ya0qt')
      },
      {
        id: 'ORD20240115002',
        customer: this.$t('common.texti1ql'),
        product: this.$t('common.text3v4pvu'),
        amount: 5999,
        status: 'completed',
        createTime: '2024-01-14 15:20:00',
        remark: this.$t('common.text1jz0ov')
      },
      {
        id: 'ORD20240115003',
        customer: this.$t('common.textk31l'),
        product: this.$t('common.textecs6mw'),
        amount: 599,
        status: 'cancelled',
        createTime: '2024-01-13 09:15:00',
        remark: this.$t('common.text60x030')
      }]

    };
  },
  computed: {
    pendingOrders() {
      return this.allOrders.filter((order) => order.status === 'pending');
    },
    completedOrders() {
      return this.allOrders.filter((order) => order.status === 'completed');
    },
    cancelledOrders() {
      return this.allOrders.filter((order) => order.status === 'cancelled');
    }
  },
  methods: {
    handleTabClick(tab) {
      console.log(`切换到${tab.label}标签页`);
    }
  },
  mounted() {
    console.log(this.$t('common.textro8hay'));
    this.$message.info(this.$t('common.textbyl2cx', { length: this.allOrders.length }));
  }
};</script>

<style scoped>
.order-management {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style>
