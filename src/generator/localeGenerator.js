const fs = require('fs');
const path = require('path');

/**
 * 语言包生成器
 * 根据提取的JSON生成zh-CN.js和翻译对照文本文件
 */
class LocaleGenerator {
  constructor(config) {
    this.config = config;
    this.keyMappings = config.keyMappings || {};
    this.keyPrefixes = config.keyPrefixes || {};
    this.keyCounter = {};
  }

  /**
   * 生成语言包文件和翻译对照文件
   * @param {Object} extractedData 提取的数据
   * @param {string} outputDir 输出目录
   */
  async generate(extractedData, outputDir) {
    try {
      // 生成key映射和消息对象
      const { keyMap, messages } = this.generateKeyMap(extractedData);

      // 创建 zh-cn 文件夹并生成模块文件
      const localeFolderPath = path.join(outputDir, 'zh-cn');
      await fs.promises.mkdir(localeFolderPath, { recursive: true });
      
      // 为每个模块生成独立的 js 文件
      const moduleFiles = await this.generateModuleFiles(localeFolderPath, messages);

      // 生成翻译对照文本文件
      const translationFilePath = path.join(outputDir, 'translation-template.txt');
      await this.generateTranslationTemplate(translationFilePath, messages);

      console.log('\n✓ 语言包文件已生成');
      console.log(`  - zh-cn 文件夹: ${localeFolderPath}`);
      moduleFiles.forEach(file => {
        console.log(`    - ${path.basename(file)}`);
      });
      console.log(`  - 翻译对照模板: ${translationFilePath}\n`);

      return { keyMap, localeFolderPath, moduleFiles, translationFilePath };
    } catch (error) {
      console.error('生成语言包失败:', error);
      throw error;
    }
  }

  /**
   * 生成key映射
   * @param {Object} extractedData
   * @returns {Object}
   */
  generateKeyMap(extractedData) {
    const keyMap = {};
    const messages = {};

    // 处理普通文本 - 直接使用JSON中已生成的key
    for (const [path, data] of Object.entries(extractedData.normal)) {
      const text = typeof data === 'string' ? data : data.text;
      const key = typeof data === 'string' ? this.generateKey(text, path) : data.key;
      
      keyMap[path] = key;
      
      // 将key按层级拆分存储
      this.setNestedValue(messages, key, text);
    }

    // 处理模板文本 - 直接使用JSON中已生成的key
    for (const [path, info] of Object.entries(extractedData.templates)) {
      const key = info.key || this.generateKey(info.original, path);
      
      keyMap[path] = {
        key,
        variables: info.variables,
        fullPaths: info.fullPaths || info.variables,
        original: info.original
      };
      
      // 转换为i18n格式
      const i18nText = this.convertToI18nFormat(info.original, info.variables);
      this.setNestedValue(messages, key, i18nText);
    }

    return { keyMap, messages };
  }

  /**
   * 生成key
   * @param {string} text
   * @param {string} path
   * @returns {string}
   */
  generateKey(text, path) {
    // 从路径中提取模块信息
    const pathParts = path.split('::')[0].split('/');
    const fileName = pathParts[pathParts.length - 1].replace(/\.(vue|js)$/, '');
    
    // 确定前缀 (首字母大写)
    let prefix = this.keyPrefixes.default || 'Common';
    
    if (fileName) {
      // 根据文件名确定模块
      for (const [pattern, modulePrefix] of Object.entries(this.keyPrefixes)) {
        if (fileName.toLowerCase().includes(pattern.toLowerCase())) {
          prefix = this.capitalize(modulePrefix.replace(/\.$/, ''));
          break;
        }
      }
      
      // 如果没有匹配到特定前缀，使用文件名作为前缀(首字母大写)
      if (prefix === (this.keyPrefixes.default || 'Common') && fileName !== 'App') {
        prefix = this.capitalize(fileName);
      }
    }

    // 生成描述性key
    const baseKey = this.generateDescriptiveKey(text);
    
    // 确保key唯一性
    const fullKey = `${prefix}.${baseKey}`;
    return this.ensureUnique(fullKey);
  }

  /**
   * 生成描述性key
   * @param {string} text
   * @returns {string}
   */
  generateDescriptiveKey(text) {
    // 移除插值表达式
    let cleanText = text.replace(/\{\{[^}]+\}\}/g, '');
    
    // 移除特殊字符
    cleanText = cleanText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    
    // 如果文本过长，取前几个有意义的字符
    if (cleanText.length > 20) {
      cleanText = cleanText.substring(0, 20);
    }
    
    // 转换为拼音或保持中文（这里简化处理，使用中文）
    return cleanText || 'text';
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
   * 将字符串首字母转换为大写
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 设置嵌套值
   * @param {Object} obj
   * @param {string} key
   * @param {*} value
   */
  setNestedValue(obj, key, value) {
    const parts = key.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * 将模板文本转换为i18n格式
   * @param {string} text
   * @param {Array} variables
   * @returns {string}
   */
  convertToI18nFormat(text, variables) {
    let result = text;
    
    // 将{{variable}}转换为{variable}
    for (const variable of variables) {
      // 提取变量名（去掉路径）
      const varName = variable.split('.').pop();
      result = result.replace(
        new RegExp(`\\{\\{\\s*${this.escapeRegex(variable)}\\s*\\}\\}`, 'g'),
        `{${varName}}`
      );
    }
    
    return result;
  }

  /**
   * 转义正则表达式特殊字符
   * @param {string} str
   * @returns {string}
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 生成zh-CN.js文件
   * @param {string} filePath
   * @param {Object} messages
   */
  async generateLocaleFile(filePath, messages) {
    const content = `export default ${JSON.stringify(messages, null, 2)};\n`;
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 为每个模块生成独立的 js 文件
   * @param {string} folderPath zh-CN 文件夹路径
   * @param {Object} messages 消息对象
   * @returns {Array} 生成的文件路径列表
   */
  async generateModuleFiles(folderPath, messages) {
    const files = [];
    
    for (const [moduleName, moduleMessages] of Object.entries(messages)) {
      // 模块名首字母小写作为文件名
      const fileName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1) + '.js';
      const filePath = path.join(folderPath, fileName);
      
      const content = `export default ${JSON.stringify(moduleMessages, null, 2)};\n`;
      await fs.promises.writeFile(filePath, content, 'utf-8');
      
      files.push(filePath);
    }
    
    return files;
  }

  /**
   * 生成翻译对照文本文件
   * @param {string} filePath
   * @param {Object} messages
   */
  async generateTranslationTemplate(filePath, messages) {
    const lines = ['# 翻译对照模板', ''];
    lines.push('# 格式说明：');
    lines.push('# 每行格式为：中文文本 = 翻译文本');
    lines.push('# 请在等号后面填写对应的翻译内容');
    lines.push('# 支持变量占位符 {变量名}' );
    lines.push('');
    lines.push('# ==========================================');
    lines.push('');

    // 扁平化messages对象
    const flatMessages = this.flattenMessages(messages);
    
    // 按key排序
    const sortedKeys = Object.keys(flatMessages).sort();
    
    // 生成每一行
    for (const key of sortedKeys) {
      const value = flatMessages[key];
      lines.push(`${value} = `);
    }

    await fs.promises.writeFile(filePath, lines.join('\n'), 'utf-8');
  }

  /**
   * 扁平化消息对象
   * @param {Object} obj
   * @param {string} prefix
   * @returns {Object}
   */
  flattenMessages(obj, prefix = '') {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, this.flattenMessages(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }
    
    return result;
  }
}

module.exports = LocaleGenerator;
