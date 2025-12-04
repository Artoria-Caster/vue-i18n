<template>
  <div class="order-list">
    <el-table :data="orders" border stripe>
      <el-table-column prop="id" :label="$t('common.textkuwys')" width="150" />
      <el-table-column prop="customer" :label="$t('common.textbyw4rz')" width="120" />
      <el-table-column prop="product" :label="$t('common.textb40v0e')" width="200" />
      <el-table-column prop="amount" :label="$t('common.texthyxqu7')" width="120">
        <template slot-scope="scope">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('common.texthys56m')" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="$t('common.texta72nl4')" width="180" />
      <el-table-column :label="$t('common.action')" width="250">
        <template slot-scope="scope">
          <el-button 
            v-if="scope.row.status === 'pending'" 
            type="text" 
            @click="handlePay(scope.row)"
          >{{ $t('common.textfu9or5') }}</el-button>
          <el-button type="text" @click="viewOrderDetail(scope.row)">{{ $t('common.textdluvhh') }}</el-button>
          <el-button 
            v-if="scope.row.status === 'pending'" 
            type="text" 
            style="color: #f56c6c" 
            @click="cancelOrder(scope.row)"
          >{{ $t('common.textb1drz9') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="orders.length === 0" class="empty-state">
      <p>{{ $t('common.textfefj1t') }}</p>
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
        'pending': this.$t('common.textehbda'),
        'completed': this.$t('common.texte7hbq'),
        'cancelled': this.$t('common.texte68dg'),
        'processing': this.$t('common.textdljhn')
      };
      return statusMap[status] || this.$t('common.textdijo7a');
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
      this.$confirm(this.$t('common.text9kxibn', { id: row.id, amount: row.amount }), this.$t('common.textd3koxr'), {
        confirmButtonText: this.$t('common.textfrrocf'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.text7xozi4', { id: row.id }));
        row.status = 'completed';
      }).catch(() => {
        this.$message.info(this.$t('common.textn7aw6l'));
      });
    },
    viewOrderDetail(row) {
      this.$alert(this.$t('common.text4ffl6f', { id: row.id, customer: row.customer, product: row.product, amount: row.amount, expr4: this.getStatusText(row.status), createTime: row.createTime, expr6: row.remark || this.$t('common.textk4g') }), this.$t('common.texthywfki'),







      {
        confirmButtonText: this.$t('common.texteod6')
      });
    },
    cancelOrder(row) {
      this.$confirm(this.$t('common.texteakqhx', { id: row.id }), this.$t('common.textobkyor'), {
        confirmButtonText: this.$t('common.textfknl26'),
        cancelButtonText: this.$t('common.back'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.textmmmghk', { id: row.id }));
        row.status = 'cancelled';
      }).catch(() => {
        this.$message.info(this.$t('common.textlniy7f'));
      });
    }
  }
};</script>

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
