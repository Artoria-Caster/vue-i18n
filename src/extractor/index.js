const Parser = require('../parser');

/**
 * 中文文本提取器
 * 从Vue和JS文件中提取中文文本
 */
class Extractor {
  constructor(config, logger = null) {
    this.config = config;
    this.parser = new Parser();
    this.logger = logger;
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
    const chineseRegex = /[\u4e00-\u9fa5]+/;

    // 方法1: 提取标签之间的文本内容（包括跨行）
    // 移除HTML注释
    const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // 改进的正则：匹配标签之间的所有内容，包括可能包含其他标签的情况
    const textMatches = contentWithoutComments.matchAll(/>([^<]+)(?=<)/g);
    
    for (const match of textMatches) {
      const text = match[1].trim();
      if (text && chineseRegex.test(text) && text.length > 0) {
        // 计算这个文本在原始内容中的行号
        const textIndex = match.index + 1; // +1 跳过 '>'
        const beforeText = content.substring(0, textIndex);
        const lineNumber = baseLineNumber + (beforeText.match(/\n/g) || []).length;
        
        // 检查是否包含插值表达式
        if (text.includes('{{') && text.includes('}}')) {
          // 检查是否包含三元运算符
          if (text.includes('?') && text.includes(':')) {
            // 提取三元运算符中的字符串
            this.extractTernaryStrings(text, relativePath, lineNumber);
            if (this.logger) {
              this.logger.logExtracted(text, relativePath, 'template', lineNumber, '三元运算符表达式');
            }
          } else {
            this.addTemplateString(text, relativePath, 'template', lineNumber);
            if (this.logger) {
              this.logger.logExtracted(text, relativePath, 'template', lineNumber, '模板插值表达式');
            }
          }
        } else {
          // 提取纯文本
          if (!text.includes('<') && !text.includes('>')) {
            this.addNormalString(text, relativePath, 'template', lineNumber);
            if (this.logger) {
              this.logger.logExtracted(text, relativePath, 'template', lineNumber, '纯文本');
            }
          } else {
            // 对于混合了标签的文本，尝试分离提取纯中文部分
            this.extractMixedContent(text, relativePath, lineNumber);
          }
        }
      }
    }

    // 方法2: 提取属性值中的中文（逐行处理）
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNumber = baseLineNumber + index;
      
      // 跳过HTML注释行
      if (line.trim().startsWith('<!--') || line.includes('<!--')) {
        if (this.logger && chineseRegex.test(line)) {
          this.logger.logSkipped(line.trim(), relativePath, 'template', lineNumber, 'HTML注释');
        }
        return;
      }
      
      // 提取属性值中的中文
      const attrMatches = line.matchAll(/(?:placeholder|title|label|alt|value)=["']([^"']*[\u4e00-\u9fa5][^"']*)["']/g);
      
      for (const match of attrMatches) {
        const text = match[1].trim();
        if (text && chineseRegex.test(text)) {
          if (text.includes('{{') && text.includes('}}')) {
            this.addTemplateString(text, relativePath, 'template', lineNumber);
            if (this.logger) {
              this.logger.logExtracted(text, relativePath, 'template', lineNumber, '属性值(模板)');
            }
          } else {
            this.addNormalString(text, relativePath, 'template', lineNumber);
            if (this.logger) {
              this.logger.logExtracted(text, relativePath, 'template', lineNumber, '属性值');
            }
          }
        }
      }
    });
  }

  /**
   * 提取混合了文本和标签的内容
   * 例如: "还没有账号？<el-button>注册</el-button>"
   * @param {string} text
   * @param {string} relativePath
   * @param {number} lineNumber
   */
  extractMixedContent(text, relativePath, lineNumber) {
    const chineseRegex = /[\u4e00-\u9fa5]+/g;
    
    // 临时移除标签，只保留纯文本
    const textOnly = text.replace(/<[^>]+>/g, '');
    
    // 提取所有中文片段
    const matches = textOnly.matchAll(chineseRegex);
    let extractCount = 0;
    
    for (const match of matches) {
      const chineseText = match[0];
      if (chineseText && chineseText.length > 0) {
        // 为每个中文片段创建唯一的key
        const uniqueKey = `${relativePath}::template::line:${lineNumber}::mixed:${extractCount}`;
        this.results.normal[uniqueKey] = chineseText;
        extractCount++;
        
        if (this.logger) {
          this.logger.logExtracted(chineseText, relativePath, 'template', lineNumber, '混合内容片段');
        }
      }
    }
    
    if (extractCount === 0 && this.logger) {
      this.logger.logSkipped(text, relativePath, 'template', lineNumber, '混合内容无法分离');
    }
  }

  /**
   * 检查节点是否在console调用中（console.log, console.warn等）
   * @param {Object} path Babel path对象
   * @returns {boolean}
   */
  isInConsoleCall(path) {
    let current = path;
    while (current) {
      const parent = current.parent;
      
      // 检查是否是 console.xxx() 调用
      if (parent && parent.type === 'CallExpression') {
        const callee = parent.callee;
        if (callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'console') {
          return true;
        }
      }
      
      current = current.parentPath;
    }
    return false;
  }

  /**
   * 检查节点是否在注释中
   * @param {Object} node AST节点
   * @param {Object} path Babel path对象
   * @returns {boolean}
   */
  isInComment(node, path) {
    // 仅当注释真正包裹了该节点时才认为其位于注释中
    if (this.isNodeCoveredByComments(node, node.leadingComments) ||
        this.isNodeCoveredByComments(node, node.trailingComments)) {
      return true;
    }

    // 向上检查父级节点，防止外层块注释整体包裹
    let current = path;
    while (current) {
      const currentNode = current.node;
      if (this.isNodeCoveredByComments(node, currentNode?.leadingComments) ||
          this.isNodeCoveredByComments(node, currentNode?.trailingComments)) {
        return true;
      }
      current = current.parentPath;
    }

    return false;
  }

  /**
   * 判断注释是否覆盖整个节点（用于跳过真正位于注释中的文本）
   * @param {Object} node
   * @param {Array} comments
   * @returns {boolean}
   */
  isNodeCoveredByComments(node, comments) {
    if (!node || typeof node.start !== 'number' || typeof node.end !== 'number') {
      return false;
    }

    if (!Array.isArray(comments) || comments.length === 0) {
      return false;
    }

    return comments.some(comment => {
      if (typeof comment.start !== 'number' || typeof comment.end !== 'number') {
        return false;
      }
      return comment.start <= node.start && comment.end >= node.end;
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
        if (this.logger) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          this.logger.logSkipped(node.value || '', relativePath, section, lineNumber, 'import语句');
        }
        return;
      }

      // 跳过require语句
      if (parent.type === 'CallExpression' && 
          parent.callee.name === 'require') {
        if (this.logger) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          this.logger.logSkipped(node.value || '', relativePath, section, lineNumber, 'require语句');
        }
        return;
      }

      // 跳过console调用（console.log, console.warn, console.error等）
      if (this.isInConsoleCall(path)) {
        if (this.logger) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          this.logger.logSkipped(node.value || '', relativePath, section, lineNumber, 'console调用');
        }
        return;
      }

      // 跳过注释中的内容
      if (this.isInComment(node, path)) {
        if (this.logger) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          this.logger.logSkipped(node.value || '', relativePath, section, lineNumber, '注释');
        }
        return;
      }

      if (node.type === 'StringLiteral') {
        const text = node.value;
        if (jsParser.hasChinese(text)) {
          const lineNumber = node.loc ? node.loc.start.line + baseLineNumber - 1 : 0;
          this.addNormalString(text, relativePath, section, lineNumber);
          if (this.logger) {
            this.logger.logExtracted(text, relativePath, section, lineNumber, '字符串字面量');
          }
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
            templateInfo.variables,
            templateInfo.fullPaths // 传递完整路径信息
          );
          if (this.logger) {
            this.logger.logExtracted(templateInfo.template, relativePath, section, lineNumber, '模板字面量');
          }
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
   * 从三元运算符中提取字符串
   * @param {string} text 包含三元运算符的文本，如 {{ condition ? '中文1' : '中文2' }}
   * @param {string} filePath
   * @param {number} line
   */
  extractTernaryStrings(text, filePath, line) {
    const chineseRegex = /[\u4e00-\u9fa5]+/;
    
    // 提取所有单引号或双引号包裹的字符串
    const stringMatches = text.matchAll(/['"]([^'"]+)['"]/g);
    
    let index = 0;
    for (const match of stringMatches) {
      const str = match[1];
      // 只提取包含中文的字符串
      if (str && chineseRegex.test(str)) {
        // 使用唯一的key，避免同一行多个字符串互相覆盖
        const uniqueKey = `${filePath}::template::line:${line}::str:${index}`;
        this.results.normal[uniqueKey] = str;
        index++;
      }
    }
  }

  /**
   * 添加模板字符串
   * @param {string} text
   * @param {string} filePath
   * @param {string} section
   * @param {number} line
   * @param {Array} variables
   * @param {Array} fullPaths 完整变量路径
   */
  addTemplateString(text, filePath, section, line, variables = [], fullPaths = []) {
    const key = `${filePath}::${section}::line:${line}`;
    
    // 提取Vue插值表达式中的变量
    if (text.includes('{{') && text.includes('}}')) {
      const vueVars = text.match(/\{\{([^}]+)\}\}/g);
      if (vueVars) {
        variables = vueVars.map(v => v.replace(/\{\{|\}\}/g, '').trim());
        fullPaths = variables; // Vue表达式就是完整路径
        
        // 跳过包含复杂表达式的模板（如三元运算符、函数调用等）
        const hasComplexExpression = variables.some(v => {
          return v.includes('?') || v.includes(':') || 
                 v.includes('(') || v.includes(')') ||
                 v.includes('>') || v.includes('<') ||
                 v.includes('&&') || v.includes('||');
        });
        
        if (hasComplexExpression) {
          console.warn(`跳过复杂表达式: ${text.substring(0, 50)}...`);
          return;
        }
      }
    }

    this.results.templates[key] = {
      original: text,
      type: '__TEMPLATE__',
      variables,
      fullPaths: fullPaths.length > 0 ? fullPaths : variables // 保存完整路径
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
