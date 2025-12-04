const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * 文件扫描模块
 * 递归扫描目标项目目录，根据配置过滤文件
 */
class Scanner {
  constructor(config) {
    this.config = config;
    this.targetProject = path.resolve(config.targetProject);
  }

  /**
   * 扫描目标项目，返回符合条件的文件列表
   * @returns {Promise<string[]>} 文件路径数组
   */
  async scan() {
    try {
      const patterns = this.config.fileExtensions.map(ext => 
        `**/*${ext}`
      );

      const files = [];
      
      for (const pattern of patterns) {
        const matches = await glob(pattern, {
          cwd: this.targetProject,
          absolute: true,
          ignore: this.getIgnorePatterns()
        });
        files.push(...matches);
      }

      // 去重
      const uniqueFiles = [...new Set(files)];
      
      console.log(`✓ 扫描完成，找到 ${uniqueFiles.length} 个文件`);
      return uniqueFiles;
    } catch (error) {
      console.error('扫描文件时出错:', error);
      throw error;
    }
  }

  /**
   * 获取需要忽略的模式
   * @returns {string[]}
   */
  getIgnorePatterns() {
    const patterns = [];

    // 添加排除目录
    if (this.config.excludeDirs) {
      this.config.excludeDirs.forEach(dir => {
        patterns.push(`**/${dir}/**`);
      });
    }

    // 添加排除文件
    if (this.config.excludeFiles) {
      patterns.push(...this.config.excludeFiles.map(file => `**/${file}`));
    }

    return patterns;
  }

  /**
   * 读取文件内容
   * @param {string} filePath 文件路径
   * @returns {Promise<string>}
   */
  async readFile(filePath) {
    try {
      const content = await fs.promises.readFile(
        filePath, 
        this.config.encoding || 'utf-8'
      );
      return content;
    } catch (error) {
      console.error(`读取文件失败 ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * 获取相对路径
   * @param {string} filePath 绝对路径
   * @returns {string}
   */
  getRelativePath(filePath) {
    return path.relative(this.targetProject, filePath).replace(/\\/g, '/');
  }
}

module.exports = Scanner;
