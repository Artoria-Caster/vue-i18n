import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 用户信息
    userInfo: {
      id: 1,
      username: 'admin',
      realName: '张三',
      role: 'admin',
      avatar: ''
    },
    // 系统配置
    systemConfig: {
      siteName: '企业管理系统',
      version: 'v1.0.0',
      copyright: '版权所有 © 2024'
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
        'admin': '超级管理员',
        'manager': '普通管理员',
        'user': '普通用户'
      };
      return roleMap[state.userInfo.role] || '未知角色';
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
        return '暂无新通知';
      }
      return `您有${state.notificationCount}条未读通知`;
    }
  },
  
  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      console.log('用户信息已更新');
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
      console.log('用户信息已清空');
    },
    
    // 更新系统配置
    UPDATE_SYSTEM_CONFIG(state, config) {
      state.systemConfig = { ...state.systemConfig, ...config };
      console.log('系统配置已更新');
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
      console.log('通知已全部清空');
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
          console.log('登录成功');
          resolve({ message: '登录成功' });
        }, 500);
      });
    },
    
    // 登出操作
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('CLEAR_USER_INFO');
        commit('CLEAR_NOTIFICATIONS');
        localStorage.removeItem('token');
        console.log('退出登录成功');
        resolve({ message: '退出登录成功' });
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
            realName: '张三',
            role: 'admin',
            avatar: ''
          };
          commit('SET_USER_INFO', userInfo);
          console.log('用户信息获取成功');
          resolve(userInfo);
        }, 300);
      });
    },
    
    // 更新用户信息
    updateUserInfo({ commit }, userInfo) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('SET_USER_INFO', userInfo);
          console.log('用户信息更新成功');
          resolve({ message: '更新成功' });
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
