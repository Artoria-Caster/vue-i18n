import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zhCN from './locales/zh-CN';


Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN
  }
});

export default i18n;
