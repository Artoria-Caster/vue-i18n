const fs = require('fs');
const path = require('path');

/**
 * i18n配置生成器
 * 生成i18n语言包和初始化文件
 */
class I18nGenerator {
  constructor(config) {
    this.config = config;
    this.keyMappings = config.keyMappings || {};
    this.keyPrefixes = config.keyPrefixes || {};
    this.keyCounter = {};
  }

  /**
   * 生成i18n配置文件
   * @param {Object} extractedData 提取的数据
   * @param {string} targetProjectPath 目标项目路径
   */
  async generate(extractedData, targetProjectPath) {
    try {
      const i18nPath = path.join(
        targetProjectPath,
        this.config.autoReplace?.i18nPath || './src/i18n'
      );

      // 创建i18n目录结构
      await this.createDirectories(i18nPath);

      // 生成key映射
      const keyMap = this.generateKeyMap(extractedData);

      // 生成中文语言包
      await this.generateLocaleFile(i18nPath, 'zh-CN', keyMap);

      // 可选：生成英文语言包
      if (this.config.autoReplace?.generateEnglish) {
        await this.generateLocaleFile(i18nPath, 'en-US', keyMap, true);
      }

      // 生成i18n初始化文件
      await this.generateIndexFile(i18nPath);

      console.log('\n✓ i18n配置文件已生成');
      console.log(`  - 位置: ${i18nPath}`);
      console.log(`  - 语言包: zh-CN.js${this.config.autoReplace?.generateEnglish ? ', en-US.js' : ''}`);
      console.log(`  - 初始化文件: index.js\n`);

      return keyMap;
    } catch (error) {
      console.error('生成i18n配置失败:', error);
      throw error;
    }
  }

  /**
   * 创建目录结构
   * @param {string} i18nPath
   */
  async createDirectories(i18nPath) {
    const localesPath = path.join(i18nPath, 'locales');
    
    await fs.promises.mkdir(i18nPath, { recursive: true });
    await fs.promises.mkdir(localesPath, { recursive: true });
  }

  /**
   * 生成key映射
   * @param {Object} extractedData
   * @returns {Object}
   */
  generateKeyMap(extractedData) {
    const keyMap = {};
    const messages = {};

    // 处理普通文本
    for (const [path, text] of Object.entries(extractedData.normal)) {
      const key = this.generateKey(text, path);
      keyMap[path] = key;
      
      // 将key按层级拆分存储
      this.setNestedValue(messages, key, text);
    }

    // 处理模板文本
    for (const [path, info] of Object.entries(extractedData.templates)) {
      const key = this.generateKey(info.original, path);
      keyMap[path] = {
        key,
        variables: info.variables,
        fullPaths: info.fullPaths || info.variables, // 保存完整路径
        original: info.original
      };
      
      // 转换为i18n格式，使用安全的变量名
      const i18nText = this.convertToI18nFormat(info.original, info.variables);
      this.setNestedValue(messages, key, i18nText);
    }

    return { keyMap, messages };
  }

  /**
   * 生成合理的key值
   * @param {string} text
   * @param {string} path
   * @returns {string}
   */
  generateKey(text, path) {
    // 如果有预定义映射，直接使用
    if (this.keyMappings[text]) {
      return this.keyMappings[text];
    }

    // 根据文件路径确定前缀
    let prefix = 'common';
    for (const [pathPattern, keyPrefix] of Object.entries(this.keyPrefixes)) {
      if (path.includes(pathPattern)) {
        prefix = keyPrefix.replace(/\.$/, '');
        break;
      }
    }

    // 根据策略生成key
    const strategy = this.config.autoReplace?.keyStrategy || 'semantic';
    
    if (strategy === 'semantic') {
      return this.generateSemanticKey(text, prefix);
    } else {
      return this.generateHashKey(text, prefix);
    }
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
      '删除': 'delete',
      '编辑': 'edit',
      '保存': 'save',
      '添加': 'add',
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
      '注册': 'register'
    };

    // 检查是否为常见词汇
    if (commonWords[text]) {
      return `${prefix}.${commonWords[text]}`;
    }

    // 生成拼音或简写key
    const baseKey = this.generateBaseKey(text);
    const fullKey = `${prefix}.${baseKey}`;

    // 处理重复key
    if (!this.keyCounter[fullKey]) {
      this.keyCounter[fullKey] = 0;
      return fullKey;
    } else {
      this.keyCounter[fullKey]++;
      return `${fullKey}${this.keyCounter[fullKey]}`;
    }
  }

  /**
   * 生成基础key
   * @param {string} text
   * @returns {string}
   */
  generateBaseKey(text) {
    // 直接使用完整文本生成hash，保留标点符号以确保唯一性
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
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 6);
  }

  /**
   * 生成hash key
   * @param {string} text
   * @param {string} prefix
   * @returns {string}
   */
  generateHashKey(text, prefix) {
    const hash = this.simpleHash(text);
    return `${prefix}.key_${hash}`;
  }

  /**
   * 转换为i18n格式
   * @param {string} text 原始文本
   * @param {Array} variables 变量列表
   * @returns {string}
   */
  convertToI18nFormat(text, variables = []) {
    let result = text;
    
    // 将 ${var} 转换为 {var}
    result = result.replace(/\$\{([^}]+)\}/g, (match, varExpr) => {
      const trimmed = varExpr.trim();
      // 查找这个表达式在variables中的索引
      const index = variables.findIndex(v => v.trim() === trimmed);
      if (index >= 0) {
        const safeVarName = this.generateSafeVarName(variables[index], index);
        return `{${safeVarName}}`;
      }
      return `{${trimmed}}`;
    });
    
    // 将 {{var}} 转换为 {var}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, varExpr) => {
      const trimmed = varExpr.trim();
      // 查找这个表达式在variables中的索引
      const index = variables.findIndex(v => v.trim() === trimmed);
      if (index >= 0) {
        const safeVarName = this.generateSafeVarName(variables[index], index);
        return `{${safeVarName}}`;
      }
      return `{${trimmed}}`;
    });
    
    return result;
  }

  /**
   * 生成安全的变量名
   * @param {string} varName 原始变量名或表达式
   * @param {number} index 索引
   * @returns {string}
   */
  generateSafeVarName(varName, index) {
    // 如果是简单变量名（只包含字母、数字、下划线），直接使用
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName)) {
      return varName;
    }
    
    // 如果包含点号，取最后一部分
    if (varName.includes('.')) {
      const parts = varName.split('.');
      const lastPart = parts[parts.length - 1];
      // 确保最后一部分是合法的变量名
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(lastPart)) {
        return lastPart;
      }
    }
    
    // 对于复杂表达式，使用通用名称
    return `val${index}`;
  }

  /**
   * 设置嵌套对象的值
   * @param {Object} obj
   * @param {string} path
   * @param {*} value
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * 生成语言包文件
   * @param {string} i18nPath
   * @param {string} locale
   * @param {Object} keyMap
   * @param {boolean} isEnglish
   */
  async generateLocaleFile(i18nPath, locale, keyMap, isEnglish = false) {
    const { messages } = keyMap;
    const localesPath = path.join(i18nPath, 'locales');
    const filePath = path.join(localesPath, `${locale}.js`);

    let content = `export default ${JSON.stringify(messages, null, 2)};\n`;

    // 如果是英文，添加翻译提示
    if (isEnglish) {
      content = `// TODO: 请翻译以下内容\n${content}`;
    }

    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 生成i18n初始化文件
   * @param {string} i18nPath
   */
  async generateIndexFile(i18nPath) {
    const content = `import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zhCN from './locales/zh-CN';
${this.config.autoReplace?.generateEnglish ? "import enUS from './locales/en-US';" : ''}

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN${this.config.autoReplace?.generateEnglish ? ",\n    'en-US': enUS" : ''}
  }
});

export default i18n;
`;

    const filePath = path.join(i18nPath, 'index.js');
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }
}

module.exports = I18nGenerator;
