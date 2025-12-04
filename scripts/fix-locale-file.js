const fs = require('fs');
const path = require('path');

/**
 * 修复被错误替换的语言包文件
 * 直接使用I18nGenerator重新生成正确的语言包
 */

const I18nGenerator = require('../src/generator/i18nGenerator');

async function fixLocaleFile() {
  // 读取配置
  const configPath = path.resolve(__dirname, '../config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // 读取最新的提取文件
  const outputDir = path.resolve(__dirname, '../output');
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('i18n-extracted-'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('未找到提取的JSON文件');
    process.exit(1);
  }

  const latestFile = path.join(outputDir, files[0]);
  console.log(`使用提取文件: ${files[0]}`);

  const extractedData = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));

  // 使用I18nGenerator重新生成
  const generator = new I18nGenerator(config);
  const targetProjectPath = path.resolve(__dirname, '../examples/vue2-demo');

  console.log('\n重新生成i18n配置文件...');
  await generator.generate(extractedData, targetProjectPath);

  console.log('\n✓ 修复完成！语言包文件已重新生成');
}

// 运行修复
fixLocaleFile().catch(err => {
  console.error('修复失败:', err);
  process.exit(1);
});
