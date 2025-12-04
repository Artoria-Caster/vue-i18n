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
  config => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`发送请求：${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('请求错误：', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 根据业务状态码判断
    if (res.code !== 200) {
      console.error('接口返回错误：', res.message || '未知错误');
      
      // 401: 未授权
      if (res.code === 401) {
        console.warn('登录已过期，请重新登录');
        // 跳转到登录页
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    } else {
      return res;
    }
  },
  error => {
    console.error('响应错误：', error.message);
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          console.error('请求参数错误');
          break;
        case 401:
          console.error('未授权，请登录');
          break;
        case 403:
          console.error('拒绝访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        case 502:
          console.error('网关错误');
          break;
        case 503:
          console.error('服务不可用');
          break;
        default:
          console.error(`请求失败，状态码：${status}`);
      }
    } else if (error.request) {
      console.error('网络连接失败，请检查网络');
    } else {
      console.error('请求配置错误');
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
