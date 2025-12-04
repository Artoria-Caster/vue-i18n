<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <div slot="header" class="card-header">
        <h2>{{ $t('common.textxmdczt') }}</h2>
        <span>{{ currentTime }}</span>
      </div>
      <div class="welcome-content">
        <p>{{ $t('common.text60lrwy', { userName: userName, todayDate: todayDate }) }}</p>
        <p class="tips">{{ $t('common.textgqa3dk', { systemTip: systemTip }) }}</p>
      </div>
    </el-card>

    <div class="statistics-grid">
      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">{{ $t('common.textxneye3') }}</div>
          <div class="stat-value">{{ todayVisits }}</div>
          <div class="stat-desc">{{ $t('common.textlu1dl5', { visitGrowth: visitGrowth }) }}</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">{{ $t('common.textu1jgmy') }}</div>
          <div class="stat-value">{{ pendingOrders }}</div>
          <div class="stat-desc">{{ pendingOrders > 0 ? $t('common.text9zqjdn') : $t('common.text9uk89w') }}</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">{{ $t('common.textf6tfqc') }}</div>
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-desc">{{ $t('common.textqyu36m', { newUsersThisMonth: newUsersThisMonth }) }}</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">{{ $t('common.textb42tjk') }}</div>
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-desc">{{ $t('common.textcb7kkz') }}</div>
        </div>
      </el-card>
    </div>

    <div class="content-grid">
      <el-card class="notice-card">
        <div slot="header">
          <span>{{ $t('common.textgagw4i') }}</span>
          <el-button type="text" @click="viewMoreNotices">{{ $t('common.textdlojqk') }}</el-button>
        </div>
        <div class="notice-list">
          <div v-for="(notice, index) in notices" :key="index" class="notice-item">
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-time">{{ notice.time }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="quick-actions-card">
        <div slot="header">{{ $t('common.textcil0yj') }}</div>
        <div class="actions-grid">
          <el-button type="primary" icon="el-icon-plus" @click="addUser">{{ $t('common.texte81syc') }}</el-button>
          <el-button type="success" icon="el-icon-upload" @click="uploadProduct">{{ $t('common.texta6cmxd') }}</el-button>
          <el-button type="warning" icon="el-icon-download" @click="exportData">{{ $t('common.textby61a4') }}</el-button>
          <el-button type="info" icon="el-icon-setting" @click="systemSettings">{{ $t('common.textgar1ro') }}</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      userName: this.$t('common.textio38z'),
      currentTime: '',
      todayDate: '',
      systemTip: this.$t('common.texta8ook4'),
      todayVisits: 1234,
      visitGrowth: 15.8,
      pendingOrders: 28,
      totalUsers: 5678,
      newUsersThisMonth: 234,
      totalProducts: 892,
      notices: [
      { title: this.$t('common.textzbpbxd'), time: '2024-01-15 10:00' },
      { title: this.$t('common.text3feylw'), time: '2024-01-14 15:30' },
      { title: this.$t('common.textyp6np8'), time: '2024-01-13 09:00' }]

    };
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('zh-CN');
      this.todayDate = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    },
    viewMoreNotices() {
      this.$message.info(this.$t('common.text2pb6gk'));
    },
    addUser() {
      this.$router.push('/user');
      this.showSuccess(this.$t('common.texthwxajc'));
    },
    uploadProduct() {
      this.$message.success(this.$t('common.textdqo7rw'));
    },
    exportData() {
      this.$confirm(this.$t('common.textesi514'), this.$t('common.textby9his'), {
        confirmButtonText: this.$t('common.textfrq4ms'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message.success(this.$t('common.textinblv9'));
      }).catch(() => {
        this.$message.info(this.$t('common.textn79cgy'));
      });
    },
    systemSettings() {
      this.$router.push('/settings');
    }
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
    console.log(this.$t('common.textq7llq8'));
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.welcome-content p {
  margin: 10px 0;
  font-size: 16px;
  line-height: 1.8;
}

.tips {
  color: #e6a23c;
  font-weight: bold;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  color: #409eff;
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
}

.stat-desc {
  color: #67c23a;
  font-size: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.notice-list {
  max-height: 300px;
  overflow-y: auto;
}

.notice-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-title {
  color: #303133;
  font-size: 14px;
  margin-bottom: 8px;
}

.notice-time {
  color: #909399;
  font-size: 12px;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.actions-grid .el-button {
  width: 100%;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .statistics-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
