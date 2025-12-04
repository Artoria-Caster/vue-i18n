const fs = require('fs');
const path = require('path');

/**
 * 转换验证器
 * 验证转换后文件是否还有未处理的中文
 */
class Validator {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.chineseRegex = /[\u4e00-\u9fa5]+/g;
    this.issues = [];
  }

  /**
   * 验证单个文件
   * @param {string} filePath 文件路径
   * @param {string} content 文件内容
   * @returns {Object} 验证结果
   */
  validateFile(filePath, content) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 跳过注释行
      if (this.isCommentLine(line, filePath)) {
        return;
      }

      // 检查是否包含中文
      const matches = line.matchAll(this.chineseRegex);
      for (const match of matches) {
        const chineseText = match[0];
        const context = this.getContext(line, match.index);
        
        // 检查是否已经在 $t() 或其他合法位置中
        if (this.isInTranslationCall(line, match.index)) {
          continue;
        }

        // 检查是否在注释中
        if (this.isInComment(line, match.index)) {
          continue;
        }

        // 检查是否在字符串字面量中但未转换
        if (this.isUnconvertedString(line, match.index)) {
          issues.push({
            line: lineNumber,
            column: match.index,
            text: chineseText,
            context: context,
            type: 'unconverted',
            severity: 'error'
          });
        }
      }
    });

    if (issues.length > 0) {
      this.issues.push({
        filePath,
        issues
      });
      
      if (this.logger) {
        this.logger.warn(`发现未转换的中文: ${filePath}`, {
          count: issues.length,
          examples: issues.slice(0, 3).map(i => ({
            line: i.line,
            text: i.text
          }))
        });
      }
    }

    return {
      filePath,
      hasIssues: issues.length > 0,
      issueCount: issues.length,
      issues
    };
  }

  /**
   * 验证多个文件
   * @param {Array<string>} filePaths 文件路径列表
   * @returns {Object} 验证结果汇总
   */
  async validateFiles(filePaths) {
    this.issues = [];
    const results = [];

    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const result = this.validateFile(filePath, content);
        results.push(result);
      } catch (error) {
        if (this.logger) {
          this.logger.error(`验证文件失败: ${filePath}`, { error: error.message });
        }
      }
    }

    const summary = {
      totalFiles: filePaths.length,
      filesWithIssues: results.filter(r => r.hasIssues).length,
      totalIssues: results.reduce((sum, r) => sum + r.issueCount, 0),
      results
    };

    return summary;
  }

  /**
   * 检查是否是注释行
   */
  isCommentLine(line, filePath) {
    const trimmed = line.trim();
    
    // JS/Vue 单行注释
    if (trimmed.startsWith('//')) {
      return true;
    }
    
    // HTML/Vue 注释
    if (trimmed.startsWith('<!--')) {
      return true;
    }
    
    // CSS 注释
    if (trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查中文是否在注释中
   */
  isInComment(line, position) {
    // 检查单行注释
    const commentIndex = line.indexOf('//');
    if (commentIndex !== -1 && commentIndex < position) {
      return true;
    }

    // 检查 HTML 注释
    const htmlCommentStart = line.indexOf('<!--');
    const htmlCommentEnd = line.indexOf('-->');
    if (htmlCommentStart !== -1 && htmlCommentStart < position) {
      if (htmlCommentEnd === -1 || position < htmlCommentEnd) {
        return true;
      }
    }

    // 检查块注释
    const blockCommentStart = line.indexOf('/*');
    const blockCommentEnd = line.indexOf('*/');
    if (blockCommentStart !== -1 && blockCommentStart < position) {
      if (blockCommentEnd === -1 || position < blockCommentEnd) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否在翻译调用中
   */
  isInTranslationCall(line, position) {
    // 检查 $t() 调用
    const tCallRegex = /\$t\s*\(\s*['"][^'"]*['"]\s*\)/g;
    let match;
    while ((match = tCallRegex.exec(line)) !== null) {
      if (match.index < position && position < match.index + match[0].length) {
        return true;
      }
    }

    // 检查 this.$t() 调用
    const thisTCallRegex = /this\.\$t\s*\(\s*['"][^'"]*['"]\s*\)/g;
    while ((match = thisTCallRegex.exec(line)) !== null) {
      if (match.index < position && position < match.index + match[0].length) {
        return true;
      }
    }

    // 检查 i18n.t() 调用
    const i18nTCallRegex = /i18n\.t\s*\(\s*['"][^'"]*['"]\s*\)/g;
    while ((match = i18nTCallRegex.exec(line)) !== null) {
      if (match.index < position && position < match.index + match[0].length) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否是未转换的字符串
   */
  isUnconvertedString(line, position) {
    // 检查是否在引号中
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplate = false;

    for (let i = 0; i < position; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : '';

      if (char === "'" && prevChar !== '\\') {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && prevChar !== '\\') {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && prevChar !== '\\') {
        inTemplate = !inTemplate;
      }
    }

    // 如果在字符串中，检查是否已经被转换
    if (inSingleQuote || inDoubleQuote || inTemplate) {
      // 检查附近是否有 $t(
      const before = line.substring(Math.max(0, position - 20), position);
      if (before.includes('$t(') || before.includes('$t (')) {
        return false;
      }
      return true;
    }

    // 检查是否在模板插值中但不在 $t() 中
    const beforeContext = line.substring(Math.max(0, position - 10), position);
    const afterContext = line.substring(position, Math.min(line.length, position + 10));
    
    if (beforeContext.includes('{{') && afterContext.includes('}}')) {
      // 在插值表达式中
      if (!beforeContext.includes('$t(') && !afterContext.includes('$t(')) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取上下文
   */
  getContext(line, position, length = 40) {
    const start = Math.max(0, position - length);
    const end = Math.min(line.length, position + length);
    const context = line.substring(start, end);
    
    let prefix = '';
    let suffix = '';
    
    if (start > 0) prefix = '...';
    if (end < line.length) suffix = '...';
    
    return prefix + context + suffix;
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    if (this.issues.length === 0) {
      return {
        success: true,
        message: '✓ 所有文件验证通过，未发现未转换的中文文本'
      };
    }

    const report = {
      success: false,
      message: `✗ 发现 ${this.issues.length} 个文件包含未转换的中文`,
      totalIssues: this.issues.reduce((sum, file) => sum + file.issues.length, 0),
      files: this.issues
    };

    if (this.logger) {
      this.logger.warn('验证发现问题', {
        filesWithIssues: this.issues.length,
        totalIssues: report.totalIssues
      });

      // 记录详细问题
      this.issues.forEach(file => {
        this.logger.warn(`  ${file.filePath}: ${file.issues.length} 处未转换`);
        file.issues.slice(0, 3).forEach(issue => {
          this.logger.warn(`    行 ${issue.line}: "${issue.text}"`);
        });
        if (file.issues.length > 3) {
          this.logger.warn(`    ... 还有 ${file.issues.length - 3} 处`);
        }
      });
    }

    return report;
  }

  /**
   * 将报告保存到文件
   */
  saveReport(outputPath) {
    try {
      const report = this.generateReport();
      
      let content = '# 国际化转换验证报告\n\n';
      content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
      
      if (report.success) {
        content += report.message + '\n';
      } else {
        content += `## 概要\n\n`;
        content += `- 问题文件数: ${this.issues.length}\n`;
        content += `- 未转换文本总数: ${report.totalIssues}\n\n`;
        content += `## 详细列表\n\n`;
        
        this.issues.forEach(file => {
          content += `### ${file.filePath}\n\n`;
          content += `发现 ${file.issues.length} 处未转换的中文:\n\n`;
          
          file.issues.forEach((issue, index) => {
            content += `${index + 1}. **行 ${issue.line}**: \`${issue.text}\`\n`;
            content += `   \`\`\`\n   ${issue.context}\n   \`\`\`\n\n`;
          });
        });
      }
      
      fs.writeFileSync(outputPath, content, 'utf-8');
      
      if (this.logger) {
        this.logger.info(`验证报告已保存: ${outputPath}`);
      }
      
      return outputPath;
    } catch (error) {
      if (this.logger) {
        this.logger.error('保存验证报告失败', { error: error.message });
      }
      throw error;
    }
  }

  /**
   * 获取所有问题
   */
  getIssues() {
    return this.issues;
  }

  /**
   * 清空问题列表
   */
  clear() {
    this.issues = [];
  }
}

module.exports = Validator;
