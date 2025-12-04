import i18n from '../i18n/index';
// 工具函数库

/**
 * 格式化日期
 * @param {Date|String|Number} date - 日期对象或时间戳
 * @param {String} format - 格式化模板
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format.
  replace('YYYY', year).
  replace('MM', month).
  replace('DD', day).
  replace('HH', hour).
  replace('mm', minute).
  replace('ss', second);
}

/**
 * 格式化金额
 * @param {Number} amount - 金额数值
 * @returns {String} 格式化后的金额字符串
 */
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '¥0.00';
  return `¥${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 需要节流的函数
 * @param {Number} interval - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 深拷贝对象
 * @param {Object} obj - 需要拷贝的对象
 * @returns {Object} 拷贝后的新对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map((item) => deepClone(item));

  const cloneObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key]);
    }
  }
  return cloneObj;
}

/**
 * 生成随机字符串
 * @param {Number} length - 字符串长度
 * @returns {String} 随机字符串
 */
export function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 验证手机号格式
 * @param {String} phone - 手机号
 * @returns {Boolean} 是否为有效手机号
 */
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(phone)) {
    console.warn(i18n.t('common.textve0m7x'));
    return false;
  }
  return true;
}

/**
 * 验证邮箱格式
 * @param {String} email - 邮箱地址
 * @returns {Boolean} 是否为有效邮箱
 */
export function validateEmail(email) {
  const reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!reg.test(email)) {
    console.warn(i18n.t('common.textvenleq'));
    return false;
  }
  return true;
}

/**
 * 获取URL参数
 * @param {String} name - 参数名
 * @returns {String|null} 参数值
 */
export function getUrlParam(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r !== null) return decodeURIComponent(r[2]);
  return null;
}

/**
 * 本地存储操作
 */
export const storage = {
  /**
   * 设置本地存储
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`本地存储设置成功：${key}`);
    } catch (e) {
      console.error(i18n.t('common.textsav96m'), e);
    }
  },

  /**
   * 获取本地存储
   */
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error(i18n.t('common.textwv9qll'), e);
      return null;
    }
  },

  /**
   * 移除本地存储
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      console.log(`本地存储已删除：${key}`);
    } catch (e) {
      console.error(i18n.t('common.textxfovhq'), e);
    }
  },

  /**
   * 清空本地存储
   */
  clear() {
    try {
      localStorage.clear();
      console.log(i18n.t('common.text55o37'));
    } catch (e) {
      console.error(i18n.t('common.text32vbib'), e);
    }
  }
};

/**
 * 文件大小格式化
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 显示成功提示
 */
export function showSuccessMessage(message = i18n.t('common.textd1spvi')) {
  console.log(`✓ ${message}`);
}

/**
 * 显示错误提示
 */
export function showErrorMessage(message = i18n.t('common.textd1rj43')) {
  console.error(`✗ ${message}`);
}