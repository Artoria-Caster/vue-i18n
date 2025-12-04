/**
 * Vue2-Demo 项目恢复脚本
 * 清理被错误替换的i18n调用，恢复为原始状态
 */

const fs = require('fs');
const path = require('path');

const projectPath = path.resolve(__dirname, '../examples/vue2-demo');

console.log('开始恢复 vue2-demo 项目...\n');

// 1. 删除 i18n 目录
const i18nPath = path.join(projectPath, 'src/i18n');
if (fs.existsSync(i18nPath)) {
  fs.rmSync(i18nPath, { recursive: true, force: true });
  console.log('✓ 已删除 src/i18n 目录');
}

// 2. 从 main.js 中移除 i18n 导入和注入
const mainJsPath = path.join(projectPath, 'src/main.js');
if (fs.existsSync(mainJsPath)) {
  let content = fs.readFileSync(mainJsPath, 'utf-8');
  
  // 移除 i18n 导入
  content = content.replace(/import i18n from ['"]\.\/i18n\/index['"];?\n?/g, '');
  content = content.replace(/import i18n from ['"]\.\/i18n['"];?\n?/g, '');
  
  // 移除 i18n 实例注入
  content = content.replace(/new Vue\(\{[\s\S]*?\}\)/g, (match) => {
    return match.replace(/,?\s*i18n,?\s*/g, ',').replace(/,,/g, ',').replace(/\(,/g, '(').replace(/,\)/g, ')');
  });
  
  // 移除 i18n.t() 调用（在全局过滤器等地方）
  // 这部分需要手动处理，因为需要恢复原始中文
  
  fs.writeFileSync(mainJsPath, content, 'utf-8');
  console.log('✓ 已清理 main.js 中的 i18n 引用');
}

console.log('\n恢复完成！\n');
console.log('注意：');
console.log('1. 部分文件中的 $t() 调用需要手动恢复为中文');
console.log('2. 建议从备份或源代码重新获取完整的原始文件');
console.log('3. 或者解压 vue2-demo.rar（如果有的话）\n');
