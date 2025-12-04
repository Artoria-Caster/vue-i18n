<template>
  <div id="app">
    <div class="header">
      <h1>企业管理系统</h1>
      <div class="user-info">
        <span>欢迎，{{ username }}</span>
        <el-button type="text" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    
    <div class="nav-menu">
      <router-link to="/">首页</router-link>
      <router-link to="/user">用户管理</router-link>
      <router-link to="/product">商品管理</router-link>
      <router-link to="/order">订单管理</router-link>
      <router-link to="/settings">系统设置</router-link>
    </div>
    
    <div class="main-content">
      <router-view/>
    </div>
    
    <div class="footer">
      <p>版权所有 © 2024 企业管理系统</p>
      <p>技术支持：开发团队</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      username: '张三',
      appTitle: '企业管理系统',
      version: 'v1.0.0'
    };
  },
  methods: {
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('退出成功');
        this.$router.push('/login');
      }).catch(() => {
        this.$message.info('已取消退出');
      });
    }
  },
  mounted() {
    console.log('应用已加载完成');
    console.log(`当前版本：${this.version}`);
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: "Microsoft YaHei", Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #409eff;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info .el-button {
  color: white;
}

.nav-menu {
  background: #f5f5f5;
  padding: 15px 20px;
  display: flex;
  gap: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.nav-menu a {
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  background: #409eff;
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #fafafa;
}

.footer {
  background: #333;
  color: white;
  padding: 20px;
  text-align: center;
}

.footer p {
  margin: 5px 0;
}
</style>
