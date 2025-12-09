# 更新说明 - CLI工具版本

## 概述

根据新需求，已将原有的Node工具改造为命令行工具 **tricolor-vue2-i18n**。

## 主要变化

### 1. 项目名称
- **旧名称**: vue-i18n-auto-tool
- **新名称**: tricolor-vue2-i18n

### 2. 使用方式

#### 旧方式 (需要配置文件)
```bash
# 需要创建config.json配置文件
npm run extract
npm run generate
npm run replace
npm run translate
```

#### 新方式 (命令行工具)
```bash
# 直接在目标项目目录运行
tricolor-vue2-i18n init
tricolor-vue2-i18n replace
tricolor-vue2-i18n translate
tricolor-vue2-i18n verify
```

### 3. 功能整合

已按照需求将功能整合为4个命令：

#### 命令1: `init` (初始化)
- **功能**: 提取中文 + 生成配置
- **输出**: 
  - `output/lang/` - 语言包文件夹
  - `output/i18n-extracted-*.json` - 提取数据
  - `output/translation-template.txt` - 翻译模板
- **交互**: 询问是否需要Element UI多语言配置

#### 命令2: `replace` (替换)
- **功能**: 将中文转换为`$t()`调用
- **输出**: 
  - 修改源文件(自动备份到backup/)
  - `output/pending-tasks-*.md` - 待处理任务报告

#### 命令3: `translate [lang]` (翻译)
- **功能**: 生成其他语言包
- **输入**: `output/translation-template.txt` (需手动填写)
- **输出**: `output/lang/[lang]/` - 目标语言包

#### 命令4: `verify` (验证)
- **功能**: 检查项目中是否还有中文
- **输出**: `output/validation-report.md` - 验证报告

### 4. 新增功能

#### Element UI多语言配置
在`init`命令中，如果选择使用Element UI配置，会在`lang/index.js`中自动添加：

```javascript
import ElementUI from 'element-ui';
import elementEnLocale from 'element-ui/lib/locale/lang/en';
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN';
import ElementLocale from 'element-ui/lib/locale';

// ... 配置Element UI使用vue-i18n
ElementLocale.i18n((key, value) => i18n.t(key, value));
```

#### 工作目录自动检测
不再需要配置文件，工具会：
- 使用当前工作目录作为目标项目
- 在当前目录创建`output/`文件夹
- 所有输出都在当前项目的output目录下

### 5. 技术改进

#### 新增依赖
- `inquirer@8.2.5` - 交互式命令行提示

#### 代码结构
- `bin/cli.js` - CLI入口文件
- `src/index.js` - 核心工具类(支持外部配置传入)
- 其他模块保持不变

### 6. 兼容性

#### 保留的功能
原有的所有核心功能都保留：
- 中文提取
- AST解析
- 模板字符串处理
- 自动替换
- 备份机制
- 日志记录
- 验证功能

#### 原有脚本
原有的npm scripts仍然可用：
```bash
npm run extract
npm run generate  
npm run replace
npm run translate
npm run verify
```

但推荐使用新的CLI命令。

## 安装使用

### 全局安装
```bash
npm install -g tricolor-vue2-i18n
```

### 在项目中使用
```bash
cd your-vue2-project
tricolor-vue2-i18n init
tricolor-vue2-i18n replace
tricolor-vue2-i18n translate en-us
tricolor-vue2-i18n verify
```

## 文档更新

### 新增文档
- `CLI_README.md` - CLI工具完整文档
- `CLI_QUICK_START.md` - 快速开始指南
- `TEST_GUIDE.md` - 测试指南
- `UPDATES.md` - 本文件

### 更新文档
- `README.md` - 添加CLI使用说明
- `package.json` - 更新包名和bin配置

## 测试

### 在开发环境测试
```bash
# 1. 链接到全局
cd d:\LZY\Projects\vue-i18n
npm link

# 2. 测试CLI
tricolor-vue2-i18n --help

# 3. 在示例项目测试
cd examples/vue2-demo
tricolor-vue2-i18n init
```

### 在生产环境使用
```bash
# 发布到npm
npm publish

# 在其他项目安装使用
npm install -g tricolor-vue2-i18n
cd your-project
tricolor-vue2-i18n init
```

## 注意事项

1. **运行位置**: 必须在Vue2项目根目录运行命令
2. **备份**: replace命令会自动备份，但建议先提交代码到Git
3. **Element UI**: 如果项目使用Element UI，建议在init时选择Yes
4. **翻译模板**: translate命令前需要手动填写translation-template.txt
5. **验证报告**: 建议在所有操作完成后运行verify命令确认

## 已完成项

- ✅ 创建CLI命令行工具结构
- ✅ 实现4个核心命令(init, replace, translate, verify)
- ✅ 添加Element UI多语言配置支持
- ✅ 实现交互式命令提示
- ✅ 更新所有文档
- ✅ 测试CLI功能

## 下一步

1. 在示例项目中完整测试所有命令
2. 修复可能存在的问题
3. 发布到npm (可选)
4. 在实际项目中验证
