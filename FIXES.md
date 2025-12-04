# i18n工具修复总结

## 问题描述

在运行 `node src/index.js full` 执行全量转换后，vue2-demo项目出现大量报错，无法正常启动。

## 发现的问题

### 1. 普通JS文件使用错误的i18n调用方式

**问题**：工具在普通JS文件（如 `utils/helpers.js`, `utils/request.js`, `utils/constants.js` 等）中使用了 `this.$t()`，但这些文件不是Vue组件，没有Vue实例上下文。

**错误示例**：
```javascript
// utils/constants.js
export const APP_CONFIG = {
  APP_NAME: this.$t('common.texto63gaq'),  // ❌ 错误：this.$t 不可用
};
```

**修复方案**：
- 普通JS文件应该使用 `i18n.t()` 而不是 `this.$t()`
- 在文件顶部添加 `import i18n from '@/i18n'`

**修复后**：
```javascript
import i18n from '../i18n/index';

export const APP_CONFIG = {
  APP_NAME: i18n.t('common.texto63gaq'),  // ✓ 正确
};
```

### 2. 配置文件被错误转换

**问题**：vue.config.js 等配置文件也被转换，但这些文件在Node环境中运行，无法使用i18n。

**错误示例**：
```javascript
// vue.config.js
chainWebpack: (config) => {
  config.plugin('html').tap((args) => {
    args[0].title = this.$t('common.texto63gaq');  // ❌ 配置文件不应该使用i18n
    return args;
  });
}
```

**修复方案**：
- 在replacer中添加配置文件排除列表
- 配置文件应保持原样，不进行国际化转换

### 3. 模板字符串变量提取错误

**问题**：Parser在提取模板字符串时，保留了完整的变量路径（如 `row.realName`），但这些变量在使用时的上下文中可能不存在。

**错误示例**：
```javascript
// 原始代码
console.log(`确定要删除用户"${row.realName}"吗？`);

// 错误转换
i18n.t('common.textk7ez62', { realName: row.realName })
// ❌ 但在有些地方 row 变量不存在
```

**修复方案**：
- 修改Parser，只保留最后一个属性名作为参数key
- 在replacer中使用完整路径作为参数值

**修复后的提取逻辑**：
```javascript
// jsParser.js
getLastProperty(node) {
  // 从 row.realName 提取 realName
  if (node.property && node.property.name) {
    return node.property.name;
  }
  return 'value';
}
```

**修复后的替换**：
```javascript
// 使用简化key，完整路径作为值
const params = variables.map((v, i) => `${v}: ${fullPaths[i]}`).join(', ');
// 生成: { realName: row.realName }
```

### 4. Vue模板中的复杂表达式

**问题**：模板中包含条件表达式或对象属性访问时，生成的参数对象key不合法。

**错误示例**：
```vue
<!-- 原始代码 -->
<div>{{ pendingOrders > 0 ? '请及时处理' : '暂无待处理订单' }}</div>
<div>库存数量：{{ currentProduct.stock }}</div>

<!-- 错误转换 -->
{{ $t('key', { pendingOrders > 0 ? '请及时处理' : '暂无待处理订单': ... }) }}
{{ $t('key', { currentProduct.stock: currentProduct.stock }) }}
<!-- ❌ 对象key不能包含表达式或点号 -->
```

**修复方案**：
- 对于条件表达式，应该将整个表达式作为变量
- 对于对象属性，使用简化的属性名作为key

## 已实施的修复

### 1. 修改 `src/replacer/index.js`

#### a) 添加配置文件排除逻辑
```javascript
async replaceFileOnce(filePath, keys, keyMap) {
  // 跳过配置文件
  const fileName = path.basename(filePath);
  const configFiles = ['vue.config.js', 'webpack.config.js', 'babel.config.js', 'vite.config.js', 'rollup.config.js'];
  if (configFiles.includes(fileName)) {
    console.log(`跳过配置文件: ${fileName}`);
    return null;
  }
  // ...
}
```

#### b) 区分Vue组件和普通JS文件
```javascript
async replaceJsFile(content, key, keyInfo, keyMap, filePath = '') {
  const isVueComponent = filePath.endsWith('.vue');
  const replacedContent = this.replaceJsContent(content, keyMap, isVueComponent, filePath);
  return replacedContent;
}

replaceJsContent(content, keyMap, isVueComponent = false, filePath = '') {
  const i18nMethod = isVueComponent ? 'this.$t' : 'i18n.t';
  // ...
}
```

#### c) 添加i18n导入语句生成
```javascript
generateI18nImport(filePath) {
  if (!filePath) {
    return "import i18n from '@/i18n';\n";
  }
  
  // 计算相对路径
  const fileDir = path.dirname(filePath);
  const projectRoot = this.config.targetProject;
  const i18nPath = path.join(projectRoot, 'src', 'i18n', 'index.js');
  
  let relativePath = path.relative(fileDir, i18nPath);
  relativePath = relativePath.replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  relativePath = relativePath.replace(/\.js$/, '');
  
  return `import i18n from '${relativePath}';\n`;
}
```

#### d) 使用fullPaths信息
```javascript
// Template部分
const variables = info.variables || [];
const fullPaths = info.fullPaths || variables;
const params = variables.map((v, i) => `${v}: ${fullPaths[i]}`).join(', ');

// Script部分
const variables = info.variables;
const fullPaths = info.fullPaths || variables;
const params = variables.map((v, i) => `${v}: ${fullPaths[i]}`).join(', ');
```

### 2. 修改 `src/parser/jsParser.js`

#### 添加getLastProperty方法
```javascript
getLastProperty(node) {
  if (node.type === 'Identifier') {
    return node.name;
  }
  
  if (node.type === 'MemberExpression') {
    if (node.property && node.property.name) {
      return node.property.name;
    }
    return this.getLastProperty(node.property);
  }
  
  return 'value';
}
```

#### 更新extractTemplateInfo方法
```javascript
extractTemplateInfo(node) {
  const variables = [];
  const fullPaths = []; // 保存完整路径供显示
  const parts = [];

  node.expressions.forEach((expr, index) => {
    let varName = '';
    let fullPath = '';
    
    if (expr.type === 'Identifier') {
      varName = expr.name;
      fullPath = expr.name;
    } else if (expr.type === 'MemberExpression') {
      fullPath = this.getMemberExpressionName(expr);
      varName = this.getLastProperty(expr); // 只取最后一个属性名
    } else if (expr.type === 'ConditionalExpression') {
      varName = `value${index}`;
      fullPath = `value${index}`;
    } else {
      varName = `expr${index}`;
      fullPath = `expr${index}`;
    }
    
    variables.push(varName);
    fullPaths.push(fullPath);
  });

  return {
    template,
    variables,
    fullPaths, // 返回完整路径信息
    parts
  };
}
```

### 3. 修改 `src/extractor/index.js`

#### 更新addTemplateString方法
```javascript
addTemplateString(text, filePath, section, line, variables = [], fullPaths = []) {
  const key = `${filePath}::${section}::line:${line}`;
  
  if (text.includes('{{') && text.includes('}}')) {
    const vueVars = text.match(/\{\{([^}]+)\}\}/g);
    if (vueVars) {
      variables = vueVars.map(v => v.replace(/\{\{|\}\}/g, '').trim());
      fullPaths = variables; // Vue表达式就是完整路径
    }
  }

  this.results.templates[key] = {
    original: text,
    type: '__TEMPLATE__',
    variables,
    fullPaths: fullPaths.length > 0 ? fullPaths : variables
  };
}
```

### 4. 修改 `src/generator/i18nGenerator.js`

#### 保存fullPaths到keyMap
```javascript
for (const [path, info] of Object.entries(extractedData.templates)) {
  const key = this.generateKey(info.original, path);
  keyMap[path] = {
    key,
    variables: info.variables,
    fullPaths: info.fullPaths || info.variables, // 保存完整路径
    original: info.original
  };
  // ...
}
```

### 5. 创建临时修复脚本

创建了 `scripts/fix-js-files.js` 来修复已转换的普通JS文件：
- 将 `this.$t(` 替换为 `i18n.t(`
- 添加 `import i18n from` 导入语句
- 跳过配置文件和i18n目录本身

### 6. 手动修复特殊文件

- `vue.config.js`: 将i18n调用还原为硬编码字符串
- `src/main.js`: 添加 i18n 实例到Vue根实例

## 使用方法

### 重新运行工具（使用修复后的版本）

```bash
# 执行全量转换
node src/index.js full
```

修复后的工具会：
1. 自动跳过配置文件
2. 对普通JS文件使用 `i18n.t()` 并添加导入
3. 对Vue组件使用 `this.$t()`
4. 正确处理模板字符串变量

### 如果已经运行过旧版本

1. 运行修复脚本：
```bash
node scripts/fix-js-files.js
```

2. 手动检查并修复特殊文件（如配置文件）

## 测试验证

修复后，项目应该能够正常启动：

```bash
cd examples/vue2-demo
npm run serve
```

## 后续改进建议

1. **增强配置文件检测**
   - 添加更多配置文件模式到排除列表
   - 支持通过配置自定义排除文件

2. **改进变量检测**
   - 检测变量作用域，避免使用不存在的变量
   - 对复杂表达式提供更好的处理

3. **添加验证步骤**
   - 转换后自动运行ESLint检查
   - 提供回滚机制

4. **更好的备份机制**
   - 实现真正的文件备份（当前备份目录为空）
   - 支持增量备份和恢复

5. **增加测试覆盖**
   - 添加单元测试
   - 添加集成测试用例

## 总结

主要修复了三个核心问题：
1. **上下文问题**：普通JS文件使用了需要Vue实例的 `this.$t()`
2. **配置文件问题**：配置文件被错误转换
3. **变量映射问题**：模板字符串变量提取和使用不一致

通过修改Parser、Extractor、Generator和Replacer四个模块，实现了正确的i18n转换流程。
