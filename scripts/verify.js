#!/usr/bin/env node

/**
 * 项目验证脚本
 * 检查项目结构和依赖是否完整
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  Vue i18n 自动转换工具 - 项目验证');
console.log('========================================\n');

let hasErrors = false;

// 检查必需的文件
const requiredFiles = [
  'package.json',
  'config.json',
  '.gitignore',
  'README.md',
  'src/index.js',
  'src/scanner/index.js',
  'src/parser/index.js',
  'src/parser/vueParser.js',
  'src/parser/jsParser.js',
  'src/extractor/index.js',
  'src/generator/index.js',
  'src/generator/i18nGenerator.js',
  'src/replacer/index.js'
];

console.log('检查必需文件...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - 缺失`);
    hasErrors = true;
  }
});

// 检查配置文件
console.log('\n检查配置文件...');
try {
  const configPath = path.join(__dirname, '..', 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  const requiredConfigs = [
    'targetProject',
    'outputDir',
    'fileExtensions',
    'excludeDirs'
  ];

  requiredConfigs.forEach(key => {
    if (config[key]) {
      console.log(`  ✓ ${key}: ${JSON.stringify(config[key])}`);
    } else {
      console.log(`  ✗ ${key} - 缺失`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log(`  ✗ 配置文件读取失败: ${error.message}`);
  hasErrors = true;
}

// 检查package.json
console.log('\n检查依赖配置...');
try {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const requiredDeps = [
    '@babel/generator',
    '@babel/parser',
    '@babel/traverse',
    '@vue/compiler-sfc',
    'glob',
    'commander'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✓ ${dep}`);
    } else {
      console.log(`  ✗ ${dep} - 缺失`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log(`  ✗ package.json读取失败: ${error.message}`);
  hasErrors = true;
}

// 检查目录
console.log('\n检查目录结构...');
const requiredDirs = [
  'src',
  'src/scanner',
  'src/parser',
  'src/extractor',
  'src/generator',
  'src/replacer',
  'examples'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`  ✓ ${dir}/`);
  } else {
    console.log(`  ✗ ${dir}/ - 缺失`);
    hasErrors = true;
  }
});

// 检查node_modules
console.log('\n检查依赖安装...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✓ node_modules 已安装');
  
  // 检查关键依赖是否存在
  const criticalDeps = [
    '@babel/parser',
    '@vue/compiler-sfc',
    'commander'
  ];
  
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`    ✓ ${dep}`);
    } else {
      console.log(`    ✗ ${dep} - 未安装`);
      hasErrors = true;
    }
  });
} else {
  console.log('  ✗ node_modules - 未安装，请运行: npm install');
  hasErrors = true;
}

// 总结
console.log('\n========================================');
if (hasErrors) {
  console.log('❌ 验证失败，请检查上述错误');
  console.log('\n建议操作:');
  console.log('  1. 运行 npm install 安装依赖');
  console.log('  2. 检查config.json配置是否正确');
  console.log('  3. 确保所有必需文件都存在');
  process.exit(1);
} else {
  console.log('✅ 验证通过，项目结构完整！');
  console.log('\n下一步:');
  console.log('  1. 配置 config.json 中的 targetProject');
  console.log('  2. 运行 npm start 开始提取中文');
  console.log('  3. 查看 README.md 了解详细使用方法');
  console.log('\n快速测试:');
  console.log('  node src/index.js --help');
}
console.log('========================================\n');
