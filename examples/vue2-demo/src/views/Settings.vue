<template>
  <div class="settings-page">
    <h2>系统设置</h2>

    <el-card class="settings-card">
      <el-tabs tab-position="left">
        <el-tab-pane label="基本设置">
          <div class="settings-section">
            <h3>基本信息</h3>
            <el-form :model="basicSettings" label-width="120px">
              <el-form-item label="系统名称">
                <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
              </el-form-item>
              <el-form-item label="系统版本">
                <el-input v-model="basicSettings.version" disabled />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="basicSettings.phone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="联系邮箱">
                <el-input v-model="basicSettings.email" placeholder="请输入联系邮箱" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
                <el-button @click="resetBasicSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="安全设置">
          <div class="settings-section">
            <h3>安全配置</h3>
            <el-form :model="securitySettings" label-width="150px">
              <el-form-item label="密码最小长度">
                <el-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" />
                <span class="form-tip">建议设置为8位以上</span>
              </el-form-item>
              <el-form-item label="登录失败次数限制">
                <el-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" />
                <span class="form-tip">超过此次数将锁定账号</span>
              </el-form-item>
              <el-form-item label="会话超时时间">
                <el-input-number v-model="securitySettings.sessionTimeout" :min="5" :max="120" />
                <span class="form-tip">单位：分钟</span>
              </el-form-item>
              <el-form-item label="启用双因素认证">
                <el-switch v-model="securitySettings.twoFactorAuth" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="通知设置">
          <div class="settings-section">
            <h3>通知配置</h3>
            <el-form :model="notificationSettings" label-width="150px">
              <el-form-item label="邮件通知">
                <el-switch v-model="notificationSettings.emailEnabled" />
                <span class="form-tip">开启后将接收邮件通知</span>
              </el-form-item>
              <el-form-item label="短信通知">
                <el-switch v-model="notificationSettings.smsEnabled" />
                <span class="form-tip">开启后将接收短信通知</span>
              </el-form-item>
              <el-form-item label="系统消息">
                <el-switch v-model="notificationSettings.systemMessageEnabled" />
              </el-form-item>
              <el-form-item label="通知方式">
                <el-checkbox-group v-model="notificationSettings.methods">
                  <el-checkbox label="order">订单通知</el-checkbox>
                  <el-checkbox label="system">系统通知</el-checkbox>
                  <el-checkbox label="promotion">促销通知</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="关于系统">
          <div class="settings-section">
            <h3>系统信息</h3>
            <div class="about-info">
              <p><strong>系统名称：</strong>企业管理系统</p>
              <p><strong>当前版本：</strong>v1.0.0</p>
              <p><strong>发布日期：</strong>2024年1月15日</p>
              <p><strong>开发团队：</strong>技术研发部</p>
              <p><strong>技术支持：</strong>support@example.com</p>
              <p><strong>官方网站：</strong>https://www.example.com</p>
              <div class="update-check">
                <el-button type="primary" @click="checkUpdate">检查更新</el-button>
                <span class="update-status">当前已是最新版本</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      basicSettings: {
        systemName: '企业管理系统',
        version: 'v1.0.0',
        phone: '400-888-8888',
        email: 'support@example.com'
      },
      securitySettings: {
        minPasswordLength: 8,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        twoFactorAuth: false
      },
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: false,
        systemMessageEnabled: true,
        methods: ['order', 'system']
      }
    };
  },
  methods: {
    saveBasicSettings() {
      this.$message.success('基本设置保存成功');
    },
    resetBasicSettings() {
      this.$confirm('确定要重置基本设置吗？', '重置确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.basicSettings = {
          systemName: '企业管理系统',
          version: 'v1.0.0',
          phone: '400-888-8888',
          email: 'support@example.com'
        };
        this.$message.success('已重置为默认设置');
      }).catch(() => {
        this.$message.info('已取消重置');
      });
    },
    saveSecuritySettings() {
      this.$message.success('安全设置保存成功');
      console.log('安全设置已更新：', this.securitySettings);
    },
    saveNotificationSettings() {
      this.$message.success('通知设置保存成功');
      console.log('通知设置已更新：', this.notificationSettings);
    },
    checkUpdate() {
      this.$message.info('正在检查更新...');
      setTimeout(() => {
        this.$message.success('当前已是最新版本');
      }, 1000);
    }
  },
  mounted() {
    console.log('系统设置页面加载完成');
  }
};
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.settings-card {
  min-height: 600px;
}

.settings-section {
  padding: 20px;
}

.settings-section h3 {
  margin-bottom: 20px;
  color: #606266;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.about-info {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.about-info p {
  margin: 15px 0;
  font-size: 14px;
  line-height: 1.8;
}

.update-check {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #dcdfe6;
}

.update-status {
  margin-left: 15px;
  color: #67c23a;
  font-size: 14px;
}
</style>
