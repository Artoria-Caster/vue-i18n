# Vue2 i18n工具修复说明

> **注意**: 本工具专为 Vue 2 项目设计，仅支持 Vue 2.x 和 vue-i18n@8.x。

## 修复内容总结

### 1. ✅ Vue2解析器兼容性修复
**文件**: `src/parser/vueParser.js`

**说明**: 工具使用 vue-template-compiler 解析 Vue 2 项目

**实现**: 
- 使用 vue-template-compiler 作为解析依赖
- 使用 `compiler.parseComponent()` API 解析 Vue 单文件组件
- 完全兼容 Vue 2.x 语法

### 2. ✅ 安全变量名生成
**文件**: `src/replacer/index.js`, `src/generator/i18nGenerator.js`

**问题**: 
- 对象路径如`currentProduct.stock`不能直接作为JS对象的key
- 复杂表达式如`pendingOrders > 0 ? '...' : '...'`被当作变量处理

**修复**:
- 添加`generateSafeVarName()`方法
- 对于`obj.prop`形式，提取最后一部分`prop`作为key
- 对于复杂表达式，生成`val0`, `val1`等安全名称

### 3. ✅ 跳过复杂表达式
**文件**: `src/extractor/index.js`

**问题**: 三元运算符、函数调用等复杂表达式无法正确转换

**修复**:
- 在`addTemplateString()`中检测复杂表达式
- 跳过包含`?`、`:`、`>`、`<`、`&&`、`||`、`()`的表达式
- 输出警告信息

### 4. ✅ i18n实例注入
**问题**: 生成的i18n配置未自动注入到Vue实例

**手动修复步骤** (已在RECOVERY_GUIDE.md中说明):
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

## 使用方法

### 准备工作
1. 确保项目已安装依赖：
```bash
npm install
```

2. 配置目标项目路径（`config.json`）：
```json
{
  "targetProject": "./examples/vue2-demo"
}
```

### 运行工具

#### 方式1：完整流程（推荐）
```bash
node src/index.js full
```

#### 方式2：分步执行
```bash
# 步骤1：提取中文
node src/index.js extract

# 步骤2：生成i18n配置
node src/index.js generate output/i18n-extracted-xxx.json

# 步骤3：自动替换（可选）
node src/index.js replace output/i18n-extracted-xxx.json
```

### 手动步骤

完成自动化后，需要手动：

1. **在main.js中注入i18n**:
```javascript
import i18n from './i18n';

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
```

2. **处理复杂表达式**:
对于被跳过的复杂表达式（工具会显示警告），需要手动处理：
```vue
<!-- 原代码 -->
<div>{{ pendingOrders > 0 ? '请及时处理' : '暂无待处理订单' }}</div>

<!-- 手动改为 -->
<div>{{ pendingOrders > 0 ? $t('common.pleaseHandle') : $t('common.noOrders') }}</div>
```

## 工具改进点

| 改进项 | 状态 | 说明 |
|--------|------|------|
| Vue2解析器支持 | ✅ 完成 | 使用vue-template-compiler |
| 安全变量名生成 | ✅ 完成 | 处理对象路径和复杂表达式 |
| 跳过复杂表达式 | ✅ 完成 | 避免错误转换 |
| 自动注入i18n | ⚠️ 需手动 | main.js需手动添加i18n注入 |

## 测试验证

修复后的工具已通过以下测试：

1. ✅ 正确解析Vue2的.vue文件
2. ✅ 生成Vue2兼容的i18n配置
3. ✅ 为对象路径生成安全的变量名
4. ✅ 跳过复杂表达式避免错误
5. ✅ 正确处理模板字符串
6. ⚠️ 需手动注入i18n实例到main.js

## 已知限制

1. **复杂表达式**: 三元运算符、函数调用等需要手动处理
2. **main.js注入**: 需要手动添加i18n实例
3. **动态属性**: 如`:class`、`:style`中的复杂表达式可能需要手动调整
4. **注释中的中文**: 不会被提取（这是预期行为）

## 恢复指南

如果转换出现问题，参考`RECOVERY_GUIDE.md`进行恢复。

## 下一步优化

1. 自动检测并修改main.js，注入i18n实例
2. 更智能的复杂表达式处理策略
3. 增量更新支持（只处理新增/修改的文件）
4. 更完善的备份和回滚机制
5. 支持自定义规则配置
