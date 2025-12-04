const Parser = require('../parser');

/**
 * 中文文本提取器
 * 从Vue和JS文件中提取中文文本
 */
class Extractor {
  constructor(config) {
    this.config = config;
    this.parser = new Parser();
    this.results = {
      normal: {},
      templates: {}
    };
  }

  /**
   * 提取文件中的中文文本
   * @param {string} content 文件内容
   * @param {string} filePath 文件路径
   * @param {string} relativePath 相对路径
   */
  extract(content, filePath, relativePath) {
    const parsed = this.parser.parse(content, filePath);
    if (!parsed) return;

    if (parsed.type === 'vue') {
      this.extractFromVue(parsed, relativePath);
    } else if (parsed.type === 'js') {
      this.extractFromJs(parsed, relativePath);
    }
  }

  /**
   * 从Vue文件提取中文
   * @param {Object} parsed
   * @param {string} relativePath
   */
  extractFromVue(parsed, relativePath) {
    // 提取template中的中文
    if (parsed.template) {
      this.extractFromTemplate(
        parsed.template.content,
        relativePath,
        parsed.template.startLine
      );
    }

    // 提取script中的中文
    if (parsed.script) {
      const ast = this.parser.getJsParser().parse(
        parsed.script.content,
        parsed.script.lang
      );
      
      if (ast) {
        this.extractFromAst(
          ast,
          relativePath,
          'script',
          parsed.script.startLine
        );
      }
    }
  }

  /**
   * 从JS文件提取中文
   * @param {Object} parsed
   * @param {string} relativePath
   */
  extractFromJs(parsed, relativePath) {
    this.extractFromAst(parsed.ast, relativePath, 'file', 1);
  }

  /**
   * 从template提取中文
   * @param {string} content
   * @param {string} relativePath
   * @param {number} baseLineNumber
   */
  extractFromTemplate(content, relativePath, baseLineNumber) {
    const lines = content.split('\n');
    const chineseRegex = /[\u4e00-\u9fa5]+/;

    lines.forEach((line, index) => {
      const lineNumber = baseLineNumber + index;
      
      // 简单提取纯文本中的中文（不在标签属性中）
      // 匹配 >中文< 模式
      const textMatches = line.match(/>([^<]*[\u4e00-\u9fa5][^<]*)</g);
      
      if (textMatches) {
        textMatches.forEach(match => {
          const text = match.slice(1, -1).trim();
          if (text && chineseRegex.test(text)) {
            // 检查是否包含插值表达式
            if (text.includes('{{') && text.includes('}}')) {
              this.addTemplateString(text, relativePath, 'template', lineNumber);
            } else {
              this.addNormalString(text, relativePath, 'template', lineNumber);
            }
          }
        });
      }

      // 提取属性值中的中文
      const attrMatches = line.matchAll(/(?:placeholder|title|label|alt|value)=["']([^"']*[\u4e00-\u9fa5][^"']*)["']/g);
      
      for (const match of attrMatches) {
        const text = match[1].trim();
        if (text && chineseRegex.test(text)) {
          if (text.includes('{{') && text.includes('}}')) {
            this.addTemplateString(text, relativePath, 'template', lineNumber);
          } else {
            this.addNormalString(text, relativePath, 'template', lineNumber);
          }
        }
      }
    });
  }

  /**
   * 从AST提取中文字符串
   * @param {Object} ast
   * @param {string} relativePath
   * @param {string} section
   * @param {number} baseLineNumber
   */
  extractFromAst(ast, relativePath, section, baseLineNumber) {
    const jsParser = this.parser.getJsParser();

    jsParser.traverseStrings(ast, (node, parent, path) => {
      // 跳过import语句
      if (parent.type === 'ImportDeclaration') {
        return;
      }

      // 跳过require语句
      if (parent.type === 'CallExpression' && 
          parent.callee.name === 'require') {
        return;
      }

      if (node.type === 'StringLiteral') {
        const text = node.value;
        if (jsParser.hasChinese(text)) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          this.addNormalString(text, relativePath, section, lineNumber);
        }
      } else if (node.type === 'TemplateLiteral') {
        // 检查模板字符串是否包含中文
        let hasChinese = false;
        node.quasis.forEach(quasi => {
          if (jsParser.hasChinese(quasi.value.cooked)) {
            hasChinese = true;
          }
        });

        if (hasChinese) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          const templateInfo = jsParser.extractTemplateInfo(node);
          this.addTemplateString(
            templateInfo.template,
            relativePath,
            section,
            lineNumber,
            templateInfo.variables
          );
        }
      }
    });
  }

  /**
   * 添加普通字符串
   * @param {string} text
   * @param {string} filePath
   * @param {string} section
   * @param {number} line
   */
  addNormalString(text, filePath, section, line) {
    const key = `${filePath}::${section}::line:${line}`;
    this.results.normal[key] = text;
  }

  /**
   * 添加模板字符串
   * @param {string} text
   * @param {string} filePath
   * @param {string} section
   * @param {number} line
   * @param {Array} variables
   */
  addTemplateString(text, filePath, section, line, variables = []) {
    const key = `${filePath}::${section}::line:${line}`;
    
    // 提取Vue插值表达式中的变量
    if (text.includes('{{') && text.includes('}}')) {
      const vueVars = text.match(/\{\{([^}]+)\}\}/g);
      if (vueVars) {
        variables = vueVars.map(v => v.replace(/\{\{|\}\}/g, '').trim());
      }
    }

    this.results.templates[key] = {
      original: text,
      type: '__TEMPLATE__',
      variables
    };
  }

  /**
   * 获取提取结果
   * @returns {Object}
   */
  getResults() {
    return this.results;
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      normalCount: Object.keys(this.results.normal).length,
      templateCount: Object.keys(this.results.templates).length,
      total: Object.keys(this.results.normal).length + 
             Object.keys(this.results.templates).length
    };
  }
}

module.exports = Extractor;
