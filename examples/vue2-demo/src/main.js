import i18n from './i18n/index';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

Vue.config.productionTip = false;

// 全局过滤器
Vue.filter('statusText', function (value) {
  const statusMap = {
    0: i18n.t('common.texteftvg'),
    1: i18n.t('common.textego67'),
    2: i18n.t('common.texte8vjx'),
    3: i18n.t('common.textege5m')
  };
  return statusMap[value] || i18n.t('common.textdijo7a');
});

// 全局混入
Vue.mixin({
  methods: {
    showSuccess(message = i18n.t('common.textd1spvi')) {
      this.$message.success(message);
    },
    showError(message = i18n.t('common.textd1rj43')) {
      this.$message.error(message);
    },
    showWarning(message = i18n.t('common.texthxoyfm')) {
      this.$message.warning(message);
    }
  }
});

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');