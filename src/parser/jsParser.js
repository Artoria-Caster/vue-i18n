const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

/**
 * JavaScript/TypeScript文件解析器
 * 使用Babel解析JS/TS文件，提取字符串
 */
class JsParser {
  /**
   * 解析JavaScript/TypeScript代码
   * @param {string} content 代码内容
   * @param {string} lang 语言类型 (js/ts)
   * @returns {Object} AST树
   */
  parse(content, lang = 'js') {
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          lang === 'ts' ? 'typescript' : 'flow',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'dynamicImport',
          'optionalChaining',
          'nullishCoalescingOperator'
        ]
      });

      return ast;
    } catch (error) {
      console.error('解析JavaScript代码失败:', error.message);
      return null;
    }
  }

  /**
   * 遍历AST提取字符串字面量
   * @param {Object} ast
   * @param {Function} callback 回调函数 (node, parent) => void
   */
  traverseStrings(ast, callback) {
    if (!ast) return;

    traverse(ast, {
      StringLiteral(path) {
        callback(path.node, path.parent, path);
      },
      TemplateLiteral(path) {
        callback(path.node, path.parent, path);
      }
    });
  }

  /**
   * 检查字符串是否包含中文
   * @param {string} str
   * @returns {boolean}
   */
  hasChinese(str) {
    return /[\u4e00-\u9fa5]/.test(str);
  }

  /**
   * 检查是否为模板字符串
   * @param {Object} node AST节点
   * @returns {boolean}
   */
  isTemplateLiteral(node) {
    return node.type === 'TemplateLiteral';
  }

  /**
   * 提取模板字符串的变量信息
   * @param {Object} node TemplateLiteral节点
   * @returns {Object}
   */
  extractTemplateInfo(node) {
    const variables = [];
    const parts = [];

    // 提取模板字符串的静态部分
    node.quasis.forEach((quasi, index) => {
      parts.push(quasi.value.cooked);
    });

    // 提取表达式变量
    node.expressions.forEach((expr, index) => {
      let varName = '';
      
      if (expr.type === 'Identifier') {
        varName = expr.name;
      } else if (expr.type === 'MemberExpression') {
        // 处理 obj.prop 形式
        varName = this.getMemberExpressionName(expr);
      } else {
        varName = `expr${index}`;
      }
      
      variables.push(varName);
    });

    // 重建模板字符串
    let template = parts[0];
    for (let i = 0; i < variables.length; i++) {
      template += `{${variables[i]}}${parts[i + 1]}`;
    }

    return {
      template,
      variables,
      parts
    };
  }

  /**
   * 获取成员表达式的名称
   * @param {Object} node MemberExpression节点
   * @returns {string}
   */
  getMemberExpressionName(node) {
    if (node.type === 'Identifier') {
      return node.name;
    }
    
    if (node.type === 'MemberExpression') {
      const object = this.getMemberExpressionName(node.object);
      const property = node.computed 
        ? `[${node.property.name || node.property.value}]`
        : `.${node.property.name}`;
      return object + property;
    }
    
    return 'unknown';
  }
}

module.exports = JsParser;
