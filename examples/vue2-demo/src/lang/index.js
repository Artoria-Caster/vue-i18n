import Vue from 'vue';
import VueI18n from 'vue-i18n';

// 使用 require.context 动态导入语言包模块 (兼容 webpack)
const zhCNContext = require.context('./locales/zh-CN', false, /.js$/);


// 合并模块
const zhCN = {};
zhCNContext.keys().forEach(key => {
  const moduleName = key.replace('./', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCN[capitalizedName] = zhCNContext(key).default;
});


Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN
  }
});

export default i18n;
