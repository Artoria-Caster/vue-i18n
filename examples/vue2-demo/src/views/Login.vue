<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>{{ $t('common.texto63gaq') }}</h1>
        <p>{{ $t('common.texte434me') }}</p>
      </div>

      <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('common.text7grhuz')"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('common.text2j9vj0')"
            prefix-icon="el-icon-lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">{{ $t('common.texthyc3iy') }}</el-checkbox>
          <el-button type="text" style="float: right;">{{ $t('common.textxfgztg') }}</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">
            {{ loading ? $t('common.textuvxwv9') : $t('common.login') }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>还没有账号？<el-button type="text">{{ $t('common.textfub0ks') }}</el-button></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      rules: {
        username: [
        { required: true, message: this.$t('common.text7grhuz'), trigger: 'blur' },
        { min: 3, max: 20, message: this.$t('common.textc9ntcr'), trigger: 'blur' }],

        password: [
        { required: true, message: this.$t('common.text2j9vj0'), trigger: 'blur' },
        { min: 6, message: this.$t('common.textsua2re'), trigger: 'blur' }]

      },
      loading: false
    };
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;

          // 模拟登录
          setTimeout(() => {
            this.loading = false;

            if (this.loginForm.username === 'admin' && this.loginForm.password === '123456') {
              this.$store.dispatch('login', {
                id: 1,
                username: this.loginForm.username,
                realName: this.$t('common.textio38z'),
                role: 'admin'
              });

              this.$message.success(this.$t('common.texty2hfit'));
              this.$router.push('/');
            } else {
              this.$message.error(this.$t('common.textxqw8ho'));
            }
          }, 1000);
        } else {
          this.$message.warning(this.$t('common.text2dttlr'));
          return false;
        }
      });
    }
  },
  mounted() {
    console.log(this.$t('common.text8bpx08'));
  }
};</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 28px;
}

.login-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}
</style>
