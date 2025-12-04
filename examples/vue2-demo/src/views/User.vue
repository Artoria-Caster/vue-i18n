<template>
  <div class="user-management">
    <div class="page-header">
      <h2>{{ $t('common.textf6y6dw') }}</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">{{ $t('common.textd79ta5') }}</el-button>
        <el-button type="success" icon="el-icon-download" @click="handleExport">{{ $t('common.textd2ujhj') }}</el-button>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('common.texthmxge')">
          <el-input v-model="searchForm.username" :placeholder="$t('common.text7grhuz')" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.textewbd4')">
          <el-input v-model="searchForm.phone" :placeholder="$t('common.text7ji3y9')" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select v-model="searchForm.status" :placeholder="$t('common.text2eief2')" clearable>
            <el-option :label="$t('common.texten40')" value="" />
            <el-option :label="$t('common.normal')" value="1" />
            <el-option :label="$t('common.disabled')" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        border
        stripe
        v-loading="loading"
        :loading-text="`正在加载数据...`"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" :label="$t('common.textf6ck8a')" width="80" />
        <el-table-column prop="username" :label="$t('common.texthmxge')" width="120" />
        <el-table-column prop="realName" :label="$t('common.textfeqn21')" width="100" />
        <el-table-column prop="phone" :label="$t('common.textewbd4')" width="120" />
        <el-table-column prop="email" :label="$t('common.textirh79v')" width="180" />
        <el-table-column prop="role" :label="$t('common.texto5pc')" width="100">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('common.status')" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? $t('common.normal') : $t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('common.textar84e5')" width="160" />
        <el-table-column :label="$t('common.action')" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</el-button>
            <el-button type="text" size="small" @click="handleResetPassword(scope.row)">{{ $t('common.textix54os') }}</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item :label="$t('common.texthmxge')" prop="username">
          <el-input v-model="form.username" :placeholder="$t('common.text7grhuz')" />
        </el-form-item>
        <el-form-item :label="$t('common.textfeqn21')" prop="realName">
          <el-input v-model="form.realName" :placeholder="$t('common.texti4cdsu')" />
        </el-form-item>
        <el-form-item :label="$t('common.textewbd4')" prop="phone">
          <el-input v-model="form.phone" :placeholder="$t('common.text7ji3y9')" />
        </el-form-item>
        <el-form-item :label="$t('common.textirh79v')" prop="email">
          <el-input v-model="form.email" :placeholder="$t('common.texterltl0')" />
        </el-form-item>
        <el-form-item :label="$t('common.texto5pc')" prop="role">
          <el-select v-model="form.role" :placeholder="$t('common.text2eea3t')">
            <el-option :label="$t('common.text1l0s4x')" value="admin" />
            <el-option :label="$t('common.text6zrzax')" value="manager" />
            <el-option :label="$t('common.textdirp8b')" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ $t('common.normal') }}</el-radio>
            <el-radio :label="0">{{ $t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      searchForm: {
        username: '',
        phone: '',
        status: ''
      },
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: this.$t('common.textd79ta5'),
      form: {
        username: '',
        realName: '',
        phone: '',
        email: '',
        role: 'user',
        status: 1
      },
      rules: {
        username: [
        { required: true, message: this.$t('common.text7grhuz'), trigger: 'blur' },
        { min: 3, max: 20, message: this.$t('common.textc9ntcr'), trigger: 'blur' }],

        realName: [
        { required: true, message: this.$t('common.texti4cdsu'), trigger: 'blur' }],

        phone: [
        { required: true, message: this.$t('common.text7ji3y9'), trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: this.$t('common.textve0m7x'), trigger: 'blur' }],

        email: [
        { required: true, message: this.$t('common.texterltl0'), trigger: 'blur' },
        { type: 'email', message: this.$t('common.textvenleq'), trigger: 'blur' }]

      }
    };
  },
  methods: {
    loadData() {
      this.loading = true;
      // 模拟数据
      setTimeout(() => {
        this.tableData = [
        { id: 1, username: 'admin', realName: this.$t('common.textglwp'), phone: '13800138000', email: 'admin@example.com', role: 'admin', status: 1, createTime: '2024-01-01 10:00:00' },
        { id: 2, username: 'manager01', realName: this.$t('common.texti1ql'), phone: '13800138001', email: 'manager@example.com', role: 'manager', status: 1, createTime: '2024-01-02 11:00:00' },
        { id: 3, username: 'user01', realName: this.$t('common.textk31l'), phone: '13800138002', email: 'user01@example.com', role: 'user', status: 1, createTime: '2024-01-03 12:00:00' },
        { id: 4, username: 'user02', realName: this.$t('common.textoiag'), phone: '13800138003', email: 'user02@example.com', role: 'user', status: 0, createTime: '2024-01-04 13:00:00' }];

        this.total = 4;
        this.loading = false;
      }, 500);
    },
    getRoleText(role) {
      const roleMap = {
        'admin': this.$t('common.text1l0s4x'),
        'manager': this.$t('common.text6zrzax'),
        'user': this.$t('common.textdirp8b')
      };
      return roleMap[role] || this.$t('common.textdinsij');
    },
    getRoleType(role) {
      const typeMap = {
        'admin': 'danger',
        'manager': 'warning',
        'user': 'info'
      };
      return typeMap[role] || 'info';
    },
    handleSearch() {
      console.log(this.$t('common.textijmla9'), this.searchForm);
      this.$message.success(this.$t('common.textd5d28l'));
      this.loadData();
    },
    handleReset() {
      this.searchForm = {
        username: '',
        phone: '',
        status: ''
      };
      this.$message.info(this.$t('common.textpb3eaa'));
      this.loadData();
    },
    handleAdd() {
      this.dialogTitle = this.$t('common.textd79ta5');
      this.dialogVisible = true;
      this.form = {
        username: '',
        realName: '',
        phone: '',
        email: '',
        role: 'user',
        status: 1
      };
    },
    handleEdit(row) {
      this.dialogTitle = this.$t('common.textgmn8ui');
      this.dialogVisible = true;
      this.form = { ...row };
      this.$message.info(this.$t('common.textsurxk9', { username: row.username }));
    },
    handleDelete(row) {
      this.$confirm(this.$t('common.texthade14', { realName: row.realName }), this.$t('common.textazilh6'), {
        confirmButtonText: this.$t('common.textfknink'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.textye862o', { realName: row.realName }));
        this.loadData();
      }).catch(() => {
        this.$message.info(this.$t('common.text7v4n1l'));
      });
    },
    handleResetPassword(row) {
      this.$confirm(this.$t('common.text8dbp2d', { realName: row.realName }), this.$t('common.text16an7y'), {
        confirmButtonText: this.$t('common.textfky819'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.textx6jcj1'));
      }).catch(() => {
        this.$message.info(this.$t('common.text2lk9s'));
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$message.success(this.$t('common.textaghf56'));
          this.dialogVisible = false;
          this.loadData();
        } else {
          this.$message.error(this.$t('common.textx6g2vc'));
          return false;
        }
      });
    },
    handleExport() {
      this.$message.success(this.$t('common.textqmqgjp'));
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadData();
    }
  },
  mounted() {
    this.loadData();
    console.log(this.$t('common.textyebr0e'));
  }
};</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
</style>
