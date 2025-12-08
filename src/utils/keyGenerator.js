/**
 * 统一的Key生成器
 * 为提取的中文文本生成唯一的i18n key
 */
class KeyGenerator {
  constructor(config = {}) {
    this.config = config;
    this.keyMappings = config.keyMappings || {};
    this.keyPrefixes = config.keyPrefixes || {};
    this.keyCounter = {};
  }

  /**
   * 生成key
   * @param {string} text 文本内容
   * @param {string} path 文件路径（如：src/views/User.vue::template::line:13）
   * @returns {string}
   */
  generateKey(text, path) {
    // 如果有预定义映射，直接使用
    if (this.keyMappings[text]) {
      return this.keyMappings[text];
    }

    // 根据文件路径确定前缀
    const prefix = this.determinePrefix(path);

    // 根据策略生成key
    const strategy = this.config.autoReplace?.keyStrategy || 'semantic';
    
    if (strategy === 'semantic') {
      return this.generateSemanticKey(text, prefix);
    } else {
      return this.generateHashKey(text, prefix);
    }
  }

  /**
   * 确定key前缀
   * @param {string} path
   * @returns {string}
   */
  determinePrefix(path) {
    // 从路径中提取文件名
    const filePath = path.split('::')[0];
    
    // 检查是否匹配预定义的前缀规则
    for (const [pathPattern, keyPrefix] of Object.entries(this.keyPrefixes)) {
      if (filePath.includes(pathPattern)) {
        // 确保前缀以大写字母开头，去掉末尾的点
        const prefix = keyPrefix.replace(/\.$/, '');
        return this.capitalize(prefix);
      }
    }

    // 默认返回 Common (大写开头)
    return 'Common';
  }

  /**
   * 生成语义化的key
   * @param {string} text
   * @param {string} prefix
   * @returns {string}
   */
  generateSemanticKey(text, prefix) {
    // 常见词汇映射
    const commonWords = {
      '提交': 'submit',
      '取消': 'cancel',
      '确认': 'confirm',
      '确定': 'confirm',
      '删除': 'delete',
      '编辑': 'edit',
      '保存': 'save',
      '添加': 'add',
      '新增': 'add',
      '搜索': 'search',
      '查询': 'query',
      '重置': 'reset',
      '返回': 'back',
      '首页': 'home',
      '用户': 'user',
      '管理': 'management',
      '设置': 'settings',
      '登录': 'login',
      '退出': 'logout',
      '注册': 'register',
      '导出': 'export',
      '导入': 'import',
      '上传': 'upload',
      '下载': 'download',
      '操作': 'action',
      '状态': 'status',
      '正常': 'normal',
      '禁用': 'disabled',
      '启用': 'enabled',
      '成功': 'success',
      '失败': 'failed',
      '警告': 'warning',
      '错误': 'error',
      '提示': 'tips'
    };

    // 检查是否为常见词汇
    if (commonWords[text]) {
      const fullKey = `${prefix}.${commonWords[text]}`;
      return this.ensureUnique(fullKey);
    }

    // 生成基于hash的key
    const baseKey = this.generateBaseKey(text);
    const fullKey = `${prefix}.${baseKey}`;
    
    return this.ensureUnique(fullKey);
  }

  /**
   * 生成hash key
   * @param {string} text
   * @param {string} prefix
   * @returns {string}
   */
  generateHashKey(text, prefix) {
    const hash = this.simpleHash(text);
    return `${prefix}.text${hash}`;
  }

  /**
   * 生成基础key
   * @param {string} text
   * @returns {string}
   */
  generateBaseKey(text) {
    // 使用hash确保唯一性
    return `text${this.simpleHash(text)}`;
  }

  /**
   * 简单hash函数
   * @param {string} str
   * @returns {string}
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 确保key的唯一性
   * @param {string} key
   * @returns {string}
   */
  ensureUnique(key) {
    if (!this.keyCounter[key]) {
      this.keyCounter[key] = 0;
      return key;
    }
    
    this.keyCounter[key]++;
    return `${key}${this.keyCounter[key]}`;
  }

  /**
   * 重置计数器（用于新的提取会话）
   */
  reset() {
    this.keyCounter = {};
  }

  /**
   * 将字符串首字母转换为大写
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = KeyGenerator;
