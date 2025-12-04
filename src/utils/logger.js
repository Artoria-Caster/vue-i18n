const fs = require('fs');
const path = require('path');

/**
 * 日志记录器
 * 支持控制台输出和文件输出
 */
class Logger {
  constructor(config = {}) {
    this.logLevel = config.logLevel || 'info'; // debug, info, warn, error
    this.enableFileLog = config.enableFileLog !== false;
    this.logDir = config.logDir || './logs';
    this.logFile = null;
    this.logs = {
      extracted: [],    // 已提取的文本
      skipped: [],      // 跳过的文本
      replaced: [],     // 已替换的文本
      failed: [],       // 失败的替换
      warnings: []      // 警告信息
    };

    if (this.enableFileLog) {
      this.initLogFile();
    }
  }

  /**
   * 初始化日志文件
   */
  initLogFile() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      this.logFile = path.join(this.logDir, `i18n-conversion-${timestamp}.log`);
      
      // 写入日志头
      const header = `
========================================
  Vue i18n 转换工具 - 详细日志
  时间: ${new Date().toLocaleString('zh-CN')}
========================================

`;
      fs.writeFileSync(this.logFile, header, 'utf-8');
    } catch (error) {
      console.error('初始化日志文件失败:', error.message);
      this.enableFileLog = false;
    }
  }

  /**
   * 写入日志
   */
  log(level, message, data = null) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex < currentLevelIndex) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // 控制台输出（只在非debug级别）
    if (level !== 'debug') {
      const colors = {
        info: '\x1b[36m',    // cyan
        warn: '\x1b[33m',    // yellow
        error: '\x1b[31m',   // red
        debug: '\x1b[90m'    // gray
      };
      const reset = '\x1b[0m';
      const color = colors[level] || '';
      
      if (level === 'error') {
        console.error(`${color}${message}${reset}`);
      } else if (level === 'warn') {
        console.warn(`${color}${message}${reset}`);
      }
    }

    // 文件输出
    if (this.enableFileLog && this.logFile) {
      try {
        let fullMessage = logMessage;
        if (data) {
          fullMessage += '\n' + JSON.stringify(data, null, 2);
        }
        fullMessage += '\n';
        fs.appendFileSync(this.logFile, fullMessage, 'utf-8');
      } catch (error) {
        // 静默失败
      }
    }
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  /**
   * 记录提取的文本
   */
  logExtracted(text, filePath, section, line, reason = '') {
    const entry = {
      text,
      filePath,
      section,
      line,
      reason,
      timestamp: new Date().toISOString()
    };
    this.logs.extracted.push(entry);
    this.debug(`[提取] ${filePath}:${line} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, { reason });
  }

  /**
   * 记录跳过的文本
   */
  logSkipped(text, filePath, section, line, reason) {
    const entry = {
      text,
      filePath,
      section,
      line,
      reason,
      timestamp: new Date().toISOString()
    };
    this.logs.skipped.push(entry);
    this.debug(`[跳过] ${filePath}:${line} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" - ${reason}`);
  }

  /**
   * 记录替换的文本
   */
  logReplaced(original, replacement, filePath, line) {
    const entry = {
      original,
      replacement,
      filePath,
      line,
      timestamp: new Date().toISOString()
    };
    this.logs.replaced.push(entry);
    this.debug(`[替换] ${filePath}:${line} "${original}" -> "${replacement}"`);
  }

  /**
   * 记录失败的替换
   */
  logReplaceFailed(original, filePath, line, reason) {
    const entry = {
      original,
      filePath,
      line,
      reason,
      timestamp: new Date().toISOString()
    };
    this.logs.failed.push(entry);
    this.warn(`[替换失败] ${filePath}:${line} "${original}" - ${reason}`);
  }

  /**
   * 记录警告
   */
  logWarning(message, data) {
    const entry = {
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.logs.warnings.push(entry);
    this.warn(message, data);
  }

  /**
   * 生成详细报告
   */
  generateReport() {
    const report = {
      summary: {
        extracted: this.logs.extracted.length,
        skipped: this.logs.skipped.length,
        replaced: this.logs.replaced.length,
        failed: this.logs.failed.length,
        warnings: this.logs.warnings.length
      },
      details: this.logs
    };

    if (this.enableFileLog && this.logFile) {
      try {
        const reportContent = `
========================================
  转换报告汇总
========================================

提取统计:
  - 成功提取: ${report.summary.extracted} 条
  - 跳过处理: ${report.summary.skipped} 条

替换统计:
  - 成功替换: ${report.summary.replaced} 条
  - 替换失败: ${report.summary.failed} 条

警告信息: ${report.summary.warnings} 条

========================================
详细日志已保存至: ${this.logFile}
========================================

`;
        fs.appendFileSync(this.logFile, reportContent, 'utf-8');

        // 如果有失败的替换，生成详细列表
        if (this.logs.failed.length > 0) {
          let failedList = '\n失败的替换列表:\n';
          this.logs.failed.forEach((item, index) => {
            failedList += `\n${index + 1}. ${item.filePath}:${item.line}\n`;
            failedList += `   文本: "${item.original}"\n`;
            failedList += `   原因: ${item.reason}\n`;
          });
          fs.appendFileSync(this.logFile, failedList, 'utf-8');
        }

        // 如果有跳过的内容，生成分类汇总
        if (this.logs.skipped.length > 0) {
          const skipReasons = {};
          this.logs.skipped.forEach(item => {
            if (!skipReasons[item.reason]) {
              skipReasons[item.reason] = [];
            }
            skipReasons[item.reason].push(item);
          });

          let skipSummary = '\n\n跳过原因统计:\n';
          for (const [reason, items] of Object.entries(skipReasons)) {
            skipSummary += `\n${reason}: ${items.length} 条\n`;
            // 只列出前5个示例
            items.slice(0, 5).forEach(item => {
              skipSummary += `  - ${item.filePath}:${item.line} "${item.text.substring(0, 40)}..."\n`;
            });
            if (items.length > 5) {
              skipSummary += `  ... 还有 ${items.length - 5} 条\n`;
            }
          }
          fs.appendFileSync(this.logFile, skipSummary, 'utf-8');
        }
      } catch (error) {
        this.error('生成报告失败', { error: error.message });
      }
    }

    return report;
  }

  /**
   * 获取日志统计
   */
  getStats() {
    return {
      extracted: this.logs.extracted.length,
      skipped: this.logs.skipped.length,
      replaced: this.logs.replaced.length,
      failed: this.logs.failed.length,
      warnings: this.logs.warnings.length
    };
  }

  /**
   * 生成待处理记录文件
   * 专门记录转换失败的中文文本，方便手动处理
   * @param {string} outputDir 输出目录
   * @returns {string|null} 生成的文件路径，如果没有失败记录则返回null
   */
  generatePendingTasks(outputDir) {
    // 如果没有失败记录，则不生成文件
    if (this.logs.failed.length === 0) {
      return null;
    }

    try {
      // 确保输出目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const pendingFilePath = path.join(outputDir, `pending-tasks-${timestamp}.md`);

      // 生成Markdown格式的待处理任务文件
      let content = `# Vue i18n 转换待处理任务\n\n`;
      content += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
      content += `本文件记录了在i18n转换过程中**失败**的中文文本，需要手动处理。\n\n`;
      content += `> 注：console.log和注释中的文本已被主动跳过，不会出现在此列表中。\n\n`;

      // 统计信息
      content += `## 📊 统计概览\n\n`;
      content += `- **需要手动处理**: ${this.logs.failed.length} 条\n\n`;

      // 统计信息
      content += `## 📊 统计概览\n\n`;
      content += `- **需要手动处理**: ${this.logs.failed.length} 条\n\n`;

      // 转换失败的记录
      content += `## ❌ 转换失败 - 需要手动处理\n\n`;
      content += `以下文本在自动替换过程中失败，需要手动处理：\n\n`;

      // 按文件分组
      const failedByFile = {};
      this.logs.failed.forEach(item => {
        if (!failedByFile[item.filePath]) {
          failedByFile[item.filePath] = [];
        }
        failedByFile[item.filePath].push(item);
      });

      let index = 1;
      for (const [filePath, items] of Object.entries(failedByFile)) {
        content += `### ${index}. \`${filePath}\`\n\n`;
        
        // 去重（同一行号的重复记录只显示一次）
        const uniqueItems = [];
        const seenLines = new Set();
        for (const item of items) {
          const key = `${item.line}-${item.original}`;
          if (!seenLines.has(key)) {
            seenLines.add(key);
            uniqueItems.push(item);
          }
        }
        
        uniqueItems.forEach(item => {
          content += `- **行号**: ${item.line}\n`;
          content += `  - **原文**: \`${item.original}\`\n`;
          content += `  - **原因**: ${item.reason}\n`;
          content += `  - **处理状态**: [ ] 待处理\n\n`;
        });
        index++;
      }

      // 处理建议
      content += `\n---\n\n`;
      content += `## 💡 处理建议\n\n`;
      content += `### 常见失败原因及解决方法\n\n`;
      content += `#### 1. 未找到匹配的文本\n`;
      content += `**原因**: 文本格式在替换前发生了变化，或包含特殊字符导致匹配失败\n\n`;
      content += `**解决方法**:\n`;
      content += `- 手动定位到对应文件和行号\n`;
      content += `- 查看实际的文本内容\n`;
      content += `- 手动添加 \`$t()\` 调用\n\n`;
      content += `**示例**:\n`;
      content += `\`\`\`vue\n`;
      content += `<!-- 修改前 -->\n`;
      content += `<span>{{ currentProduct.stock }}件</span>\n\n`;
      content += `<!-- 修改后 -->\n`;
      content += `<span>{{ currentProduct.stock }}{{ $t('common.unit') }}</span>\n`;
      content += `\`\`\`\n\n`;
      content += `#### 2. 复杂模板表达式\n`;
      content += `**原因**: 包含变量插值的复杂文本\n\n`;
      content += `**解决方法**: 使用 i18n 的参数插值功能\n\n`;
      content += `**示例**:\n`;
      content += `\`\`\`javascript\n`;
      content += `// 语言包添加\n`;
      content += `{\n`;
      content += `  "welcome": "您好，{name}！今天是{date}，祝您工作愉快！"\n`;
      content += `}\n\n`;
      content += `// 模板中使用\n`;
      content += `{{ $t('welcome', { name: userName, date: todayDate }) }}\n`;
      content += `\`\`\`\n\n`;
      content += `### 手动处理流程\n\n`;
      content += `1. **定位文件**: 根据上面列出的文件路径打开对应文件\n`;
      content += `2. **跳转行号**: 在 VS Code 中按 \`Ctrl+G\` 输入行号快速跳转\n`;
      content += `3. **查看上下文**: 了解文本的实际使用场景\n`;
      content += `4. **添加翻译**:\n`;
      content += `   - 在语言包文件中添加对应的 key 和翻译\n`;
      content += `   - 在源文件中使用 \`$t('key')\` 替换原文\n`;
      content += `5. **标记完成**: 在本文件中的 \`[ ]\` 打勾标记为 \`[x]\`\n`;
      content += `6. **运行验证**:\n`;
      content += `   \`\`\`bash\n`;
      content += `   node src/index.js validate\n`;
      content += `   \`\`\`\n\n`;
      content += `### 快捷操作提示\n\n`;
      content += `- **VS Code 快速跳转**: \`Ctrl+P\` 输入文件名，\`:行号\` 跳转到指定行\n`;
      content += `- **搜索文本**: \`Ctrl+F\` 在当前文件中搜索原文\n`;
      content += `- **全局搜索**: \`Ctrl+Shift+F\` 在整个项目中搜索\n\n`;

      // 写入文件
      fs.writeFileSync(pendingFilePath, content, 'utf-8');

      // 同时生成JSON格式的数据文件，方便程序化处理
      const jsonFilePath = path.join(outputDir, `pending-tasks-${timestamp}.json`);
      
      // JSON中也去重
      const uniqueFailed = [];
      const seenKeys = new Set();
      for (const item of this.logs.failed) {
        const key = `${item.filePath}-${item.line}-${item.original}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueFailed.push(item);
        }
      }
      
      const jsonData = {
        generatedAt: new Date().toISOString(),
        summary: {
          failed: uniqueFailed.length,
          total: uniqueFailed.length
        },
        failed: uniqueFailed
      };
      fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

      console.log(`\n📝 待处理任务记录已生成:`);
      console.log(`   Markdown: ${pendingFilePath}`);
      console.log(`   JSON: ${jsonFilePath}`);
      console.log(`   需要手动处理: ${uniqueFailed.length} 条`);

      return pendingFilePath;
    } catch (error) {
      this.error('生成待处理任务文件失败', { error: error.message });
      return null;
    }
  }

  /**
   * 清空日志
   */
  clear() {
    this.logs = {
      extracted: [],
      skipped: [],
      replaced: [],
      failed: [],
      warnings: []
    };
  }
}

module.exports = Logger;
