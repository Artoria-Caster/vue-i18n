import i18n from '../i18n/index';
import axios from 'axios';
import { API_BASE_URL } from './constants';

// 创建axios实例
const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`发送请求：${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error(i18n.t('common.text6pgug7'), error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 根据业务状态码判断
    if (res.code !== 200) {
      console.error(i18n.t('common.textpddpmk'), res.message || i18n.t('common.textdiprg1'));

      // 401: 未授权
      if (res.code === 401) {
        console.warn(i18n.t('common.text6wvw9k'));
        // 跳转到登录页
        window.location.href = '/login';
      }

      return Promise.reject(new Error(res.message || i18n.t('common.texti3trb3')));
    } else {
      return res;
    }
  },
  (error) => {
    console.error(i18n.t('common.textb13c2r'), error.message);

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          console.error(i18n.t('common.text38ywoh'));
          break;
        case 401:
          console.error(i18n.t('common.textl9nbgq'));
          break;
        case 403:
          console.error(i18n.t('common.textczyxlm'));
          break;
        case 404:
          console.error(i18n.t('common.textxmqreg'));
          break;
        case 500:
          console.error(i18n.t('common.textg8mhnx'));
          break;
        case 502:
          console.error(i18n.t('common.textger1dk'));
          break;
        case 503:
          console.error(i18n.t('common.textciarim'));
          break;
        default:
          console.error(`请求失败，状态码：${status}`);
      }
    } else if (error.request) {
      console.error(i18n.t('common.textki5ipr'));
    } else {
      console.error(i18n.t('common.text4ma3oi'));
    }

    return Promise.reject(error);
  }
);

/**
 * GET请求
 */
export function get(url, params = {}) {
  return service.get(url, { params });
}

/**
 * POST请求
 */
export function post(url, data = {}) {
  return service.post(url, data);
}

/**
 * PUT请求
 */
export function put(url, data = {}) {
  return service.put(url, data);
}

/**
 * DELETE请求
 */
export function del(url, params = {}) {
  return service.delete(url, { params });
}

export default service;