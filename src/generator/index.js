const fs = require('fs');
const path = require('path');

/**
 * JSON生成器
 * 将提取的结果格式化为JSON并输出
 */
class Generator {
  constructor(config) {
    this.config = config;
    this.outputDir = path.resolve(config.outputDir);
  }

  /**
   * 生成JSON文件
   * @param {Object} results 提取结果
   * @returns {Promise<string>} 输出文件路径
   */
  async generate(results) {
    try {
      // 确保输出目录存在
      await this.ensureDir(this.outputDir);

      // 生成带时间戳的文件名
      const timestamp = this.getTimestamp();
      const fileName = `i18n-extracted-${timestamp}.json`;
      const filePath = path.join(this.outputDir, fileName);

      // 格式化输出
      const output = {
        metadata: {
          extractedAt: new Date().toISOString(),
          normalCount: Object.keys(results.normal).length,
          templateCount: Object.keys(results.templates).length,
          total: Object.keys(results.normal).length + 
                 Object.keys(results.templates).length
        },
        normal: results.normal,
        templates: results.templates
      };

      // 写入文件
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(output, null, 2),
        'utf-8'
      );

      console.log(`\n✓ JSON文件已生成: ${fileName}`);
      console.log(`  - 普通文本: ${output.metadata.normalCount} 条`);
      console.log(`  - 模板文本: ${output.metadata.templateCount} 条`);
      console.log(`  - 总计: ${output.metadata.total} 条\n`);

      return filePath;
    } catch (error) {
      console.error('生成JSON文件失败:', error);
      throw error;
    }
  }

  /**
   * 确保目录存在
   * @param {string} dirPath
   */
  async ensureDir(dirPath) {
    try {
      await fs.promises.access(dirPath);
    } catch {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 获取时间戳字符串
   * @returns {string}
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '_');
  }

  /**
   * 读取提取的JSON文件
   * @param {string} filePath JSON文件路径
   * @returns {Promise<Object>}
   */
  async readExtractedJson(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('读取JSON文件失败:', error);
      throw error;
    }
  }
}

module.exports = Generator;
