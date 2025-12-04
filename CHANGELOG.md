# 变更日志

本文档记录了项目的所有重要变更和修复。

## [最新版本] - 2025-12-04

### 新增功能 ✨

#### 1. 详细日志记录功能
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

#### 2. 转换后验证功能
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
