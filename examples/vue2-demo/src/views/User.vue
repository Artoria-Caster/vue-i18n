<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增用户</el-button>
        <el-button type="success" icon="el-icon-download" @click="handleExport">导出Excel</el-button>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
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
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱地址" width="180" />
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleResetPassword(scope.row)">重置密码</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="admin" />
            <el-option label="普通管理员" value="manager" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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
      dialogTitle: '新增用户',
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
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    loadData() {
      this.loading = true;
      // 模拟数据
      setTimeout(() => {
        this.tableData = [
          { id: 1, username: 'admin', realName: '张三', phone: '13800138000', email: 'admin@example.com', role: 'admin', status: 1, createTime: '2024-01-01 10:00:00' },
          { id: 2, username: 'manager01', realName: '李四', phone: '13800138001', email: 'manager@example.com', role: 'manager', status: 1, createTime: '2024-01-02 11:00:00' },
          { id: 3, username: 'user01', realName: '王五', phone: '13800138002', email: 'user01@example.com', role: 'user', status: 1, createTime: '2024-01-03 12:00:00' },
          { id: 4, username: 'user02', realName: '赵六', phone: '13800138003', email: 'user02@example.com', role: 'user', status: 0, createTime: '2024-01-04 13:00:00' }
        ];
        this.total = 4;
        this.loading = false;
      }, 500);
    },
    getRoleText(role) {
      const roleMap = {
        'admin': '超级管理员',
        'manager': '普通管理员',
        'user': '普通用户'
      };
      return roleMap[role] || '未知角色';
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
      console.log('搜索条件：', this.searchForm);
      this.$message.success('搜索成功');
      this.loadData();
    },
    handleReset() {
      this.searchForm = {
        username: '',
        phone: '',
        status: ''
      };
      this.$message.info('已重置搜索条件');
      this.loadData();
    },
    handleAdd() {
      this.dialogTitle = '新增用户';
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
      this.dialogTitle = '编辑用户';
      this.dialogVisible = true;
      this.form = { ...row };
      this.$message.info(`正在编辑用户：${row.username}`);
    },
    handleDelete(row) {
      this.$confirm(`确定要删除用户"${row.realName}"吗？此操作不可恢复！`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success(`用户"${row.realName}"已删除`);
        this.loadData();
      }).catch(() => {
        this.$message.info('已取消删除操作');
      });
    },
    handleResetPassword(row) {
      this.$confirm(`确定要重置用户"${row.realName}"的密码吗？`, '重置密码确认', {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('密码重置成功，新密码为：123456');
      }).catch(() => {
        this.$message.info('已取消重置密码');
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$message.success('保存成功');
          this.dialogVisible = false;
          this.loadData();
        } else {
          this.$message.error('表单验证失败，请检查输入');
          return false;
        }
      });
    },
    handleExport() {
      this.$message.success('导出Excel功能开发中');
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
    console.log('用户管理页面加载完成');
  }
};
</script>

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
