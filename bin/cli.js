#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const I18nTool = require('../src/index');

const program = new Command();

program
  .name('tricolor-vue2-i18n')
  .description('Vue2项目国际化(i18n)自动转换工具')
  .version('1.0.0');

/**
 * 命令1: 初始化 - 生成配置文件和语言包结构
 */
program
  .command('init')
  .description('初始化项目，生成output文件夹、lang配置和翻译模板')
  .action(async () => {
    try {
      console.log('\n========================================');
      console.log('  tricolor-vue2-i18n - 初始化');
      console.log('========================================\n');

      // 询问是否需要element-ui配置
      const { useElementUI } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useElementUI',
          message: '是否生成带Element UI多语言配置的文件？',
          default: false
        }
      ]);

      const cwd = process.cwd();
      
      // 创建临时配置用于工具运行
      const config = {
        targetProject: cwd,
        outputDir: path.join(cwd, 'output'),
        logDir: path.join(cwd, 'output', 'logs'),
        logLevel: 'info',
        enableFileLog: true,
        fileExtensions: ['.vue', '.js', '.ts'],
        excludeDirs: [
          'node_modules',
          'dist',
          '.git',
          'build',
          'public',
          'i18n',
          'locales',
          'lang',
          'output'
        ],
        excludeFiles: [
          '*.min.js',
          '*.test.js',
          '*.spec.js'
        ],
        encoding: 'utf-8',
        autoReplace: {
          enabled: false,
          backup: true,
          backupDir: path.join(cwd, 'backup'),
          preview: false,
          importPath: '@/lang',
          generateEnglish: false,
          keyStrategy: 'semantic',
          commonKeys: [
            'Common.submit',
            'Common.cancel',
            'Common.confirm',
            'Common.delete',
            'Common.edit',
            'Common.save'
          ]
        },
        keyMappings: {
          '提交': 'Common.submit',
          '取消': 'Common.cancel',
          '确认': 'Common.confirm',
          '删除': 'Common.delete',
          '编辑': 'Common.edit',
          '保存': 'Common.save'
        },
        keyPrefixes: {
          'default': 'Common'
        },
        pendingTasks: {
          enabled: true,
          outputFormat: ['markdown', 'json'],
          includeSkipped: true,
          includeFailed: true
        },
        useElementUI // 传递element-ui配置选项
      };

      // 创建工具实例
      const tool = new I18nTool(config);

      // 1. 提取中文
      console.log('\n步骤 1/2: 提取项目中的中文文本...');
      await tool.extract();

      // 2. 生成lang文件夹和配置
      console.log('\n步骤 2/2: 生成语言包配置...');
      const outputDir = config.outputDir;
      const extractedJsonPath = path.join(outputDir, `i18n-extracted-${getTimestamp()}.json`);
      
      // 查找最新的extracted json文件
      const files = fs.readdirSync(outputDir);
      const extractedFiles = files.filter(f => f.startsWith('i18n-extracted-') && f.endsWith('.json'));
      const latestExtracted = extractedFiles.sort().reverse()[0];
      
      if (latestExtracted) {
        const jsonPath = path.join(outputDir, latestExtracted);
        
        // 生成lang文件夹（包含element-ui配置如果需要）
        await generateLangFolder(jsonPath, outputDir, useElementUI);
      }

      console.log('\n========================================');
      console.log('初始化完成！');
      console.log(`\noutput文件夹已生成在: ${outputDir}`);
      console.log('包含以下内容:');
      console.log('  - lang/ (语言包文件夹)');
      console.log('  - i18n-extracted-*.json (提取的中文数据)');
      console.log('  - translation-template.txt (翻译对照模板)');
      console.log('========================================\n');
    } catch (error) {
      console.error('\n初始化失败:', error.message);
      process.exit(1);
    }
  });

/**
 * 命令2: 替换 - 将项目中的中文转换为i18n配置
 */
program
  .command('replace')
  .description('将项目中的中文转换为$t()调用，并生成pending-tasks报告')
  .action(async () => {
    try {
      console.log('\n========================================');
      console.log('  tricolor-vue2-i18n - 替换中文');
      console.log('========================================\n');

      const cwd = process.cwd();
      const outputDir = path.join(cwd, 'output');

      // 检查output文件夹是否存在
      if (!fs.existsSync(outputDir)) {
        console.error('错误: 未找到output文件夹，请先运行 tricolor-vue2-i18n init');
        process.exit(1);
      }

      // 查找最新的extracted json文件
      const files = fs.readdirSync(outputDir);
      const extractedFiles = files.filter(f => f.startsWith('i18n-extracted-') && f.endsWith('.json'));
      
      if (extractedFiles.length === 0) {
        console.error('错误: 未找到提取的JSON文件，请先运行 tricolor-vue2-i18n init');
        process.exit(1);
      }

      const latestExtracted = extractedFiles.sort().reverse()[0];
      const jsonPath = path.join(outputDir, latestExtracted);

      console.log(`使用提取文件: ${latestExtracted}\n`);

      // 创建配置
      const config = createConfig(cwd);
      config.autoReplace.enabled = true;

      // 创建工具实例并执行替换
      const tool = new I18nTool(config);
      await tool.replace(jsonPath, false);

      console.log('\n========================================');
      console.log('替换完成！');
      console.log('\n详细报告请查看:');
      console.log(`  - output/pending-tasks-*.md`);
      console.log('========================================\n');
    } catch (error) {
      console.error('\n替换失败:', error.message);
      process.exit(1);
    }
  });

/**
 * 命令3: 翻译 - 生成其他语言包
 */
program
  .command('translate [lang]')
  .description('根据zh-cn和translation-template.txt生成其他语言包 (默认: en-us)')
  .action(async (lang = 'en-us') => {
    try {
      console.log('\n========================================');
      console.log('  tricolor-vue2-i18n - 生成翻译');
      console.log('========================================\n');

      const cwd = process.cwd();
      const outputDir = path.join(cwd, 'output');
      const langDir = path.join(outputDir, 'lang');

      // 检查必需文件
      if (!fs.existsSync(langDir)) {
        console.error('错误: 未找到output/lang文件夹，请先运行 tricolor-vue2-i18n init');
        process.exit(1);
      }

      const templatePath = path.join(outputDir, 'translation-template.txt');
      if (!fs.existsSync(templatePath)) {
        console.error('错误: 未找到translation-template.txt，请先运行 tricolor-vue2-i18n init');
        process.exit(1);
      }

      console.log(`目标语言: ${lang}\n`);

      // 创建配置并执行翻译
      const config = createConfig(cwd);
      const tool = new I18nTool(config);
      
      await tool.translate(outputDir, lang);

      console.log('\n========================================');
      console.log('翻译生成完成！');
      console.log(`\n语言包已生成: output/lang/${lang}/`);
      console.log('========================================\n');
    } catch (error) {
      console.error('\n翻译生成失败:', error.message);
      process.exit(1);
    }
  });

/**
 * 命令4: 验证 - 检查项目中是否还有中文
 */
program
  .command('verify')
  .description('验证项目中是否还有未转换的中文，输出验证报告')
  .action(async () => {
    try {
      console.log('\n========================================');
      console.log('  tricolor-vue2-i18n - 验证中文');
      console.log('========================================\n');

      const cwd = process.cwd();
      const config = createConfig(cwd);

      // 创建工具实例并执行验证
      const tool = new I18nTool(config);
      await tool.validate();

      console.log('验证报告已保存到: output/validation-report.md\n');
    } catch (error) {
      console.error('\n验证失败:', error.message);
      process.exit(1);
    }
  });

/**
 * 创建配置对象
 */
function createConfig(cwd) {
  return {
    targetProject: cwd,
    outputDir: path.join(cwd, 'output'),
    logDir: path.join(cwd, 'output', 'logs'),
    logLevel: 'info',
    enableFileLog: true,
    fileExtensions: ['.vue', '.js', '.ts'],
    excludeDirs: [
      'node_modules',
      'dist',
      '.git',
      'build',
      'public',
      'i18n',
      'locales',
      'lang',
      'output'
    ],
    excludeFiles: [
      '*.min.js',
      '*.test.js',
      '*.spec.js'
    ],
    encoding: 'utf-8',
    autoReplace: {
      enabled: false,
      backup: true,
      backupDir: path.join(cwd, 'backup'),
      preview: false,
      importPath: '@/lang',
      generateEnglish: false,
      keyStrategy: 'semantic',
      commonKeys: [
        'Common.submit',
        'Common.cancel',
        'Common.confirm',
        'Common.delete',
        'Common.edit',
        'Common.save'
      ]
    },
    keyMappings: {
      '提交': 'Common.submit',
      '取消': 'Common.cancel',
      '确认': 'Common.confirm',
      '删除': 'Common.delete',
      '编辑': 'Common.edit',
      '保存': 'Common.save'
    },
    keyPrefixes: {
      'default': 'Common'
    },
    pendingTasks: {
      enabled: true,
      outputFormat: ['markdown', 'json'],
      includeSkipped: true,
      includeFailed: true
    }
  };
}

/**
 * 生成lang文件夹
 */
async function generateLangFolder(jsonPath, outputDir, useElementUI) {
  const extractedData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const LocaleGenerator = require('../src/generator/localeGenerator');
  
  const config = createConfig(process.cwd());
  const localeGenerator = new LocaleGenerator(config);
  
  // 生成zh-cn文件夹和模块文件
  const result = await localeGenerator.generate(extractedData, outputDir);
  
  // 创建lang文件夹
  const langDir = path.join(outputDir, 'lang');
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  // 将zh-cn文件夹移动到lang下
  const zhCnSource = path.join(outputDir, 'zh-cn');
  const zhCnTarget = path.join(langDir, 'zh-cn');
  
  if (fs.existsSync(zhCnSource)) {
    // 如果目标已存在，先删除
    if (fs.existsSync(zhCnTarget)) {
      fs.rmSync(zhCnTarget, { recursive: true });
    }
    // 移动文件夹
    fs.renameSync(zhCnSource, zhCnTarget);
  }
  
  // 生成index.js
  await generateLangIndex(langDir, useElementUI);
  
  console.log('\n✓ lang文件夹已生成');
  console.log(`  - ${path.relative(process.cwd(), langDir)}`);
}

/**
 * 生成lang/index.js
 */
async function generateLangIndex(langDir, useElementUI) {
  let content = `import Vue from 'vue';
import VueI18n from 'vue-i18n';
`;

  if (useElementUI) {
    content += `import ElementUI from 'element-ui';
import elementEnLocale from 'element-ui/lib/locale/lang/en';
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN';
import ElementLocale from 'element-ui/lib/locale';
`;
  }

  content += `
Vue.use(VueI18n);

// 导入语言包
const modules = {};

// 自动导入zh-cn下的所有js文件
const zhCnFiles = require.context('./zh-cn', false, /\\.js$/);
const zhCnMessages = {};
zhCnFiles.keys().forEach(key => {
  const moduleName = key.replace(/^\\.\\/(.+)\\.js$/, '$1');
  // 首字母大写作为模块名
  const moduleKey = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCnMessages[moduleKey] = zhCnFiles(key).default;
});
modules['zh-CN'] = zhCnMessages;

// 尝试导入en-us（如果存在）
try {
  const enUsFiles = require.context('./en-us', false, /\\.js$/);
  const enUsMessages = {};
  enUsFiles.keys().forEach(key => {
    const moduleName = key.replace(/^\\.\\/(.+)\\.js$/, '$1');
    const moduleKey = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    enUsMessages[moduleKey] = enUsFiles(key).default;
  });
  modules['en-US'] = enUsMessages;
} catch (e) {
  // en-us文件夹不存在
}

const messages = {
  'zh-CN': {
    ...modules['zh-CN']`;

  if (useElementUI) {
    content += `,
    ...elementZhLocale`;
  }

  content += `
  },
  'en-US': {
    ...(modules['en-US'] || {})`;

  if (useElementUI) {
    content += `,
    ...elementEnLocale`;
  }

  content += `
  }
};

const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'zh-CN',
  messages
});
`;

  if (useElementUI) {
    content += `
// 配置Element UI使用vue-i18n
ElementLocale.i18n((key, value) => i18n.t(key, value));
`;
  }

  content += `
export default i18n;
`;

  const indexPath = path.join(langDir, 'index.js');
  fs.writeFileSync(indexPath, content, 'utf-8');
}

/**
 * 获取时间戳字符串
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/:/g, '-').split('.')[0];
}

// 如果没有参数，显示帮助
if (process.argv.length === 2) {
  program.help();
} else {
  program.parse(process.argv);
}
