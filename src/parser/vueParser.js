const compiler = require('vue-template-compiler');

/**
 * Vue文件解析器
 * 使用vue-template-compiler解析Vue2单文件组件
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
      const descriptor = compiler.parseComponent(content, {
        pad: 'line'
      });

      // 转换为统一的格式
      const result = {
        template: descriptor.template ? {
          content: descriptor.template.content,
          loc: {
            start: { line: descriptor.template.start || 1 },
            end: { line: descriptor.template.end || content.split('\n').length }
          }
        } : null,
        script: descriptor.script ? {
          content: descriptor.script.content,
          loc: {
            start: { line: descriptor.script.start || 1 },
            end: { line: descriptor.script.end || content.split('\n').length }
          },
          lang: descriptor.script.lang || 'js',
          setup: false // Vue2 没有 setup
        } : null,
        styles: descriptor.styles || [],
        customBlocks: descriptor.customBlocks || []
      };

      return result;
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
