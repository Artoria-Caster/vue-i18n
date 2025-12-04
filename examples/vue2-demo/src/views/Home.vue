<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <div slot="header" class="card-header">
        <h2>欢迎使用企业管理系统</h2>
        <span>{{ currentTime }}</span>
      </div>
      <div class="welcome-content">
        <p>您好，{{ userName }}！今天是{{ todayDate }}，祝您工作愉快！</p>
        <p class="tips">系统提示：{{ systemTip }}</p>
      </div>
    </el-card>

    <div class="statistics-grid">
      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">今日访问量</div>
          <div class="stat-value">{{ todayVisits }}</div>
          <div class="stat-desc">比昨日增长{{ visitGrowth }}%</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">待处理订单</div>
          <div class="stat-value">{{ pendingOrders }}</div>
          <div class="stat-desc">{{ pendingOrders > 0 ? '请及时处理' : '暂无待处理订单' }}</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-desc">本月新增{{ newUsersThisMonth }}人</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-label">商品总数</div>
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-desc">库存充足</div>
        </div>
      </el-card>
    </div>

    <div class="content-grid">
      <el-card class="notice-card">
        <div slot="header">
          <span>系统公告</span>
          <el-button type="text" @click="viewMoreNotices">查看更多</el-button>
        </div>
        <div class="notice-list">
          <div v-for="(notice, index) in notices" :key="index" class="notice-item">
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-time">{{ notice.time }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="quick-actions-card">
        <div slot="header">快捷操作</div>
        <div class="actions-grid">
          <el-button type="primary" icon="el-icon-plus" @click="addUser">添加用户</el-button>
          <el-button type="success" icon="el-icon-upload" @click="uploadProduct">上传商品</el-button>
          <el-button type="warning" icon="el-icon-download" @click="exportData">导出数据</el-button>
          <el-button type="info" icon="el-icon-setting" @click="systemSettings">系统设置</el-button>
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
      userName: '管理员',
      currentTime: '',
      todayDate: '',
      systemTip: '请定期检查系统安全设置',
      todayVisits: 1234,
      visitGrowth: 15.8,
      pendingOrders: 28,
      totalUsers: 5678,
      newUsersThisMonth: 234,
      totalProducts: 892,
      notices: [
        { title: '系统将于今晚22:00进行维护', time: '2024-01-15 10:00' },
        { title: '新版本功能介绍', time: '2024-01-14 15:30' },
        { title: '关于优化系统性能的通知', time: '2024-01-13 09:00' }
      ]
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
      this.$message.info('查看更多公告功能开发中');
    },
    addUser() {
      this.$router.push('/user');
      this.showSuccess('跳转到用户管理页面');
    },
    uploadProduct() {
      this.$message.success('打开商品上传对话框');
    },
    exportData() {
      this.$confirm('确认要导出所有数据吗？', '导出确认', {
        confirmButtonText: '确认导出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('数据导出成功');
      }).catch(() => {
        this.$message.info('已取消导出');
      });
    },
    systemSettings() {
      this.$router.push('/settings');
    }
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
    console.log('首页加载完成');
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};
</script>

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
