<template>
  <div class="settings-page">
    <h2>{{ $t('common.textgar1ro') }}</h2>

    <el-card class="settings-card">
      <el-tabs tab-position="left">
        <el-tab-pane :label="$t('common.textbj9c9u')">
          <div class="settings-section">
            <h3>{{ $t('common.textbiyzkw') }}</h3>
            <el-form :model="basicSettings" label-width="120px">
              <el-form-item :label="$t('common.textgahjnr')">
                <el-input v-model="basicSettings.systemName" :placeholder="$t('common.texth8lh74')" />
              </el-form-item>
              <el-form-item :label="$t('common.textgaml2g')">
                <el-input v-model="basicSettings.version" disabled />
              </el-form-item>
              <el-form-item :label="$t('common.textgpkj3j')">
                <el-input v-model="basicSettings.phone" :placeholder="$t('common.textgtihrc')" />
              </el-form-item>
              <el-form-item :label="$t('common.textgpp44q')">
                <el-input v-model="basicSettings.email" :placeholder="$t('common.textgtdwq5')" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveBasicSettings">{{ $t('common.textagor7v') }}</el-button>
                <el-button @click="resetBasicSettings">{{ $t('common.reset') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('common.textbw89m7')">
          <div class="settings-section">
            <h3>{{ $t('common.textbw97nk') }}</h3>
            <el-form :model="securitySettings" label-width="150px">
              <el-form-item :label="$t('common.textscr9ox')">
                <el-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" />
                <span class="form-tip">{{ $t('common.textcspz4g') }}</span>
              </el-form-item>
              <el-form-item :label="$t('common.text9ax57h')">
                <el-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" />
                <span class="form-tip">{{ $t('common.text1h7i7z') }}</span>
              </el-form-item>
              <el-form-item :label="$t('common.text4fmnzi')">
                <el-input-number v-model="securitySettings.sessionTimeout" :min="5" :max="120" />
                <span class="form-tip">{{ $t('common.texti9yq3p') }}</span>
              </el-form-item>
              <el-form-item :label="$t('common.text3jp7rk')">
                <el-switch v-model="securitySettings.twoFactorAuth" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSecuritySettings">{{ $t('common.textagor7v') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('common.textioju7v')">
          <div class="settings-section">
            <h3>{{ $t('common.textioks98') }}</h3>
            <el-form :model="notificationSettings" label-width="150px">
              <el-form-item :label="$t('common.textil776b')">
                <el-switch v-model="notificationSettings.emailEnabled" />
                <span class="form-tip">{{ $t('common.textohocyz') }}</span>
              </el-form-item>
              <el-form-item :label="$t('common.textfgxpjz')">
                <el-switch v-model="notificationSettings.smsEnabled" />
                <span class="form-tip">{{ $t('common.textldevcn') }}</span>
              </el-form-item>
              <el-form-item :label="$t('common.textgalqnf')">
                <el-switch v-model="notificationSettings.systemMessageEnabled" />
              </el-form-item>
              <el-form-item :label="$t('common.textiod70h')">
                <el-checkbox-group v-model="notificationSettings.methods">
                  <el-checkbox label="order">{{ $t('common.texthyx9vi') }}</el-checkbox>
                  <el-checkbox label="system">{{ $t('common.textgarqz3') }}</el-checkbox>
                  <el-checkbox label="promotion">{{ $t('common.textaoovhk') }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveNotificationSettings">{{ $t('common.textagor7v') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('common.textaly1of')">
          <div class="settings-section">
            <h3>{{ $t('common.textgagp2q') }}</h3>
            <div class="about-info">
              <p><strong>系统名称：</strong>{{ $t('common.texto63gaq') }}</p>
              <p><strong>{{ $t('common.textsf5ogs') }}</strong>v1.0.0</p>
              <p><strong>发布日期：</strong>{{ $t('common.text5ubhu2') }}</p>
              <p><strong>开发团队：</strong>{{ $t('common.textrjdf44') }}</p>
              <p><strong>{{ $t('common.textrm1v1j') }}</strong>support@example.com</p>
              <p><strong>{{ $t('common.textgc8zht') }}</strong>https://www.example.com</p>
              <div class="update-check">
                <el-button type="primary" @click="checkUpdate">{{ $t('common.textdnckrl') }}</el-button>
                <span class="update-status">{{ $t('common.text1mi4q3') }}</span>
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
        systemName: this.$t('common.texto63gaq'),
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
      this.$message.success(this.$t('common.textmf4w98'));
    },
    resetBasicSettings() {
      this.$confirm(this.$t('common.textlwfq74'), this.$t('common.textixa41j'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.basicSettings = {
          systemName: this.$t('common.texto63gaq'),
          version: 'v1.0.0',
          phone: '400-888-8888',
          email: 'support@example.com'
        };
        this.$message.success(this.$t('common.textdc3djx'));
      }).catch(() => {
        this.$message.info(this.$t('common.textn7iqzp'));
      });
    },
    saveSecuritySettings() {
      this.$message.success(this.$t('common.textsv0t0n'));
      console.log(this.$t('common.textr1c59h'), this.securitySettings);
    },
    saveNotificationSettings() {
      this.$message.success(this.$t('common.textcfzcit'));
      console.log(this.$t('common.texte9o09z'), this.notificationSettings);
    },
    checkUpdate() {
      this.$message.info(this.$t('common.text2rsqg8'));
      setTimeout(() => {
        this.$message.success(this.$t('common.text1mi4q3'));
      }, 1000);
    }
  },
  mounted() {
    console.log(this.$t('common.text8kpqji'));
  }
};</script>

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
