import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

Vue.config.productionTip = false;

// 全局过滤器
Vue.filter('statusText', function(value) {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    3: '已过期'
  };
  return statusMap[value] || '未知状态';
});

// 全局混入
Vue.mixin({
  methods: {
    showSuccess(message = '操作成功') {
      this.$message.success(message);
    },
    showError(message = '操作失败') {
      this.$message.error(message);
    },
    showWarning(message = '警告信息') {
      this.$message.warning(message);
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
