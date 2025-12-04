const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const Scanner = require('./scanner');
const Extractor = require('./extractor');
const Generator = require('./generator');
const I18nGenerator = require('./generator/i18nGenerator');
const Replacer = require('./replacer');

/**
 * Vue项目国际化(i18n)自动转换工具
 * 主入口文件
 */
class I18nTool {
  constructor() {
    this.config = this.loadConfig();
    this.scanner = new Scanner(this.config);
    this.extractor = new Extractor(this.config);
    this.generator = new Generator(this.config);
    this.i18nGenerator = new I18nGenerator(this.config);
    this.replacer = new Replacer(this.config);
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    try {
      const configPath = path.resolve(__dirname, '../config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config;
    } catch (error) {
      console.error('加载配置文件失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 提取中文文本
   */
  async extract() {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 提取模式');
    console.log('========================================\n');

    console.log(`目标项目: ${this.config.targetProject}`);
    console.log(`输出目录: ${this.config.outputDir}\n`);

    // 1. 扫描文件
    console.log('步骤 1/3: 扫描文件...');
    const files = await this.scanner.scan();

    if (files.length === 0) {
      console.log('\n未找到需要处理的文件');
      return;
    }

    // 2. 提取中文
    console.log('\n步骤 2/3: 提取中文文本...');
    let processedCount = 0;

    for (const filePath of files) {
      const content = await this.scanner.readFile(filePath);
      if (!content) continue;

      const relativePath = this.scanner.getRelativePath(filePath);
      this.extractor.extract(content, filePath, relativePath);
      
      processedCount++;
      if (processedCount % 10 === 0) {
        process.stdout.write(`\r  已处理: ${processedCount}/${files.length} 个文件`);
      }
    }

    console.log(`\r  已处理: ${processedCount}/${files.length} 个文件`);

    const stats = this.extractor.getStats();
    console.log(`\n  提取结果:`);
    console.log(`    - 普通文本: ${stats.normalCount} 条`);
    console.log(`    - 模板文本: ${stats.templateCount} 条`);
    console.log(`    - 总计: ${stats.total} 条`);

    // 3. 生成JSON
    console.log('\n步骤 3/3: 生成JSON文件...');
    const results = this.extractor.getResults();
    const outputPath = await this.generator.generate(results);

    console.log('========================================');
    console.log('提取完成！');
    console.log(`输出文件: ${outputPath}`);
    console.log('========================================\n');

    return outputPath;
  }

  /**
   * 生成i18n配置文件
   * @param {string} jsonFilePath 提取的JSON文件路径
   */
  async generateI18n(jsonFilePath) {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 生成模式');
    console.log('========================================\n');

    // 读取提取的JSON
    console.log('读取提取的JSON文件...');
    const extractedData = await this.generator.readExtractedJson(jsonFilePath);

    // 生成i18n配置
    console.log('生成i18n配置文件...');
    const targetProjectPath = path.resolve(this.config.targetProject);
    const keyMap = await this.i18nGenerator.generate(extractedData, targetProjectPath);

    console.log('========================================');
    console.log('生成完成！');
    console.log('========================================\n');

    return keyMap;
  }

  /**
   * 自动替换
   * @param {string} jsonFilePath 提取的JSON文件路径
   * @param {boolean} preview 是否为预览模式
   */
  async replace(jsonFilePath, preview = false) {
    console.log('\n========================================');
    console.log(`  Vue i18n 自动转换工具 - ${preview ? '预览' : '替换'}模式`);
    console.log('========================================\n');

    // 读取提取的JSON
    console.log('读取提取的JSON文件...');
    const extractedData = await this.generator.readExtractedJson(jsonFilePath);

    // 生成key映射
    console.log('生成key映射...');
    const targetProjectPath = path.resolve(this.config.targetProject);
    const keyMap = await this.i18nGenerator.generate(extractedData, targetProjectPath);

    // 执行替换
    console.log(`${preview ? '预览' : '执行'}替换...\n`);
    await this.replacer.replace(keyMap, targetProjectPath, preview);

    console.log('\n========================================');
    console.log(`${preview ? '预览' : '替换'}完成！`);
    console.log('========================================\n');
  }

  /**
   * 完整流程：提取 -> 生成 -> 替换
   */
  async full() {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 完整流程');
    console.log('========================================\n');

    // 1. 提取
    const jsonFile = await this.extract();

    // 2. 生成i18n配置
    await this.generateI18n(jsonFile);

    // 3. 替换（如果启用）
    if (this.config.autoReplace?.enabled) {
      await this.replace(jsonFile, false);
    } else {
      console.log('\n自动替换未启用，如需替换请运行: npm run replace');
    }

    console.log('\n========================================');
    console.log('完整流程执行完成！');
    console.log('========================================\n');
  }
}

// 命令行接口
function main() {
  const program = new Command();

  program
    .name('vue-i18n-tool')
    .description('Vue项目国际化(i18n)自动转换工具')
    .version('1.0.0');

  program
    .command('extract')
    .description('提取项目中的中文文本并生成JSON')
    .action(async () => {
      const tool = new I18nTool();
      await tool.extract();
    });

  program
    .command('generate <jsonFile>')
    .description('根据JSON生成i18n配置文件')
    .action(async (jsonFile) => {
      const tool = new I18nTool();
      await tool.generateI18n(jsonFile);
    });

  program
    .command('replace <jsonFile>')
    .description('根据JSON替换源文件中的中文')
    .option('-p, --preview', '预览模式，不实际修改文件')
    .action(async (jsonFile, options) => {
      const tool = new I18nTool();
      await tool.replace(jsonFile, options.preview);
    });

  program
    .command('full')
    .description('执行完整流程：提取 -> 生成 -> 替换')
    .action(async () => {
      const tool = new I18nTool();
      await tool.full();
    });

  // 默认执行提取
  if (process.argv.length === 2) {
    const tool = new I18nTool();
    tool.extract();
  } else {
    program.parse(process.argv);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = I18nTool;
