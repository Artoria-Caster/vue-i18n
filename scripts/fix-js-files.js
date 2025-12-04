/**
 * 修复普通JS文件中错误的 this.$t() 调用
 * 将其替换为 i18n.t() 并添加导入语句
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 需要修复的文件模式
const filesToFix = [
  'd:/LZY/Projects/vue-i18n/examples/vue2-demo/src/**/*.js'
];

// 需要排除的文件
const excludeFiles = [
  'vue.config.js',
  'babel.config.js',
  'webpack.config.js'
];

async function fixFile(filePath) {
  const fileName = path.basename(filePath);
  
  // 跳过配置文件
  if (excludeFiles.includes(fileName)) {
    console.log(`跳过配置文件: ${fileName}`);
    return false;
  }

  // 跳过 i18n 目录本身
  if (filePath.includes('\\i18n\\') || filePath.includes('/i18n/')) {
    console.log(`跳过 i18n 目录文件: ${fileName}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // 检查是否包含 this.$t(
  if (!content.includes('this.$t(')) {
    return false;
  }

  console.log(`正在修复: ${filePath}`);

  // 替换 this.$t( 为 i18n.t(
  content = content.replace(/this\.\$t\(/g, 'i18n.t(');

  // 检查是否已经有 i18n 导入
  const hasI18nImport = content.match(/import\s+i18n\s+from\s+['"]/);

  if (!hasI18nImport && content !== originalContent) {
    // 计算相对路径
    const fileDir = path.dirname(filePath);
    const projectRoot = 'd:/LZY/Projects/vue-i18n/examples/vue2-demo';
    const i18nPath = path.join(projectRoot, 'src', 'i18n', 'index.js');
    
    let relativePath = path.relative(fileDir, i18nPath);
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    relativePath = relativePath.replace(/\.js$/, '');

    // 在文件开头添加导入
    const importStatement = `import i18n from '${relativePath}';\n`;
    content = importStatement + content;
  }

  // 只有在内容改变时才写入
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ 已修复: ${fileName}`);
    return true;
  }

  return false;
}

async function main() {
  console.log('开始修复 JS 文件...\n');

  let fixedCount = 0;

  for (const pattern of filesToFix) {
    const files = await glob(pattern, {
      absolute: true,
      nodir: true
    });

    for (const file of files) {
      if (await fixFile(file)) {
        fixedCount++;
      }
    }
  }

  console.log(`\n完成！共修复 ${fixedCount} 个文件`);
}

main().catch(console.error);
