import i18n from '../i18n/index';
// 常量定义文件

/**
 * API接口基础地址
 */
export const API_BASE_URL = 'https://api.example.com';

/**
 * 应用配置常量
 */
export const APP_CONFIG = {
  APP_NAME: i18n.t('common.texto63gaq'),
  APP_VERSION: 'v1.0.0',
  COPYRIGHT: i18n.t('common.textwt5c4z'),
  COMPANY: i18n.t('common.text6ye96q')
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
  [USER_ROLES.ADMIN]: i18n.t('common.text1l0s4x'),
  [USER_ROLES.MANAGER]: i18n.t('common.text6zrzax'),
  [USER_ROLES.USER]: i18n.t('common.textdirp8b')
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
  [USER_STATUS.ACTIVE]: i18n.t('common.normal'),
  [USER_STATUS.DISABLED]: i18n.t('common.disabled')
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
  [ORDER_STATUS.PENDING]: i18n.t('common.textehbda'),
  [ORDER_STATUS.PROCESSING]: i18n.t('common.textdljhn'),
  [ORDER_STATUS.COMPLETED]: i18n.t('common.texte7hbq'),
  [ORDER_STATUS.CANCELLED]: i18n.t('common.texte68dg'),
  [ORDER_STATUS.REFUNDED]: i18n.t('common.texteggc0')
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
  [PRODUCT_CATEGORIES.ELECTRONICS]: i18n.t('common.textf5y9dh'),
  [PRODUCT_CATEGORIES.CLOTHING]: i18n.t('common.textdkoe3u'),
  [PRODUCT_CATEGORIES.FOOD]: i18n.t('common.textjna7u5'),
  [PRODUCT_CATEGORIES.HOME]: i18n.t('common.textbyi7fs'),
  [PRODUCT_CATEGORIES.SPORTS]: i18n.t('common.textihkyhj'),
  [PRODUCT_CATEGORIES.BOOKS]: i18n.t('common.textbaz5qy')
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
  [MESSAGE_TYPES.SUCCESS]: i18n.t('common.success'),
  [MESSAGE_TYPES.WARNING]: i18n.t('common.warning'),
  [MESSAGE_TYPES.ERROR]: i18n.t('common.error'),
  [MESSAGE_TYPES.INFO]: i18n.t('common.tips')
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
  REQUIRED: i18n.t('common.textbxxu5h'),
  PHONE_INVALID: i18n.t('common.textve0m7x'),
  EMAIL_INVALID: i18n.t('common.textvenleq'),
  PASSWORD_WEAK: i18n.t('common.textyxz3fr'),
  USERNAME_LENGTH: i18n.t('common.textkuqe7m'),
  CONFIRM_PASSWORD_MISMATCH: i18n.t('common.text785btd')
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
  200: i18n.t('common.texti3uy2i'),
  201: i18n.t('common.textar737y'),
  204: i18n.t('common.textazeh8z'),
  400: i18n.t('common.text38ywoh'),
  401: i18n.t('common.texteveqgj'),
  403: i18n.t('common.textczyxlm'),
  404: i18n.t('common.textxmqreg'),
  500: i18n.t('common.textg8mhnx'),
  502: i18n.t('common.textger1dk'),
  503: i18n.t('common.textciarim')
};

/**
 * 默认提示文本
 */
export const DEFAULT_MESSAGES = {
  LOADING: i18n.t('common.text27k1ha'),
  SAVING: i18n.t('common.textvts3p8'),
  DELETING: i18n.t('common.textven4ij'),
  UPLOADING: i18n.t('common.textnytojt'),
  PROCESSING: i18n.t('common.textu5bstf'),
  SUCCESS: i18n.t('common.textd1spvi'),
  ERROR: i18n.t('common.textd1rj43'),
  CONFIRM_DELETE: i18n.t('common.textx02jb2'),
  CONFIRM_CANCEL: i18n.t('common.textm7ratt'),
  NO_DATA: i18n.t('common.textdcv57g'),
  NETWORK_ERROR: i18n.t('common.textt0gxcf')
};