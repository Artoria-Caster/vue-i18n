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
