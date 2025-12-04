// 常量定义文件

/**
 * API接口基础地址
 */
export const API_BASE_URL = 'https://api.example.com';

/**
 * 应用配置常量
 */
export const APP_CONFIG = {
  APP_NAME: '企业管理系统',
  APP_VERSION: 'v1.0.0',
  COPYRIGHT: '版权所有 © 2024',
  COMPANY: '某某科技有限公司'
};

/**
 * 用户角色常量
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

/**
 * 用户角色名称映射
 */
export const USER_ROLE_NAMES = {
  [USER_ROLES.ADMIN]: '超级管理员',
  [USER_ROLES.MANAGER]: '普通管理员',
  [USER_ROLES.USER]: '普通用户'
};

/**
 * 用户状态常量
 */
export const USER_STATUS = {
  ACTIVE: 1,
  DISABLED: 0
};

/**
 * 用户状态名称映射
 */
export const USER_STATUS_NAMES = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.DISABLED]: '禁用'
};

/**
 * 订单状态常量
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * 订单状态名称映射
 */
export const ORDER_STATUS_NAMES = {
  [ORDER_STATUS.PENDING]: '待支付',
  [ORDER_STATUS.PROCESSING]: '处理中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
};

/**
 * 商品分类常量
 */
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FOOD: 'food',
  HOME: 'home',
  SPORTS: 'sports',
  BOOKS: 'books'
};

/**
 * 商品分类名称映射
 */
export const PRODUCT_CATEGORY_NAMES = {
  [PRODUCT_CATEGORIES.ELECTRONICS]: '电子产品',
  [PRODUCT_CATEGORIES.CLOTHING]: '服装鞋帽',
  [PRODUCT_CATEGORIES.FOOD]: '食品饮料',
  [PRODUCT_CATEGORIES.HOME]: '家居用品',
  [PRODUCT_CATEGORIES.SPORTS]: '运动户外',
  [PRODUCT_CATEGORIES.BOOKS]: '图书文教'
};

/**
 * 消息类型常量
 */
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

/**
 * 消息类型文本映射
 */
export const MESSAGE_TYPE_TEXTS = {
  [MESSAGE_TYPES.SUCCESS]: '成功',
  [MESSAGE_TYPES.WARNING]: '警告',
  [MESSAGE_TYPES.ERROR]: '错误',
  [MESSAGE_TYPES.INFO]: '提示'
};

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
  LAYOUT: 'total, sizes, prev, pager, next, jumper'
};

/**
 * 正则表达式常量
 */
export const REGEX_PATTERNS = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  CHINESE: /[\u4e00-\u9fa5]/,
  NUMBER: /^\d+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
};

/**
 * 验证错误信息
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: '此字段为必填项',
  PHONE_INVALID: '手机号格式不正确',
  EMAIL_INVALID: '邮箱格式不正确',
  PASSWORD_WEAK: '密码强度不够，需要包含大小写字母和数字，至少8位',
  USERNAME_LENGTH: '用户名长度应在3到20个字符之间',
  CONFIRM_PASSWORD_MISMATCH: '两次输入的密码不一致'
};

/**
 * 日期格式常量
 */
export const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
};

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER_INFO: 'user_info',
  SETTINGS: 'app_settings',
  LANGUAGE: 'app_language',
  THEME: 'app_theme'
};

/**
 * HTTP状态码消息映射
 */
export const HTTP_STATUS_MESSAGES = {
  200: '请求成功',
  201: '创建成功',
  204: '删除成功',
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求的资源不存在',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用'
};

/**
 * 默认提示文本
 */
export const DEFAULT_MESSAGES = {
  LOADING: '加载中...',
  SAVING: '保存中...',
  DELETING: '删除中...',
  UPLOADING: '上传中...',
  PROCESSING: '处理中...',
  SUCCESS: '操作成功',
  ERROR: '操作失败',
  CONFIRM_DELETE: '确定要删除吗？此操作不可恢复！',
  CONFIRM_CANCEL: '确定要取消吗？',
  NO_DATA: '暂无数据',
  NETWORK_ERROR: '网络连接失败，请检查网络设置'
};
