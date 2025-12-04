# 循环引用问题修复说明

## 问题描述

在使用 `node src/index.js full` 转换 vue2-demo 项目后，生成的 `zh-CN.js` 配置文件中出现了大量的循环引用：

```javascript
import i18n from '../index';
export default {
  "common": {
    "texti4cdsu": i18n.t('common.texti4cdsu'),  // ❌ 循环引用
    "textiifi5w": "退出登录",                   // ✓ 正确
    // ...
  }
};
```

这导致项目运行时报错：
```
Uncaught TypeError: Cannot read properties of undefined (reading 't')
```

## 问题根源

问题出在 `src/replacer/index.js` 的 `replaceFileOnce` 和 `replaceFile` 方法中：

1. **替换阶段**：工具会遍历项目中的所有 `.js` 文件
2. **错误处理**：包括 `zh-CN.js` 语言包文件也被当作普通 JS 文件处理
3. **错误替换**：当发现语言包文件中的字符串值（如 `"退出登录"`）匹配到 keyMap 中的某个 key 时，就将其替换为 `i18n.t('common.xxx')`
4. **循环依赖**：这导致语言包文件引用自身，而 `i18n` 实例又依赖语言包，形成循环依赖

## 解决方案

### 1. 修复工具代码

修改 `src/replacer/index.js`，在 `replaceFileOnce` 和 `replaceFile` 方法中添加跳过 i18n 目录的逻辑：

```javascript
async replaceFileOnce(filePath, keys, keyMap) {
  // 跳过配置文件
  const fileName = path.basename(filePath);
  const configFiles = ['vue.config.js', 'webpack.config.js', 'babel.config.js', 'vite.config.js', 'rollup.config.js'];
  if (configFiles.includes(fileName)) {
    console.log(`跳过配置文件: ${fileName}`);
    return null;
  }

  // 跳过i18n配置目录下的所有文件 ✅ 新增
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (normalizedPath.includes('/i18n/') || normalizedPath.includes('/locales/')) {
    console.log(`跳过i18n配置文件: ${fileName}`);
    return null;
  }
  
  // ... 其余代码
}
```

### 2. 修复已损坏的语言包文件

运行修复脚本：

```bash
node scripts/fix-locale-file.js
```

该脚本会：
1. 读取最新的提取文件（`output/i18n-extracted-*.json`）
2. 使用 `I18nGenerator` 重新生成正确的语言包文件
3. 覆盖已损坏的 `zh-CN.js` 文件

## 验证修复

修复后的 `zh-CN.js` 文件应该是这样的：

```javascript
export default {
  "common": {
    "texto63gaq": "企业管理系统",      // ✓ 纯字符串值
    "textiifi5w": "退出登录",          // ✓ 纯字符串值
    "home": "首页",                    // ✓ 纯字符串值
    // ...
  }
};
```

不应该包含：
- ❌ `import i18n from '../index';`
- ❌ `i18n.t('common.xxx')`

## 预防措施

现在工具已经修复，以后运行 `node src/index.js full` 时：
- ✅ 会自动跳过 `i18n/` 和 `locales/` 目录下的所有文件
- ✅ 不会再修改语言包文件
- ✅ 不会产生循环引用问题

## 相关文件

- `src/replacer/index.js` - 修复了文件替换逻辑
- `scripts/fix-locale-file.js` - 修复工具脚本
- `examples/vue2-demo/src/i18n/locales/zh-CN.js` - 已修复的语言包文件
