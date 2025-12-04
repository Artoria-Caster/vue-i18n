<template>
  <div id="app">
    <div class="header">
      <h1>{{ $t('common.texto63gaq') }}</h1>
      <div class="user-info">
        <span>{{ $t('common.textzhuakq', { username: username }) }}</span>
        <el-button type="text" @click="handleLogout">{{ $t('common.textiifi5w') }}</el-button>
      </div>
    </div>
    
    <div class="nav-menu">
      <router-link to="/">{{ $t('common.home') }}</router-link>
      <router-link to="/user">{{ $t('common.textf6y6dw') }}</router-link>
      <router-link to="/product">{{ $t('common.textb47k74') }}</router-link>
      <router-link to="/order">{{ $t('common.texthytrqw') }}</router-link>
      <router-link to="/settings">{{ $t('common.textgar1ro') }}</router-link>
    </div>
    
    <div class="main-content">
      <router-view/>
    </div>
    
    <div class="footer">
      <p>{{ $t('common.text5hishd') }}</p>
      <p>{{ $t('common.textkxuord') }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      username: this.$t('common.textglwp'),
      appTitle: this.$t('common.texto63gaq'),
      version: 'v1.0.0'
    };
  },
  methods: {
    handleLogout() {
      this.$confirm(this.$t('common.textpjs3rj'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.textiibymh'));
        this.$router.push('/login');
      }).catch(() => {
        this.$message.info(this.$t('common.textn7i6zi'));
      });
    }
  },
  mounted() {
    console.log(this.$t('common.textpztg5b'));
    console.log(`当前版本：${this.version}`);
  }
};</script>

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
