const { parse: parseVue } = require('@vue/compiler-sfc');

/**
 * Vue文件解析器
 * 使用@vue/compiler-sfc解析Vue单文件组件
 */
class VueParser {
  /**
   * 解析Vue文件内容
   * @param {string} content Vue文件内容
   * @param {string} filePath 文件路径
   * @returns {Object} 解析结果
   */
  parse(content, filePath) {
    try {
      const { descriptor, errors } = parseVue(content, {
        filename: filePath
      });

      if (errors && errors.length > 0) {
        console.warn(`解析Vue文件时有警告 ${filePath}:`, errors);
      }

      return {
        template: descriptor.template,
        script: descriptor.script || descriptor.scriptSetup,
        styles: descriptor.styles,
        customBlocks: descriptor.customBlocks
      };
    } catch (error) {
      console.error(`解析Vue文件失败 ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * 获取template区域的文本内容和位置信息
   * @param {Object} template
   * @returns {Object}
   */
  getTemplateInfo(template) {
    if (!template) return null;

    return {
      content: template.content,
      loc: template.loc,
      // 起始行号（从1开始）
      startLine: template.loc.start.line,
      endLine: template.loc.end.line
    };
  }

  /**
   * 获取script区域的文本内容和位置信息
   * @param {Object} script
   * @returns {Object}
   */
  getScriptInfo(script) {
    if (!script) return null;

    return {
      content: script.content,
      loc: script.loc,
      startLine: script.loc.start.line,
      endLine: script.loc.end.line,
      lang: script.lang || 'js',
      setup: script.setup || false
    };
  }
}

module.exports = VueParser;
