<template>
  <div class="product-management">
    <h2>商品管理</h2>
    
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="商品名称">
          <el-input v-model="filterForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="filterForm.category" placeholder="请选择分类">
            <el-option label="全部分类" value="" />
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装鞋帽" value="clothing" />
            <el-option label="食品饮料" value="food" />
            <el-option label="家居用品" value="home" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchProducts">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="content-card">
      <div class="toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="addProduct">添加商品</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
      </div>

      <el-table :data="products" border stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="商品编号" width="100" />
        <el-table-column prop="name" label="商品名称" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            {{ getCategoryName(scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template slot-scope="scope">
            <span :style="{ color: scope.row.stock < 10 ? 'red' : 'inherit' }">
              {{ scope.row.stock }}件
              <span v-if="scope.row.stock < 10">（库存不足）</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100">
          <template slot-scope="scope">
            {{ scope.row.sales }}件
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="editProduct(scope.row)">编辑</el-button>
            <el-button type="text" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button type="text" style="color: #f56c6c" @click="deleteProduct(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 商品详情对话框 -->
    <el-dialog :title="`商品详情 - ${currentProduct.name}`" :visible.sync="detailVisible" width="600px">
      <div class="product-detail" v-if="currentProduct">
        <p><strong>商品编号：</strong>{{ currentProduct.id }}</p>
        <p><strong>商品名称：</strong>{{ currentProduct.name }}</p>
        <p><strong>商品分类：</strong>{{ getCategoryName(currentProduct.category) }}</p>
        <p><strong>商品价格：</strong>¥{{ currentProduct.price }}</p>
        <p><strong>库存数量：</strong>{{ currentProduct.stock }}件</p>
        <p><strong>销售数量：</strong>{{ currentProduct.sales }}件</p>
        <p><strong>商品描述：</strong>这是一个优质的商品，质量保证，值得购买！</p>
      </div>
      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProductManagement',
  data() {
    return {
      filterForm: {
        name: '',
        category: ''
      },
      products: [
        { id: 'P001', name: '苹果iPhone 15 Pro', category: 'electronics', price: 7999, stock: 50, sales: 320 },
        { id: 'P002', name: '华为MateBook笔记本', category: 'electronics', price: 5999, stock: 8, sales: 150 },
        { id: 'P003', name: '耐克运动鞋', category: 'clothing', price: 599, stock: 120, sales: 580 },
        { id: 'P004', name: '蒙牛纯牛奶', category: 'food', price: 49.9, stock: 200, sales: 1200 },
        { id: 'P005', name: '宜家沙发', category: 'home', price: 2999, stock: 15, sales: 45 }
      ],
      detailVisible: false,
      currentProduct: {}
    };
  },
  methods: {
    getCategoryName(category) {
      const categoryMap = {
        'electronics': '电子产品',
        'clothing': '服装鞋帽',
        'food': '食品饮料',
        'home': '家居用品'
      };
      return categoryMap[category] || '未分类';
    },
    searchProducts() {
      console.log('搜索商品：', this.filterForm);
      this.$message.success('查询成功');
    },
    resetFilter() {
      this.filterForm = { name: '', category: '' };
      this.$message.info('已重置筛选条件');
    },
    addProduct() {
      this.$prompt('请输入商品名称', '添加商品', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '商品名称不能为空'
      }).then(({ value }) => {
        this.$message.success(`商品"${value}"添加成功`);
      }).catch(() => {
        this.$message.info('已取消添加');
      });
    },
    editProduct(row) {
      this.$message.info(`编辑商品：${row.name}`);
    },
    viewDetail(row) {
      this.currentProduct = row;
      this.detailVisible = true;
    },
    deleteProduct(row) {
      this.$confirm(`确定要删除商品"${row.name}"吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    batchDelete() {
      this.$message.warning('请先选择要删除的商品');
    }
  },
  mounted() {
    console.log('商品管理页面已加载');
  }
};
</script>

<style scoped>
.product-management {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.filter-card,
.content-card {
  margin-bottom: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.product-detail p {
  margin: 15px 0;
  font-size: 14px;
  line-height: 1.8;
}
</style>
