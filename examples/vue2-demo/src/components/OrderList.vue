<template>
  <div class="order-list">
    <el-table :data="orders" border stripe>
      <el-table-column prop="id" label="订单号" width="150" />
      <el-table-column prop="customer" label="客户姓名" width="120" />
      <el-table-column prop="product" label="商品名称" width="200" />
      <el-table-column prop="amount" label="订单金额" width="120">
        <template slot-scope="scope">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button 
            v-if="scope.row.status === 'pending'" 
            type="text" 
            @click="handlePay(scope.row)"
          >
            立即支付
          </el-button>
          <el-button type="text" @click="viewOrderDetail(scope.row)">查看详情</el-button>
          <el-button 
            v-if="scope.row.status === 'pending'" 
            type="text" 
            style="color: #f56c6c" 
            @click="cancelOrder(scope.row)"
          >
            取消订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="orders.length === 0" class="empty-state">
      <p>暂无订单数据</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderList',
  props: {
    orders: {
      type: Array,
      default: () => []
    },
    statusFilter: {
      type: String,
      default: 'all'
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        'pending': '待支付',
        'completed': '已完成',
        'cancelled': '已取消',
        'processing': '处理中'
      };
      return statusMap[status] || '未知状态';
    },
    getStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'completed': 'success',
        'cancelled': 'info',
        'processing': 'primary'
      };
      return typeMap[status] || 'info';
    },
    handlePay(row) {
      this.$confirm(`确认支付订单"${row.id}"，金额为¥${row.amount}？`, '支付确认', {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success(`订单"${row.id}"支付成功`);
        row.status = 'completed';
      }).catch(() => {
        this.$message.info('已取消支付');
      });
    },
    viewOrderDetail(row) {
      this.$alert(`
        订单号：${row.id}
        客户姓名：${row.customer}
        商品名称：${row.product}
        订单金额：¥${row.amount}
        订单状态：${this.getStatusText(row.status)}
        下单时间：${row.createTime}
        备注信息：${row.remark || '无'}
      `, '订单详情', {
        confirmButtonText: '关闭'
      });
    },
    cancelOrder(row) {
      this.$confirm(`确定要取消订单"${row.id}"吗？`, '取消订单确认', {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning'
      }).then(() => {
        this.$message.success(`订单"${row.id}"已取消`);
        row.status = 'cancelled';
      }).catch(() => {
        this.$message.info('操作已取消');
      });
    }
  }
};
</script>

<style scoped>
.order-list {
  padding: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  color: #909399;
  font-size: 14px;
}
</style>
