const fs = require('fs');
const path = require('path');

/**
 * 翻译生成器
 * 根据zh-cn.js和填充好的translation-template.txt生成其他语言的配置文件
 */
class TranslationGenerator {
  constructor(config) {
    this.config = config || {};
  }

  /**
   * 读取zh-cn语言包文件夹
   * @param {string} zhCNPath - zh-cn文件夹路径
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
      throw new Error(`读取zh-cn语言包失败: ${error.message}`);
    }
  }

  /**
   * 读取zh-cn文件夹中的所有模块
   * @param {string} folderPath - zh-cn文件夹路径
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
   * 读取zh-cn.js单文件(兼容旧格式)
   * @param {string} zhCNPath - zh-cn.js文件路径
   * @returns {Object} 解析后的中文语言包对象
   */
  readZhCNSingleFile(zhCNPath) {
    if (!fs.existsSync(zhCNPath)) {
      throw new Error(`zh-cn.js文件不存在: ${zhCNPath}`);
    }

    const content = fs.readFileSync(zhCNPath, 'utf-8');
    
    // 移除export default，将其转换为可执行的JS对象
    const cleanContent = content
      .replace(/export\s+default\s+/, 'module.exports = ')
      .replace(/\r\n/g, '\n');
    
    // 创建临时文件以便require
    const tempFile = path.resolve(path.dirname(zhCNPath), '.temp_zh-cn.js');
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
   * @param {Array} missingItems - 收集缺失翻译的数组（可选）
   * @param {string} currentPath - 当前处理的路径（可选）
   * @param {string} moduleName - 当前模块名（可选）
   * @returns {Object} 翻译后的对象
   */
  translateObject(obj, translationMap, missingItems = null, currentPath = '', moduleName = '') {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const result = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      const value = obj[key];
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (typeof value === 'string') {
        // 尝试翻译字符串值
        let translatedValue = '';
        let status = 'missing'; // missing: 模板中不存在, empty: 模板中存在但为空
        
        if (translationMap.has(value)) {
          translatedValue = translationMap.get(value);
          if (translatedValue === '') {
            status = 'empty';
          } else {
            status = 'translated';
          }
        }
        
        result[key] = translatedValue;
        
        // 收集缺失或空翻译的条目
        if (missingItems && (status === 'missing' || status === 'empty')) {
          missingItems.push({
            module: moduleName,
            path: newPath,
            chinese: value,
            status: status
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        // 递归处理嵌套对象
        result[key] = this.translateObject(value, translationMap, missingItems, newPath, moduleName);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 翻译对象并跟踪模块信息
   * @param {Object} zhCNData - 中文语言包数据
   * @param {Map} translationMap - 翻译映射
   * @param {Array} missingItems - 收集缺失翻译的数组
   * @returns {Object} 翻译后的对象
   */
  translateObjectWithTracking(zhCNData, translationMap, missingItems) {
    const result = {};
    
    for (const [moduleName, moduleData] of Object.entries(zhCNData)) {
      result[moduleName] = this.translateObject(moduleData, translationMap, missingItems, '', moduleName);
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
   * @param {string} zhCNPath - zh-cn文件夹或文件路径
   * @param {string} templatePath - translation-template.txt文件路径
   * @param {string} targetLang - 目标语言代码，如 'en-us', 'ja-jp' 等
   * @param {string} outputDir - 输出目录，默认为zh-cn所在目录
   * @returns {string} 生成的文件夹或文件路径
   */
  async generate(zhCNPath, templatePath, targetLang = 'en-us', outputDir = null) {
    console.log(`\n开始生成${targetLang}语言包...`);
    
    // 1. 读取zh-cn
    console.log('1. 读取zh-cn语言包...');
    const zhCNData = this.readZhCNFile(zhCNPath);
    console.log(`   ✓ 成功读取中文语言包`);

    // 2. 读取翻译模板
    console.log('2. 读取翻译模板...');
    const translationMap = this.readTranslationTemplate(templatePath);
    console.log(`   ✓ 成功读取 ${translationMap.size} 条翻译`);

    // 3. 执行翻译（同时收集缺失翻译）
    console.log('3. 执行翻译...');
    const missingItems = [];
    const translatedData = this.translateObjectWithTracking(zhCNData, translationMap, missingItems);

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
      // 生成文件夹结构，将语言代码转换为小写，并放在 lang 子目录中
      const outputFolderPath = path.join(output, 'lang', targetLang.toLowerCase());
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
      
      // 生成缺失翻译报告
      await this.generateMissingReport(missingItems, targetLang, output, outputFolderPath);
      
      return outputFolderPath;
    } else {
      // 生成单文件（兼容旧格式），将语言代码转换为小写，并放在 lang 子目录中
      const langDir = path.join(output, 'lang');
      await fs.promises.mkdir(langDir, { recursive: true });
      const outputPath = path.join(langDir, `${targetLang.toLowerCase()}.js`);
      const fileContent = `export default ${this.formatObjectToJS(translatedData, 0)};\n`;
      await fs.promises.writeFile(outputPath, fileContent, 'utf-8');
      
      console.log(`   ✓ 已生成: ${outputPath}`);
      
      // 生成缺失翻译报告
      await this.generateMissingReport(missingItems, targetLang, output, outputPath);
      
      return outputPath;
    }
  }

  /**
   * 生成缺失翻译报告
   * @param {Array} missingItems - 缺失翻译的条目数组
   * @param {string} targetLang - 目标语言
   * @param {string} outputDir - 输出目录
   * @param {string} outputFolderPath - 生成的语言包路径
   */
  async generateMissingReport(missingItems, targetLang, outputDir, outputFolderPath) {
    if (missingItems.length === 0) {
      console.log('\n   ✓ 所有条目均已翻译完成！');
      return;
    }

    console.log(`\n5. 生成缺失翻译报告...`);
    
    const reportPath = path.join(outputDir, `missing-translations-${targetLang}.txt`);
    const lines = [];
    
    lines.push('======================================');
    lines.push(`  ${targetLang.toUpperCase()} 缺失翻译报告`);
    lines.push('======================================');
    lines.push('');
    lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`语言包路径: ${outputFolderPath}`);
    lines.push(`总计缺失: ${missingItems.length} 条`);
    lines.push('');
    lines.push('--------------------------------------');
    lines.push('');
    
    // 按模块分组
    const groupedByModule = {};
    for (const item of missingItems) {
      if (!groupedByModule[item.module]) {
        groupedByModule[item.module] = [];
      }
      groupedByModule[item.module].push(item);
    }
    
    // 生成每个模块的报告
    for (const [moduleName, items] of Object.entries(groupedByModule)) {
      lines.push(`## 模块: ${moduleName}`);
      lines.push(`   文件: ${path.join(outputFolderPath, moduleName.charAt(0).toLowerCase() + moduleName.slice(1) + '.js')}`);
      lines.push(`   缺失: ${items.length} 条`);
      lines.push('');
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        lines.push(`${i + 1}. ${item.status === 'missing' ? '[不存在]' : '[空翻译]'}`);
        lines.push(`   路径: ${item.path}`);
        lines.push(`   原文: ${item.chinese}`);
        lines.push(`   状态: ${item.status === 'missing' ? '翻译模板中不存在此条目' : '翻译模板中为空字符串'}`);
        lines.push('');
      }
      
      lines.push('--------------------------------------');
      lines.push('');
    }
    
    lines.push('提示：');
    lines.push('1. [不存在] 表示该条目在 translation-template.txt 中未找到');
    lines.push('2. [空翻译] 表示该条目在 translation-template.txt 中存在但翻译为空');
    lines.push('3. 请在 translation-template.txt 中补充翻译后，重新运行 translate 命令');
    lines.push('');
    
    await fs.promises.writeFile(reportPath, lines.join('\n'), 'utf-8');
    console.log(`   ✓ 报告已生成: ${reportPath}`);
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
