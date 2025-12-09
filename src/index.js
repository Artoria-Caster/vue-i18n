const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const Scanner = require('./scanner');
const Extractor = require('./extractor');
const Generator = require('./generator');
const I18nGenerator = require('./generator/i18nGenerator');
const LocaleGenerator = require('./generator/localeGenerator');
const TranslationGenerator = require('./generator/translationGenerator');
const Replacer = require('./replacer');
const Logger = require('./utils/logger');
const Validator = require('./validator');

/**
 * Vue项目国际化(i18n)自动转换工具
 * 主入口文件
 */
class I18nTool {
  constructor(config = null) {
    // 如果传入了config则使用传入的，否则从文件加载
    this.config = config || this.loadConfig();
    this.logger = new Logger({
      logLevel: this.config.logLevel || 'info',
      enableFileLog: this.config.enableFileLog !== false,
      logDir: this.config.logDir || './logs'
    });
    this.scanner = new Scanner(this.config);
    this.extractor = new Extractor(this.config, this.logger);
    this.generator = new Generator(this.config);
    this.i18nGenerator = new I18nGenerator(this.config);
    this.localeGenerator = new LocaleGenerator(this.config);
    this.translationGenerator = new TranslationGenerator(this.config);
    this.replacer = new Replacer(this.config, this.logger);
    this.validator = new Validator(this.config, this.logger);
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

    // 4. 生成语言包文件和翻译对照文件
    console.log('\n步骤 4/4: 生成语言包文件...');
    const outputDir = path.dirname(outputPath);
    await this.localeGenerator.generate(results, outputDir);

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

    // 生成i18n配置到output目录
    console.log('生成i18n配置文件...');
    const outputDir = path.dirname(jsonFilePath); // 获取JSON文件所在目录（output目录）
    const keyMap = await this.i18nGenerator.generate(extractedData, outputDir);

    console.log('========================================');
    console.log('生成完成！');
    console.log('请手动将 output/lang 文件夹复制到项目中并引入');
    console.log('========================================\n');

    return keyMap;
  }

  /**
   * 从已有JSON重新生成语言包和翻译模板文件
   * @param {string} jsonFilePath 提取的JSON文件路径
   */
  async regenerate(jsonFilePath) {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 重新生成语言包');
    console.log('========================================\n');

    // 读取提取的JSON
    console.log('读取提取的JSON文件...');
    const extractedData = await this.generator.readExtractedJson(jsonFilePath);

    // 重新生成语言包文件和翻译对照文件
    console.log('\n生成语言包文件和翻译对照文件...');
    const outputDir = path.dirname(jsonFilePath);
    await this.localeGenerator.generate(extractedData, outputDir);

    console.log('\n========================================');
    console.log('重新生成完成！');
    console.log(`输出目录: ${outputDir}`);
    console.log('  - zh-cn.js (语言包文件)');
    console.log('  - translation-template.txt (翻译对照模板)');
    console.log('========================================\n');
  }

  /**
   * 根据zh-cn和翻译模板生成其他语言的配置文件
   * @param {string} outputDir 输出目录（包含zh-cn文件夹/文件和translation-template.txt）
   * @param {string} targetLang 目标语言代码，默认为en-us
   */
  async translate(outputDir, targetLang = 'en-us') {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 翻译生成模式');
    console.log('========================================\n');

    // 先检查是否存在 zh-cn 文件夹，不存在则检查 zh-cn.js 文件（兼容旧格式）
    let zhCNPath = path.join(outputDir, 'zh-cn');
    if (!fs.existsSync(zhCNPath)) {
      zhCNPath = path.join(outputDir, 'zh-cn.js');
    }
    
    const templatePath = path.join(outputDir, 'translation-template.txt');

    // 检查必需文件是否存在
    if (!fs.existsSync(zhCNPath)) {
      console.error(`错误: 未找到 zh-cn 文件夹或 zh-cn.js 文件: ${zhCNPath}`);
      console.log('请先运行 npm run regenerate <json文件> 生成 zh-cn 语言包');
      return;
    }

    if (!fs.existsSync(templatePath)) {
      console.error(`错误: 未找到 translation-template.txt 文件: ${templatePath}`);
      console.log('请先运行 npm run regenerate <json文件> 生成翻译模板文件');
      return;
    }

    try {
      const outputPath = await this.translationGenerator.generate(
        zhCNPath,
        templatePath,
        targetLang,
        outputDir
      );

      console.log('\n========================================');
      console.log('翻译生成完成！');
      console.log(`输出: ${outputPath}`);
      console.log('========================================\n');
    } catch (error) {
      console.error('\n翻译生成失败:', error.message);
      this.logger.error('翻译生成失败', error);
    }
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

    // 生成key映射（输出到output目录）
    console.log('生成key映射...');
    const outputDir = path.dirname(jsonFilePath);
    const keyMap = await this.i18nGenerator.generate(extractedData, outputDir);

    // 执行替换
    console.log(`${preview ? '预览' : '执行'}替换...\n`);
    const targetProjectPath = path.resolve(this.config.targetProject);
    await this.replacer.replace(keyMap, targetProjectPath, preview);

    console.log('\n========================================');
    console.log(`${preview ? '预览' : '替换'}完成！`);
    console.log('如果已修改代码，请手动将 output/lang 文件夹复制到项目中');
    console.log('========================================\n');
  }

  /**
   * 完整流程：提取 -> 生成 -> 替换 -> 验证
   */
  async full() {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 完整流程');
    console.log('========================================\n');

    this.logger.info('开始完整转换流程...');

    // 1. 提取
    const jsonFile = await this.extract();

    // 2. 生成i18n配置
    await this.generateI18n(jsonFile);

    // 3. 替换（如果启用）
    if (this.config.autoReplace?.enabled) {
      await this.replace(jsonFile, false);
      
      // 4. 验证转换结果
      console.log('\n步骤 4/4: 验证转换结果...');
      this.logger.info('开始验证转换结果...');
      
      const targetProjectPath = path.resolve(this.config.targetProject);
      const files = await this.scanner.scan();
      const validationResults = await this.validator.validateFiles(files);
      
      console.log('\n验证完成：');
      console.log(`  - 检查文件数: ${validationResults.totalFiles}`);
      console.log(`  - 问题文件数: ${validationResults.filesWithIssues}`);
      console.log(`  - 未转换文本: ${validationResults.totalIssues} 处`);
      
      if (validationResults.totalIssues > 0) {
        console.log('\n⚠️  发现未转换的中文文本，详情请查看日志文件');
        this.logger.warn('验证发现问题', {
          filesWithIssues: validationResults.filesWithIssues,
          totalIssues: validationResults.totalIssues
        });
        
        // 生成验证报告
        const reportPath = path.join(this.config.outputDir, 'validation-report.md');
        this.validator.saveReport(reportPath);
        console.log(`  验证报告: ${reportPath}`);
      } else {
        console.log('\n✓ 所有文件转换完成，未发现遗漏的中文文本');
        this.logger.info('验证通过，所有文件转换完成');
      }
    } else {
      console.log('\n自动替换未启用，如需替换请运行: npm run replace');
    }

    // 生成详细报告
    const report = this.logger.generateReport();
    
    // 生成待处理任务记录（如果有失败或跳过的项目）
    const pendingTasksFile = this.logger.generatePendingTasks(this.config.outputDir);
    
    console.log('\n========================================');
    console.log('转换统计:');
    console.log(`  - 提取成功: ${report.summary.extracted} 条`);
    console.log(`  - 跳过处理: ${report.summary.skipped} 条`);
    console.log(`  - 替换成功: ${report.summary.replaced} 条`);
    console.log(`  - 替换失败: ${report.summary.failed} 条`);
    if (report.summary.warnings > 0) {
      console.log(`  - 警告信息: ${report.summary.warnings} 条`);
    }
    console.log('========================================');
    console.log('完整流程执行完成！');
    console.log('========================================\n');
  }

  /**
   * 验证转换结果
   */
  async validate() {
    console.log('\n========================================');
    console.log('  Vue i18n 自动转换工具 - 验证模式');
    console.log('========================================\n');

    console.log('步骤 1/2: 扫描文件...');
    const files = await this.scanner.scan();
    console.log(`找到 ${files.length} 个文件\n`);

    console.log('步骤 2/2: 验证文件...');
    const validationResults = await this.validator.validateFiles(files);

    console.log('\n========================================');
    console.log('验证结果:');
    console.log(`  - 检查文件数: ${validationResults.totalFiles}`);
    console.log(`  - 问题文件数: ${validationResults.filesWithIssues}`);
    console.log(`  - 未转换文本: ${validationResults.totalIssues} 处`);
    console.log('========================================\n');

    if (validationResults.totalIssues > 0) {
      console.log('发现以下问题:\n');
      
      const issues = this.validator.getIssues();
      issues.forEach((file, index) => {
        console.log(`${index + 1}. ${file.filePath}`);
        file.issues.slice(0, 3).forEach(issue => {
          console.log(`   行 ${issue.line}: "${issue.text}"`);
        });
        if (file.issues.length > 3) {
          console.log(`   ... 还有 ${file.issues.length - 3} 处未转换`);
        }
        console.log('');
      });

      // 保存详细报告
      const reportPath = path.join(this.config.outputDir, 'validation-report.md');
      this.validator.saveReport(reportPath);
      console.log(`详细报告已保存: ${reportPath}\n`);
    } else {
      console.log('✓ 所有文件验证通过，未发现未转换的中文文本\n');
    }
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
    .description('执行完整流程：提取 -> 生成 -> 替换 -> 验证')
    .action(async () => {
      const tool = new I18nTool();
      await tool.full();
    });

  program
    .command('validate')
    .description('验证转换结果，检查是否还有未转换的中文')
    .action(async () => {
      const tool = new I18nTool();
      await tool.validate();
    });

  program
    .command('regenerate <jsonFile>')
    .description('从已有JSON重新生成语言包和翻译对照文件')
    .action(async (jsonFile) => {
      const tool = new I18nTool();
      await tool.regenerate(jsonFile);
    });

  program
    .command('translate [outputDir] [targetLang]')
    .description('根据zh-cn.js和填好的translation-template.txt生成其他语言的配置文件')
    .action(async (outputDir, targetLang) => {
      const tool = new I18nTool();
      const dir = outputDir || tool.config.outputDir || './output';
      const lang = targetLang || 'en-us';
      await tool.translate(dir, lang);
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
