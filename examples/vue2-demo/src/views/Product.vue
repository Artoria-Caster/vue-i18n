<template>
  <div class="product-management">
    <h2>{{ $t('common.textb47k74') }}</h2>
    
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item :label="$t('common.textb40v0e')">
          <el-input v-model="filterForm.name" :placeholder="$t('common.textmf25uh')" />
        </el-form-item>
        <el-form-item :label="$t('common.textb40j3k')">
          <el-select v-model="filterForm.category" :placeholder="$t('common.text2ensyc')">
            <el-option :label="$t('common.textav9kmt')" value="" />
            <el-option :label="$t('common.textf5y9dh')" value="electronics" />
            <el-option :label="$t('common.textdkoe3u')" value="clothing" />
            <el-option :label="$t('common.textjna7u5')" value="food" />
            <el-option :label="$t('common.textbyi7fs')" value="home" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchProducts">{{ $t('common.query') }}</el-button>
          <el-button @click="resetFilter">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="content-card">
      <div class="toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="addProduct">{{ $t('common.texte7wb28') }}</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="batchDelete">{{ $t('common.textd0w7cq') }}</el-button>
      </div>

      <el-table :data="products" border stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" :label="$t('common.textb47z18')" width="100" />
        <el-table-column prop="name" :label="$t('common.textb40v0e')" width="200" />
        <el-table-column prop="category" :label="$t('common.textemut')" width="120">
          <template slot-scope="scope">
            {{ getCategoryName(scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" :label="$t('common.texte04l')" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" :label="$t('common.textgl5x')" width="100">
          <template slot-scope="scope">
            <span :style="{ color: scope.row.stock < 10 ? 'red' : 'inherit' }">
              {{ $t('common.textll871e', { stock: scope.row.stock }) }}
              <span v-if="scope.row.stock < 10">{{ $t('common.textutvr9m') }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" :label="$t('common.textq573')" width="100">
          <template slot-scope="scope">
            {{ $t('common.textr381g4', { sales: scope.row.sales }) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.action')" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="editProduct(scope.row)">{{ $t('common.edit') }}</el-button>
            <el-button type="text" @click="viewDetail(scope.row)">{{ $t('common.textdluvhh') }}</el-button>
            <el-button type="text" style="color: #f56c6c" @click="deleteProduct(scope.row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 商品详情对话框 -->
    <el-dialog ::title="$t('common.text3201o6')" :visible.sync="detailVisible" width="600px">
      <div class="product-detail" v-if="currentProduct">
        <p><strong>{{ $t('common.textainpfm') }}</strong>{{ currentProduct.id }}</p>
        <p><strong>{{ $t('common.textaos65g') }}</strong>{{ currentProduct.name }}</p>
        <p><strong>{{ $t('common.textap2ffa') }}</strong>{{ getCategoryName(currentProduct.category) }}</p>
        <p><strong>{{ $t('common.textapm006') }}</strong>¥{{ currentProduct.price }}</p>
        <p><strong>库存数量：</strong>{{ $t('common.textabrg44', { stock: currentProduct.stock }) }}</p>
        <p><strong>销售数量：</strong>{{ $t('common.textc0wddi', { sales: currentProduct.sales }) }}</p>
        <p><strong>商品描述：</strong>{{ $t('common.textlz2s1r') }}</p>
      </div>
      <div slot="footer">
        <el-button @click="detailVisible = false">{{ $t('common.texteod6') }}</el-button>
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
      { id: 'P001', name: this.$t('common.text1l8h93'), category: 'electronics', price: 7999, stock: 50, sales: 320 },
      { id: 'P002', name: this.$t('common.text3v4pvu'), category: 'electronics', price: 5999, stock: 8, sales: 150 },
      { id: 'P003', name: this.$t('common.textecs6mw'), category: 'clothing', price: 599, stock: 120, sales: 580 },
      { id: 'P004', name: this.$t('common.textyu7j5k'), category: 'food', price: 49.9, stock: 200, sales: 1200 },
      { id: 'P005', name: this.$t('common.textbxx75e'), category: 'home', price: 2999, stock: 15, sales: 45 }],

      detailVisible: false,
      currentProduct: {}
    };
  },
  methods: {
    getCategoryName(category) {
      const categoryMap = {
        'electronics': this.$t('common.textf5y9dh'),
        'clothing': this.$t('common.textdkoe3u'),
        'food': this.$t('common.textjna7u5'),
        'home': this.$t('common.textbyi7fs')
      };
      return categoryMap[category] || this.$t('common.textfim73');
    },
    searchProducts() {
      console.log(this.$t('common.textim92pz'), this.filterForm);
      this.$message.success(this.$t('common.textdopkh8'));
    },
    resetFilter() {
      this.filterForm = { name: '', category: '' };
      this.$message.info(this.$t('common.textmarv62'));
    },
    addProduct() {
      this.$prompt(this.$t('common.textmf25uh'), this.$t('common.texte7wb28'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        inputPattern: /.+/,
        inputErrorMessage: this.$t('common.text8gvbw2')
      }).then(({ value }) => {
        this.$message.success(this.$t('common.text174a8a', { value: value }));
      }).catch(() => {
        this.$message.info(this.$t('common.textn7cesp'));
      });
    },
    editProduct(row) {
      this.$message.info(this.$t('common.textohz7l1', { name: row.name }));
    },
    viewDetail(row) {
      this.currentProduct = row;
      this.detailVisible = true;
    },
    deleteProduct(row) {
      this.$confirm(this.$t('common.texth1c3ol', { name: row.name }), this.$t('common.textazilh6'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.textazeh8z'));
      }).catch(() => {
        this.$message.info(this.$t('common.textn781m0'));
      });
    },
    batchDelete() {
      this.$message.warning(this.$t('common.text2wmks5'));
    }
  },
  mounted() {
    console.log(this.$t('common.textdefmq'));
  }
};</script>

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
