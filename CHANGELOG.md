# 变更日志

本文档记录了项目的所有重要变更和修复。

## [2.0.0] - 2025-12-09

### 🎉 重大更新 - CLI命令行工具版本

#### 新增功能
- **CLI工具**: 项目改造为命令行工具 `tricolor-vue2-i18n`
- **4个核心命令**: `init`, `replace`, `translate`, `verify`
- **交互式提示**: 使用inquirer实现友好的用户交互
- **Element UI配置**: 支持可选的Element UI多语言配置
- **自动工作目录**: 无需配置文件，自动使用当前目录

#### 使用方式变更
**旧方式** (需要config.json):
```bash
npm run extract
npm run generate
npm run replace
```

**新方式** (CLI命令):
```bash
tricolor-vue2-i18n init
tricolor-vue2-i18n replace
tricolor-vue2-i18n translate
tricolor-vue2-i18n verify
```

#### 技术变更
- 包名: `vue-i18n-auto-tool` → `tricolor-vue2-i18n`
- 新增依赖: `inquirer@8.2.5`
- 新增: `bin/cli.js` CLI入口文件
- 修改: `src/index.js` 支持外部配置

#### 新增文档
- `CLI_README.md` - CLI完整使用文档
- `CLI_QUICK_START.md` - 快速开始指南
- `TEST_GUIDE.md` - 测试指南
- `UPDATES.md` - 详细更新说明
- `SUMMARY.md` - 改造总结

#### 兼容性
- ✅ 所有原有功能保持完整
- ✅ 原有npm scripts仍可使用
- ✅ 核心代码逻辑不变

---

## [1.0.0] - 2025-12-09 (之前版本)

### 重大变更 🔥

#### 1. 简化语言包目录结构 🆕
- **变更**: 翻译配置文件直接放在 `lang` 文件夹下，不再使用 `lang/locales` 子文件夹
- **影响**: 生成的目录结构从 `lang/locales/zh-CN/` 变为 `lang/zh-CN/`
- **优势**:
  - ✅ 目录结构更简洁直观
  - ✅ 减少一层嵌套,更容易理解
  - ✅ 与现代Vue项目结构更一致

**新的输出结构**:
```
output/
├── i18n-extracted-xxx.json       # 提取的中文文本
├── zh-CN/                        # 语言包文件夹（仅供查看）
│   ├── common.js
│   └── user.js
├── translation-template.txt      # 翻译对照模板
└── lang/                         # i18n配置文件夹（需要手动复制到项目）
    ├── index.js
    └── zh-CN/                    # 直接放在lang下
        ├── common.js
        └── user.js
```

**手动集成步骤**:
```bash
# 1. 复制lang文件夹到项目
cp -r output/lang your-project/src/lang

# 2. 在main.js中引入
import i18n from './lang'
```

详细说明请参考: [docs/MANUAL_INTEGRATION.md](./docs/MANUAL_INTEGRATION.md)

#### 2. i18n配置统一输出到output目录
- **变更**: 不再在目标项目内部生成i18n配置，所有文件统一输出到 `output` 目录
- **影响**: 需要手动将 `output/lang` 文件夹复制到项目中
- **优势**:
  - ✅ 不会意外修改目标项目的文件结构
  - ✅ 可以先检查生成的文件再决定是否使用
  - ✅ 更灵活的集成方式，可以根据项目需求调整
  - ✅ 更安全，避免覆盖现有配置

#### 3. 移除 config.json 中的 i18nPath 配置 🗑️
- **变更**: 移除了 `autoReplace.i18nPath` 配置项
- **原因**: 所有输出统一到 `output/lang` 目录，不再需要指定目标项目中的路径
- **保留**: `importPath` 配置保留，用于自动替换时的 import 语句

**配置变更对比**:
```json
// 旧配置
{
  "autoReplace": {
    "i18nPath": "./src/lang",  // 已移除
    "importPath": "@/lang"     // 保留
  }
}

// 新配置
{
  "autoReplace": {
    "importPath": "@/lang"     // 仅保留这个，用于替换时的import路径
  }
}
```

### 新增功能 ✨

#### 1. 新增手动集成指南文档
- 新增 `docs/MANUAL_INTEGRATION.md` 文档
- 详细说明如何手动将生成的配置集成到项目中
- 包含 Vite 项目的集成方式
- 提供常见问题解答

### 改进 🔧

#### 1. 更新命令行提示
- `generate` 命令现在会提示用户手动复制文件
- `replace` 命令现在会提示lang文件夹的位置
- 更清晰的操作指引

#### 2. 更新文档
- 更新 `README.md`，说明新的工作流程
- 更新 `QUICK_START.md`，添加手动集成步骤
- 添加手动集成指南链接

### 迁移指南 📖

如果你正在使用旧版本，需要做以下调整：

1. **更新 config.json**:
   ```json
   // 移除这一行
   "i18nPath": "./src/lang",
   ```

2. **使用新的工作流程**:
   ```bash
   # 生成配置
   npm run generate output/i18n-extracted-xxx.json
   
   # 手动复制到项目
   cp -r output/lang your-project/src/lang
   ```

3. **手动集成i18n**: 参考 [docs/MANUAL_INTEGRATION.md](./docs/MANUAL_INTEGRATION.md)

---

## [v1.0.1] - 2025-12-08

### 重大变更 🔥

#### 1. 文件夹结构改为模块化 🆕
- **变更**: 将单文件语言包 (`zh-CN.js`) 改为文件夹结构 (`zh-CN/`)
- **影响**: 生成的语言包现在按模块拆分为多个独立的 JS 文件
- **优势**: 
  - 更清晰的代码组织
  - 更好的可维护性
  - 支持按需加载

**新的文件结构**:
```
output/
├── zh-CN/
│   ├── common.js    # 公共模块
│   ├── user.js      # 用户模块
│   └── order.js     # 订单模块
└── en-US/
    ├── common.js
    ├── user.js
    └── order.js
```

**文件内容示例** (`common.js`):
```javascript
export default {
  "submit": "提交",
  "cancel": "取消"
};
```

#### 2. Key 命名规则改为大写字母开头 🆕
- **变更**: 所有生成的 i18n key 现在以大写字母开头
- **旧格式**: `common.submit`, `user.login`
- **新格式**: `Common.submit`, `User.login`
- **使用示例**: `$t('Common.submit')`, `$t('User.login')`

#### 3. 目录名称从 i18n 改为 lang 🆕
- **变更**: 默认生成目录从 `src/i18n` 改为 `src/lang`
- **配置项**: `config.json` 中的 `i18nPath` 和 `importPath`
- **默认值**: 
  - `i18nPath`: `./src/lang`
  - `importPath`: `@/lang`

### 更新内容 📝

#### 配置文件更新
- 更新 `config.json` 中的默认路径配置
- 更新 `keyMappings` 使用大写字母开头
- 更新 `keyPrefixes` 使用大写字母开头

#### 生成器更新
- `localeGenerator.js`: 支持生成模块化文件夹结构
- `i18nGenerator.js`: 支持生成模块化语言包和动态导入
- `translationGenerator.js`: 支持读取和生成文件夹结构的语言包
- `keyGenerator.js`: Key 生成规则改为大写字母开头

#### 替换器更新
- `replacer/index.js`: 更新跳过规则以支持 `/lang/` 目录
- 更新导入路径计算以使用配置的 `i18nPath`

#### 文档更新
- 更新 `README.md` 反映新的文件结构和 key 格式
- 更新 `QUICK_START.md` 包含新的使用示例
- 更新相关示例代码

### 向后兼容性 ⚠️

- 翻译生成器保留对旧单文件格式的兼容性
- 可以读取旧的 `zh-CN.js` 单文件格式
- 建议新项目使用新的文件夹结构

---

## [2025-12-04]

### 新增功能 ✨

#### 1. 多语言翻译生成功能 🌍 🆕
**文件**: `src/generator/translationGenerator.js`

新增根据中文语言包和翻译对照模板生成其他语言配置文件的功能：

**功能特点**:
- 自动读取 `zh-CN.js` 和 `translation-template.txt`
- 根据翻译对照关系生成目标语言配置文件
- 支持任意语言代码（如 en-US, ja-JP, ko-KR 等）
- 保留变量占位符（如 `{username}`, `{count}` 等）
- 显示翻译统计信息（已翻译/未翻译条数、翻译率）
- 自动生成格式与 `zh-CN.js` 完全一致的 ES6 模块

**使用方式**:
```bash
# 使用默认参数（output目录，en-US语言）
npm run translate

# 指定目录和语言
npm run translate output en-US
npm run translate output ja-JP
npm run translate output ko-KR

# 或使用node命令
node src/index.js translate [outputDir] [targetLang]
```

**工作流程**:
1. 运行 `npm run regenerate` 生成 `zh-CN.js` 和 `translation-template.txt`
2. 编辑 `translation-template.txt`，填写翻译内容
3. 运行 `npm run translate output en-US` 生成英语配置文件
4. 将生成的语言包文件部署到项目中

**新增命令**:
- `translate` - 根据翻译模板生成其他语言配置文件

**相关文档**:
- [翻译生成指南](./docs/TRANSLATE_GUIDE.md)
- [翻译示例](./docs/TRANSLATION_EXAMPLES.md)

#### 2. 待处理任务记录功能 🆕
**文件**: `src/utils/logger.js` - `generatePendingTasks()` 方法

自动生成单独的待处理任务记录文件，方便手动处理转换失败的文本：

**功能特点**:
- 自动在完整流程中生成（只要有失败或跳过的记录）
- 生成两种格式：
  - **Markdown** (`pending-tasks-{timestamp}.md`): 便于阅读和标记处理状态
  - **JSON** (`pending-tasks-{timestamp}.json`): 便于程序化处理
- 详细记录：
  - ❌ **转换失败**: 文件路径、行号、原文、失败原因、时间戳、处理状态复选框
  - ⏭️ **跳过处理**: 按原因分类，包含文件路径、行号、文本内容、所在区域
- 内置处理建议和完整的手动处理流程指导

**使用方式**:
```bash
# 运行完整流程，自动生成待处理任务
node src/index.js full

# 查看生成的待处理任务
code output/pending-tasks-*.md
```

**配置选项** (`config.json`):
```json
{
  "pendingTasks": {
    "enabled": true,
    "outputFormat": ["markdown", "json"],
    "includeSkipped": true,
    "includeFailed": true
  }
}
```

详细文档: [docs/PENDING_TASKS.md](./docs/PENDING_TASKS.md)

#### 3. 详细日志记录功能
**文件**: `src/utils/logger.js`

- 记录所有提取的文本及其位置信息
- 记录跳过的内容及跳过原因（import语句、console调用、注释等）
- 记录成功和失败的替换操作
- 支持控制台和文件双重输出
- 自动生成详细的转换报告

**日志输出**:
- 控制台: 只显示 info 及以上级别
- 文件: 所有级别，保存在 `logs/` 目录
- 文件名格式: `i18n-conversion-YYYY-MM-DDTHH-mm-ss.log`

#### 3. 转换后验证功能
**文件**: `src/validator/index.js`

- 自动检查转换后的文件是否还有未转换的中文
- 智能识别已转换的文本（在 `$t()` 中）
- 排除注释中的中文
- 生成详细的验证报告: `output/validation-report.md`

使用方式：
```bash
# 作为 full 流程的一部分自动运行
node src/index.js full

# 单独运行验证
node src/index.js validate
```

#### 3. 增强混合文本和标签处理
**文件**: `src/extractor/index.js`

- 新增 `extractMixedContent` 方法，专门处理混合了文本和标签的内容
- 改进的提取逻辑，能够分离并提取混合内容中的纯文本部分
- 更详细的日志记录

示例：
```html
<!-- 原始 -->
<p>还没有账号？<el-button>立即注册</el-button></p>

<!-- 转换后 -->
<p>{{ $t('common.text1') }}<el-button>{{ $t('common.text2') }}</el-button></p>
```

### 问题修复 🐛

#### 1. Vue2 解析器兼容性修复
**文件**: `src/parser/vueParser.js`

- 使用 vue-template-compiler 作为解析依赖
- 使用 `compiler.parseComponent()` API 解析 Vue 单文件组件
- 完全兼容 Vue 2.x 语法

#### 2. 安全变量名生成
**文件**: `src/replacer/index.js`, `src/generator/i18nGenerator.js`

**问题**: 
- 对象路径如`currentProduct.stock`不能直接作为JS对象的key
- 复杂表达式如`pendingOrders > 0 ? '...' : '...'`被当作变量处理

**修复**:
- 添加`generateSafeVarName()`方法
- 对于`obj.prop`形式，提取最后一部分`prop`作为key
- 对于复杂表达式，生成`val0`, `val1`等安全名称

#### 3. 跳过复杂表达式
**文件**: `src/extractor/index.js`

**问题**: 三元运算符、函数调用等复杂表达式无法正确转换

**修复**:
- 在`addTemplateString()`中检测复杂表达式
- 跳过包含`?`、`:`、`>`、`<`、`&&`、`||`、`()`的表达式
- 输出警告信息，便于手动处理

#### 4. 循环引用问题修复
**文件**: `src/replacer/index.js`

**问题**: 语言包文件（如 `zh-CN.js`）被错误替换，导致循环引用

**根源**:
- 工具在替换阶段会遍历所有 `.js` 文件，包括语言包文件
- 当发现语言包中的字符串值匹配到 keyMap 时，错误地将其替换为 `i18n.t()`
- 导致语言包引用自身，形成循环依赖

**修复**:
```javascript
// 跳过i18n配置目录下的所有文件
const normalizedPath = filePath.replace(/\\/g, '/');
if (normalizedPath.includes('/i18n/') || normalizedPath.includes('/locales/')) {
  console.log(`跳过i18n配置文件: ${fileName}`);
  return null;
}
```

#### 5. 普通JS文件使用错误的i18n调用方式
**文件**: `src/replacer/index.js`

**问题**: 工具在普通JS文件中使用了 `this.$t()`，但这些文件没有Vue实例上下文

**修复**: 
- 普通JS文件使用 `i18n.t()` 而不是 `this.$t()`
- 在文件顶部自动添加 `import i18n from '@/i18n'`

#### 6. 配置文件被错误转换
**文件**: `src/replacer/index.js`

**问题**: vue.config.js 等配置文件也被转换，但这些文件在Node环境中运行，无法使用i18n

**修复**: 在replacer中添加配置文件排除列表
```javascript
const configFiles = ['vue.config.js', 'webpack.config.js', 'babel.config.js', 'vite.config.js', 'rollup.config.js'];
```

### 需要手动处理的内容 ⚠️

#### 1. i18n实例注入
生成的i18n配置需要手动注入到Vue实例：

```javascript
// main.js
import i18n from './i18n';

new Vue({
  i18n,  // 添加这一行
  router,
  store,
  render: h => h(App)
}).$mount('#app');
```

#### 2. 复杂表达式
对于被跳过的复杂表达式（工具会显示警告），需要手动处理：

```vue
<!-- 原代码 -->
<div>{{ pendingOrders > 0 ? '请及时处理' : '暂无待处理订单' }}</div>

<!-- 手动改为 -->
<div>{{ pendingOrders > 0 ? $t('common.pleaseHandle') : $t('common.noOrders') }}</div>
```

### 改进汇总

| 改进项 | 状态 | 说明 |
|--------|------|------|
| Vue2解析器支持 | ✅ 完成 | 使用vue-template-compiler |
| 安全变量名生成 | ✅ 完成 | 处理对象路径和复杂表达式 |
| 跳过复杂表达式 | ✅ 完成 | 避免错误转换 |
| 跳过i18n配置文件 | ✅ 完成 | 防止循环引用 |
| 详细日志记录 | ✅ 完成 | 提高可追溯性 |
| 转换后验证 | ✅ 完成 | 确保转换完整性 |
| 混合内容处理 | ✅ 完成 | 处理复杂模板结构 |
| 自动注入i18n | ⚠️ 需手动 | main.js需手动添加 |

### 已知限制

1. **复杂表达式**: 三元运算符、函数调用等需要手动处理
2. **main.js注入**: 需要手动添加i18n实例
3. **动态属性**: 如`:class`、`:style`中的复杂表达式可能需要手动调整
4. **注释中的中文**: 不会被提取（这是预期行为）

### 新增配置项

在 `config.json` 中新增以下配置项：

```json
{
  "logDir": "./logs",              // 日志目录
  "logLevel": "info",              // 日志级别: debug, info, warn, error
  "enableFileLog": true            // 是否启用文件日志
}
```

### 输出文件

执行 `full` 命令后会生成以下文件：

```
vue-i18n/
├── logs/
│   └── i18n-conversion-*.log          # 详细日志
├── output/
│   ├── i18n-extracted-*.json         # 提取的JSON
│   └── validation-report.md          # 验证报告
└── backup/
    └── backup-*/                      # 备份文件
```

### 测试验证

修复后的工具已通过以下测试：

1. ✅ 正确解析Vue2的.vue文件
2. ✅ 生成Vue2兼容的i18n配置
3. ✅ 为对象路径生成安全的变量名
4. ✅ 跳过复杂表达式避免错误
5. ✅ 正确处理模板字符串
6. ✅ 跳过i18n配置文件避免循环引用
7. ✅ 生成详细的日志和验证报告

---

## 下一步优化计划

1. 自动检测并修改main.js，注入i18n实例
2. 更智能的复杂表达式处理策略
3. 增量更新支持（只处理新增/修改的文件）
4. 更完善的备份和回滚机制
5. 支持自定义规则配置
