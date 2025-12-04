const VueParser = require('./vueParser');
const JsParser = require('./jsParser');

/**
 * 统一的解析器接口
 */
class Parser {
  constructor() {
    this.vueParser = new VueParser();
    this.jsParser = new JsParser();
  }

  /**
   * 根据文件类型选择解析器
   * @param {string} content 文件内容
   * @param {string} filePath 文件路径
   * @returns {Object}
   */
  parse(content, filePath) {
    const ext = filePath.split('.').pop();

    if (ext === 'vue') {
      return this.parseVue(content, filePath);
    } else if (ext === 'js' || ext === 'ts') {
      return this.parseJs(content, filePath, ext);
    }

    return null;
  }

  /**
   * 解析Vue文件
   * @param {string} content
   * @param {string} filePath
   * @returns {Object}
   */
  parseVue(content, filePath) {
    const result = this.vueParser.parse(content, filePath);
    if (!result) return null;

    return {
      type: 'vue',
      template: this.vueParser.getTemplateInfo(result.template),
      script: this.vueParser.getScriptInfo(result.script)
    };
  }

  /**
   * 解析JS/TS文件
   * @param {string} content
   * @param {string} filePath
   * @param {string} lang
   * @returns {Object}
   */
  parseJs(content, filePath, lang) {
    const ast = this.jsParser.parse(content, lang);
    if (!ast) return null;

    return {
      type: 'js',
      ast,
      content,
      lang
    };
  }

  getJsParser() {
    return this.jsParser;
  }

  getVueParser() {
    return this.vueParser;
  }
}

module.exports = Parser;
