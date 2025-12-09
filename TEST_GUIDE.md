# 测试指南

## 准备工作

1. 确保已安装依赖：
```bash
cd d:\LZY\Projects\vue-i18n
npm install
```

2. 链接到全局：
```bash
npm link
```

3. 验证安装：
```bash
tricolor-vue2-i18n --help
```

## 测试步骤

### 在示例项目中测试

```bash
# 进入示例项目
cd examples/vue2-demo

# 1. 测试初始化命令
tricolor-vue2-i18n init
# 选择 Yes/No for Element UI

# 2. 检查生成的文件
ls output/
ls output/lang/
ls output/lang/zh-cn/

# 3. 测试替换命令
tricolor-vue2-i18n replace

# 4. 查看生成的报告
cat output/pending-tasks-*.md

# 5. 填写翻译模板（手动编辑）
# 编辑 output/translation-template.txt
# 格式：中文 = 英文

# 6. 测试翻译命令
tricolor-vue2-i18n translate en-us

# 7. 测试验证命令
tricolor-vue2-i18n verify
cat output/validation-report.md
```

## 预期结果

### init 命令
- 生成 `output/` 文件夹
- 包含 `lang/zh-cn/` 多个模块文件
- 包含 `lang/index.js` 配置文件
- 包含 `i18n-extracted-*.json`
- 包含 `translation-template.txt`

### replace 命令
- 原文件备份到 `backup/` 文件夹
- 源代码中的中文被替换为 `$t('key')`
- 自动添加 i18n 导入
- 生成 `pending-tasks-*.md` 报告

### translate 命令
- 生成 `output/lang/en-us/` 文件夹
- 包含对应的翻译文件

### verify 命令
- 扫描所有文件
- 生成 `validation-report.md`
- 显示未转换的中文统计

## 常见问题

### 如果测试失败

1. 恢复示例项目：
```bash
cd d:\LZY\Projects\vue-i18n
node scripts/restore-vue2-demo.js
```

2. 重新开始测试

### 调试模式

查看详细日志：
```bash
cat output/logs/*.log
```

## 完成测试后

清理测试文件：
```bash
cd examples/vue2-demo
rm -rf output backup
git checkout .
```

或使用恢复脚本：
```bash
cd d:\LZY\Projects\vue-i18n
node scripts/restore-vue2-demo.js
```
