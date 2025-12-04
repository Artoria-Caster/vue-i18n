import i18n from '../i18n/index';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 用户信息
    userInfo: {
      id: 1,
      username: 'admin',
      realName: i18n.t('common.textglwp'),
      role: 'admin',
      avatar: ''
    },
    // 系统配置
    systemConfig: {
      siteName: i18n.t('common.texto63gaq'),
      version: 'v1.0.0',
      copyright: i18n.t('common.textwt5c4z')
    },
    // 通知数量
    notificationCount: 5,
    // 菜单展开状态
    menuCollapsed: false,
    // 主题设置
    theme: 'light',
    // 语言设置
    language: 'zh-CN'
  },

  getters: {
    // 获取用户角色名称
    userRoleName(state) {
      const roleMap = {
        'admin': i18n.t('common.text1l0s4x'),
        'manager': i18n.t('common.text6zrzax'),
        'user': i18n.t('common.textdirp8b')
      };
      return roleMap[state.userInfo.role] || i18n.t('common.textdinsij');
    },

    // 获取完整的用户显示名称
    userDisplayName(state) {
      return `${state.userInfo.realName} (${state.userInfo.username})`;
    },

    // 判断是否有未读通知
    hasUnreadNotifications(state) {
      return state.notificationCount > 0;
    },

    // 获取通知提示文本
    notificationText(state) {
      if (state.notificationCount === 0) {
        return i18n.t('common.textc3l9r7');
      }
      return i18n.t('common.text5po8ne', { notificationCount: state.notificationCount });
    }
  },

  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      console.log(i18n.t('common.texto7nka7'));
    },

    // 清空用户信息
    CLEAR_USER_INFO(state) {
      state.userInfo = {
        id: null,
        username: '',
        realName: '',
        role: '',
        avatar: ''
      };
      console.log(i18n.t('common.texto7m8wm'));
    },

    // 更新系统配置
    UPDATE_SYSTEM_CONFIG(state, config) {
      state.systemConfig = { ...state.systemConfig, ...config };
      console.log(i18n.t('common.text7wm2yx'));
    },

    // 设置通知数量
    SET_NOTIFICATION_COUNT(state, count) {
      state.notificationCount = count;
    },

    // 增加通知数量
    INCREMENT_NOTIFICATION(state) {
      state.notificationCount++;
      console.log(`新增通知，当前通知数：${state.notificationCount}`);
    },

    // 减少通知数量
    DECREMENT_NOTIFICATION(state) {
      if (state.notificationCount > 0) {
        state.notificationCount--;
      }
    },

    // 清空通知
    CLEAR_NOTIFICATIONS(state) {
      state.notificationCount = 0;
      console.log(i18n.t('common.texten5sbo'));
    },

    // 切换菜单展开状态
    TOGGLE_MENU(state) {
      state.menuCollapsed = !state.menuCollapsed;
    },

    // 设置主题
    SET_THEME(state, theme) {
      state.theme = theme;
      console.log(`主题已切换为：${theme}`);
    },

    // 设置语言
    SET_LANGUAGE(state, language) {
      state.language = language;
      console.log(`语言已切换为：${language}`);
    }
  },

  actions: {
    // 登录操作
    login({ commit }, userInfo) {
      return new Promise((resolve) => {
        // 模拟登录请求
        setTimeout(() => {
          commit('SET_USER_INFO', userInfo);
          localStorage.setItem('token', 'mock_token_' + Date.now());
          console.log(i18n.t('common.textfcewjt'));
          resolve({ message: i18n.t('common.textfcewjt') });
        }, 500);
      });
    },

    // 登出操作
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('CLEAR_USER_INFO');
        commit('CLEAR_NOTIFICATIONS');
        localStorage.removeItem('token');
        console.log(i18n.t('common.textwa7a6b'));
        resolve({ message: i18n.t('common.textwa7a6b') });
      });
    },

    // 获取用户信息
    getUserInfo({ commit }) {
      return new Promise((resolve) => {
        // 模拟获取用户信息
        setTimeout(() => {
          const userInfo = {
            id: 1,
            username: 'admin',
            realName: i18n.t('common.textglwp'),
            role: 'admin',
            avatar: ''
          };
          commit('SET_USER_INFO', userInfo);
          console.log(i18n.t('common.textzfn2a3'));
          resolve(userInfo);
        }, 300);
      });
    },

    // 更新用户信息
    updateUserInfo({ commit }, userInfo) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('SET_USER_INFO', userInfo);
          console.log(i18n.t('common.textvvnqko'));
          resolve({ message: i18n.t('common.textdeua4r') });
        }, 300);
      });
    },

    // 获取系统通知
    fetchNotifications({ commit }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const count = Math.floor(Math.random() * 10);
          commit('SET_NOTIFICATION_COUNT', count);
          console.log(`获取到${count}条系统通知`);
          resolve(count);
        }, 300);
      });
    }
  },

  modules: {}
});