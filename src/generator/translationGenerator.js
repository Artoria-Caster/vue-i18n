const fs = require('fs');
const path = require('path');

/**
 * 翻译生成器
 * 根据zh-CN.js和填充好的translation-template.txt生成其他语言的配置文件
 */
class TranslationGenerator {
  constructor(config) {
    this.config = config || {};
  }

  /**
   * 读取zh-CN语言包文件夹
   * @param {string} zhCNPath - zh-CN文件夹路径
   * @returns {Object} 解析后的中文语言包对象
   */
  readZhCNFile(zhCNPath) {
    try {
      // 检查是否是文件夹
      const stats = fs.statSync(zhCNPath);
      
      if (stats.isDirectory()) {
        // 读取文件夹中的所有模块文件
        return this.readZhCNFolder(zhCNPath);
      } else {
        // 兼容旧的单文件格式
        return this.readZhCNSingleFile(zhCNPath);
      }
    } catch (error) {
      throw new Error(`读取zh-CN语言包失败: ${error.message}`);
    }
  }

  /**
   * 读取zh-CN文件夹中的所有模块
   * @param {string} folderPath - zh-CN文件夹路径
   * @returns {Object} 合并后的语言包对象
   */
  readZhCNFolder(folderPath) {
    const zhCNData = {};
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 移除export default，将其转换为可执行的JS对象
        const cleanContent = content
          .replace(/export\s+default\s+/, 'module.exports = ')
          .replace(/\r\n/g, '\n');
        
        // 创建临时文件以便require
        const tempFile = path.resolve(path.dirname(filePath), `.temp_${file}`);
        fs.writeFileSync(tempFile, cleanContent, 'utf-8');
        
        // 清除require缓存
        delete require.cache[tempFile];
        const moduleData = require(tempFile);
        
        // 删除临时文件
        fs.unlinkSync(tempFile);
        
        // 模块名首字母大写
        const moduleName = file.replace('.js', '');
        const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
        zhCNData[capitalizedName] = moduleData;
      }
    }
    
    return zhCNData;
  }

  /**
   * 读取zh-CN.js单文件(兼容旧格式)
   * @param {string} zhCNPath - zh-CN.js文件路径
   * @returns {Object} 解析后的中文语言包对象
   */
  readZhCNSingleFile(zhCNPath) {
    if (!fs.existsSync(zhCNPath)) {
      throw new Error(`zh-CN.js文件不存在: ${zhCNPath}`);
    }

    const content = fs.readFileSync(zhCNPath, 'utf-8');
    
    // 移除export default，将其转换为可执行的JS对象
    const cleanContent = content
      .replace(/export\s+default\s+/, 'module.exports = ')
      .replace(/\r\n/g, '\n');
    
    // 创建临时文件以便require
    const tempFile = path.resolve(path.dirname(zhCNPath), '.temp_zh-CN.js');
    fs.writeFileSync(tempFile, cleanContent, 'utf-8');
    
    // 清除require缓存
    delete require.cache[tempFile];
    const zhCNData = require(tempFile);
    
    // 删除临时文件
    fs.unlinkSync(tempFile);
    
    return zhCNData;
  }

  /**
   * 读取翻译对照模板文件
   * @param {string} templatePath - translation-template.txt文件路径
   * @returns {Map} 中文到翻译文本的映射
   */
  readTranslationTemplate(templatePath) {
    try {
      if (!fs.existsSync(templatePath)) {
        throw new Error(`翻译模板文件不存在: ${templatePath}`);
      }

      const content = fs.readFileSync(templatePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      
      const translationMap = new Map();
      
      for (let line of lines) {
        // 跳过注释和空行
        if (line.trim().startsWith('#') || line.trim() === '' || line.trim() === '# ==========================================') {
          continue;
        }
        
        // 解析格式：中文文本 = 翻译文本
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) {
          continue;
        }
        
        const chineseText = line.substring(0, equalIndex).trim();
        const translatedText = line.substring(equalIndex + 1).trim();
        
        // 添加所有包含等号的项，包括未填写翻译的项（映射为空字符串）
        if (chineseText) {
          translationMap.set(chineseText, translatedText || '');
        }
      }
      
      return translationMap;
    } catch (error) {
      throw new Error(`读取翻译模板文件失败: ${error.message}`);
    }
  }

  /**
   * 递归翻译对象
   * @param {Object} obj - 要翻译的对象
   * @param {Map} translationMap - 翻译映射
   * @returns {Object} 翻译后的对象
   */
  translateObject(obj, translationMap) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const result = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'string') {
        // 尝试翻译字符串值
        if (translationMap.has(value)) {
          // 如果在翻译映射中找到（包括空字符串），使用翻译值
          result[key] = translationMap.get(value);
        } else {
          // 如果不在翻译映射中，保留原值
          result[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // 递归处理嵌套对象
        result[key] = this.translateObject(value, translationMap);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 将对象格式化为JS文件内容
   * @param {Object} obj - 要格式化的对象
   * @param {number} indent - 缩进级别
   * @returns {string} 格式化后的字符串
   */
  formatObjectToJS(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    const innerSpaces = '  '.repeat(indent + 1);
    
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => `${innerSpaces}${this.formatObjectToJS(item, indent + 1)}`);
      return '[\n' + items.join(',\n') + '\n' + spaces + ']';
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const formattedValue = this.formatObjectToJS(value, indent + 1);
      return `${innerSpaces}${formattedKey}: ${formattedValue}`;
    });

    return '{\n' + lines.join(',\n') + '\n' + spaces + '}';
  }

  /**
   * 生成目标语言的配置文件
   * @param {string} zhCNPath - zh-CN文件夹或文件路径
   * @param {string} templatePath - translation-template.txt文件路径
   * @param {string} targetLang - 目标语言代码，如 'en-US', 'ja-JP' 等
   * @param {string} outputDir - 输出目录，默认为zh-CN所在目录
   * @returns {string} 生成的文件夹或文件路径
   */
  async generate(zhCNPath, templatePath, targetLang = 'en-US', outputDir = null) {
    console.log(`\n开始生成${targetLang}语言包...`);
    
    // 1. 读取zh-CN
    console.log('1. 读取zh-CN语言包...');
    const zhCNData = this.readZhCNFile(zhCNPath);
    console.log(`   ✓ 成功读取中文语言包`);

    // 2. 读取翻译模板
    console.log('2. 读取翻译模板...');
    const translationMap = this.readTranslationTemplate(templatePath);
    console.log(`   ✓ 成功读取 ${translationMap.size} 条翻译`);

    // 3. 执行翻译
    console.log('3. 执行翻译...');
    const translatedData = this.translateObject(zhCNData, translationMap);

    // 4. 统计翻译情况
    const stats = this.getTranslationStats(zhCNData, translatedData);
    console.log(`   ✓ 已翻译: ${stats.translated} 条`);
    console.log(`   ✓ 未翻译: ${stats.untranslated} 条`);
    console.log(`   ✓ 翻译率: ${stats.percentage}%`);

    // 5. 生成文件
    console.log('4. 生成语言包文件...');
    const output = outputDir || path.dirname(zhCNPath);
    
    // 检查zhCNPath是文件夹还是文件，决定输出格式
    const stats_zhCN = fs.statSync(zhCNPath);
    
    if (stats_zhCN.isDirectory()) {
      // 生成文件夹结构
      const outputFolderPath = path.join(output, targetLang);
      await fs.promises.mkdir(outputFolderPath, { recursive: true });
      
      const moduleFiles = [];
      for (const [moduleName, moduleMessages] of Object.entries(translatedData)) {
        // 模块名首字母小写作为文件名
        const fileName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1) + '.js';
        const filePath = path.join(outputFolderPath, fileName);
        
        const fileContent = `export default ${this.formatObjectToJS(moduleMessages, 0)};\n`;
        await fs.promises.writeFile(filePath, fileContent, 'utf-8');
        
        moduleFiles.push(filePath);
      }
      
      console.log(`   ✓ 已生成文件夹: ${outputFolderPath}`);
      moduleFiles.forEach(file => {
        console.log(`     - ${path.basename(file)}`);
      });
      
      return outputFolderPath;
    } else {
      // 生成单文件（兼容旧格式）
      const outputPath = path.join(output, `${targetLang}.js`);
      const fileContent = `export default ${this.formatObjectToJS(translatedData, 0)};\n`;
      await fs.promises.writeFile(outputPath, fileContent, 'utf-8');
      
      console.log(`   ✓ 已生成: ${outputPath}`);
      return outputPath;
    }
  }

  /**
   * 统计翻译情况
   * @param {Object} original - 原始对象
   * @param {Object} translated - 翻译后的对象
   * @returns {Object} 统计信息
   */
  getTranslationStats(original, translated) {
    let total = 0;
    let translatedCount = 0;

    const compare = (orig, trans) => {
      if (typeof orig !== 'object' || orig === null) {
        return;
      }

      for (const key in orig) {
        const origValue = orig[key];
        const transValue = trans[key];

        if (typeof origValue === 'string') {
          total++;
          if (transValue && transValue !== origValue) {
            translatedCount++;
          }
        } else if (typeof origValue === 'object' && origValue !== null) {
          compare(origValue, transValue || {});
        }
      }
    };

    compare(original, translated);

    const percentage = total > 0 ? Math.round((translatedCount / total) * 100) : 0;

    return {
      total,
      translated: translatedCount,
      untranslated: total - translatedCount,
      percentage
    };
  }
}

module.exports = TranslationGenerator;
