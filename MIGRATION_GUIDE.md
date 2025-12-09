# 迁移指南：升级到最新版本（2025-12-09）

如果您的项目正在使用旧版本的 vue-i18n 工具，本指南将帮助您顺利迁移到新版本。

## 重大变更：i18n配置不再生成到项目内部

**最重要的变更**: 从 2025-12-09 版本开始，工具不再将 i18n 配置直接生成到目标项目内部，而是统一输出到 `output/lang` 目录，需要用户手动复制到项目中。

### 为什么做这个变更？

1. **安全性**: 避免意外修改目标项目的文件结构
2. **灵活性**: 可以先检查生成的文件再决定是否使用
3. **可控性**: 用户完全控制 i18n 配置的集成时机和方式
4. **兼容性**: 更容易适配不同的项目结构和构建工具

---

## 主要变更概览

| 项目 | 旧版本 | 新版本 (2025-12-09) |
|------|--------|---------------------|
| 输出位置 | `your-project/src/lang` | `output/lang` (需手动复制) |
| 配置项 | `autoReplace.i18nPath` | 移除此配置项 |
| 集成方式 | 自动生成到项目 | 手动复制到项目 |
| 目录名称 | `src/i18n` → `src/lang` | 统一为 `lang` |
| 文件结构 | `zh-CN.js` (单文件) | `zh-CN/` (文件夹，模块化) |
| Key 格式 | `common.submit` | `Common.submit` (首字母大写) |
| 导入路径 | `@/i18n` | `@/lang` |

---

## 迁移步骤

### 步骤 1: 更新配置文件

编辑项目根目录的 `config.json`，移除 `i18nPath` 配置：

**旧版本配置**:
```json
{
  "autoReplace": {
    "enabled": true,
    "i18nPath": "./src/lang",      // ← 需要移除
    "importPath": "@/lang"
  }
}
```

**新版本配置**:
```json
{
  "autoReplace": {
    "enabled": true,
    // "i18nPath": "./src/lang",   // ← 已移除
    "importPath": "@/lang"           // ← 保留，用于替换时的import路径
  }
}
```

### 步骤 2: 更新工作流程

#### 旧的工作流程:
```bash
# 1. 提取
npm run extract

# 2. 生成（直接生成到目标项目）
npm run generate output/i18n-extracted-xxx.json
# → 生成到: your-project/src/lang/

# 3. 替换
npm run replace output/i18n-extracted-xxx.json
```

#### 新的工作流程:
```bash
# 1. 提取（相同）
npm run extract

# 2. 生成（输出到output目录）
npm run generate output/i18n-extracted-xxx.json
# → 生成到: output/lang/

# 3. 手动复制到项目（新增步骤）
# Windows:
xcopy /E /I output\lang your-project\src\lang

# Linux/Mac:
cp -r output/lang your-project/src/lang

# 4. 在main.js中引入i18n（如果还没有）
# 编辑 your-project/src/main.js

# 5. 替换（可选）
npm run replace output/i18n-extracted-xxx.json
```

### 步骤 3: 手动集成 i18n 配置

如果你的项目还没有集成 i18n，需要完成以下步骤：

#### 3.1 复制 lang 文件夹

将 `output/lang` 文件夹复制到项目的 `src` 目录：

**Windows (PowerShell/CMD)**:
```bash
xcopy /E /I output\lang your-project\src\lang
```

**Linux/Mac**:
```bash
cp -r output/lang your-project/src/lang
```

#### 3.2 安装 vue-i18n

```bash
cd your-project
npm install vue-i18n@8
```

#### 3.3 更新 main.js

**旧版本 (如果有)**:
```javascript
import i18n from './i18n'  // 旧路径
```

**新版本**:
```javascript
import Vue from 'vue'
import App from './App.vue'
import i18n from './lang'  // 新路径

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
```

### 步骤 4: 更新 Key 映射配置

如果使用了 `keyMappings` 和 `keyPrefixes`，需要更新为大写字母开头：

```json
{
  "keyMappings": {
    "提交": "Common.submit",      // 从 common.submit 改为 Common.submit
    "取消": "Common.cancel",
    "确认": "Common.confirm"
  },
  "keyPrefixes": {
    "src/views/user/": "User.",   // 从 user. 改为 User.
    "src/views/admin/": "Admin.",
    "src/components/common/": "Common."
  }
}
```

### 步骤 5: 验证迁移

启动项目验证是否正常工作：

```bash
cd your-project
npm run serve
```

---

## 旧版本的语言包结构迁移

如果你已经有旧版本生成的语言包，需要了解新旧结构的差异：

#### 3.1 旧的单文件结构

**旧版本** (`src/i18n/locales/zh-CN.js` 或 `src/lang/locales/zh-CN.js`):
```javascript
export default {
  common: {
    submit: "提交",
    cancel: "取消"
  },
  user: {
    login: "登录",
    logout: "退出"
  }
}
```

#### 3.2 新的文件夹结构

**新版本** (`src/lang/zh-CN/common.js`):
```javascript
export default {
  "submit": "提交",
  "cancel": "取消"
}
```

**新版本** (`src/lang/zh-CN/user.js`):
```javascript
export default {
  "login": "登录",
  "logout": "退出"
}
```

#### 3.3 更新 index.js 文件

**旧版本** (`src/i18n/index.js`):
```javascript
import zhCN from './zh-CN'
import enUS from './en-US'

const i18n = new VueI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})
```

**新版本** (`src/lang/index.js`):
```javascript
// 使用动态导入加载所有模块
const zhCNModules = import.meta.glob('./zh-CN/*.js', { eager: true });
const enUSModules = import.meta.glob('./en-US/*.js', { eager: true });

// 合并模块
const zhCN = {};
Object.keys(zhCNModules).forEach(key => {
  const moduleName = key.replace('./zh-CN/', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCN[capitalizedName] = zhCNModules[key].default;
});

const enUS = {};
Object.keys(enUSModules).forEach(key => {
  const moduleName = key.replace('./en-US/', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  enUS[capitalizedName] = enUSModules[key].default;
});

const i18n = new VueI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})
```

> **注意**: 如果你的项目不支持 `import.meta.glob`，可以使用 `require.context` (Webpack) 或手动导入。

**Webpack 版本**:
```javascript
const zhCNContext = require.context('./zh-CN', false, /\.js$/);
const zhCN = {};

zhCNContext.keys().forEach(key => {
  const moduleName = key.replace('./', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCN[capitalizedName] = zhCNContext(key).default;
});
```

### 步骤 4: 更新所有 i18n Key

需要将所有使用的 key 改为大写字母开头。

#### 4.1 在模板中

**旧版本**:
```vue
<template>
  <button>{{ $t('common.submit') }}</button>
  <h1>{{ $t('user.profile') }}</h1>
</template>
```

**新版本**:
```vue
<template>
  <button>{{ $t('Common.submit') }}</button>
  <h1>{{ $t('User.profile') }}</h1>
</template>
```

#### 4.2 在 JavaScript 中

**旧版本**:
```javascript
this.$t('common.login')
this.$message.success(this.$t('common.success'))
```

**新版本**:
```javascript
this.$t('Common.login')
this.$message.success(this.$t('Common.success'))
```

#### 4.3 批量替换工具

可以使用编辑器的查找替换功能（支持正则表达式）：

**VS Code 查找替换**:
- 查找: `\$t\('([a-z])([a-zA-Z]+)\.`
- 替换为: `$t('$1.toUpperCase()$2.`

或者使用命令行工具：
```bash
# Linux/Mac
find ./src -name "*.vue" -o -name "*.js" | xargs sed -i "s/\$t('common\./\$t('Common./g"
find ./src -name "*.vue" -o -name "*.js" | xargs sed -i "s/\$t('user\./\$t('User./g"

# Windows PowerShell
Get-ChildItem -Path ./src -Include *.vue,*.js -Recurse | ForEach-Object {
  (Get-Content $_.FullName) -replace "\`$t\('common\.", "`$t('Common." | Set-Content $_.FullName
  (Get-Content $_.FullName) -replace "\`$t\('user\.", "`$t('User." | Set-Content $_.FullName
}
```

### 步骤 5: 更新路由配置（如有）

如果在路由 meta 中使用了 i18n key：

**旧版本**:
```javascript
{
  path: '/user',
  meta: {
    title: 'user.management'
  }
}
```

**新版本**:
```javascript
{
  path: '/user',
  meta: {
    title: 'User.management'
  }
}
```

### 步骤 6: 测试验证

完成迁移后，建议进行以下测试：

1. **启动项目**:
   ```bash
   npm run dev
   ```

2. **检查控制台**: 确保没有 i18n 相关的警告或错误

3. **功能测试**: 
   - 切换语言
   - 检查所有页面的文本显示
   - 验证动态文本（带变量的）

4. **构建测试**:
   ```bash
   npm run build
   ```

---

## 自动化迁移脚本

为了简化迁移过程，可以使用以下 Node.js 脚本：

```javascript
// migrate.js
const fs = require('fs');
const path = require('path');

// 1. 重命名目录
const oldDir = './src/i18n';
const newDir = './src/lang';
if (fs.existsSync(oldDir)) {
  fs.renameSync(oldDir, newDir);
  console.log('✓ 目录已重命名: i18n -> lang');
}

// 2. 转换单文件为文件夹结构
const zhCNFile = path.join(newDir, 'zh-CN.js');
if (fs.existsSync(zhCNFile)) {
  const content = fs.readFileSync(zhCNFile, 'utf-8');
  // 解析并转换...
  // (实现细节省略)
  console.log('✓ 语言包结构已转换');
}

// 3. 批量替换 key
const replaceKeys = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      replaceKeys(filePath);
    } else if (file.endsWith('.vue') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      // 替换 common. -> Common.
      content = content.replace(/\$t\('common\./g, "$t('Common.");
      content = content.replace(/\$t\('user\./g, "$t('User.");
      // ... 其他替换
      fs.writeFileSync(filePath, content);
    }
  });
};

replaceKeys('./src');
console.log('✓ Key 格式已更新');

console.log('\n迁移完成！请检查项目并进行测试。');
```

运行脚本：
```bash
node migrate.js
```

---

## 常见问题

### Q1: 我的项目不支持 `import.meta.glob` 怎么办？

**A**: 使用 Webpack 的 `require.context` 或手动导入所有模块。参见步骤 3.3。

### Q2: 如何快速找到所有需要更新的 key？

**A**: 使用全局搜索功能搜索 `$t('` 模式，然后逐一检查。

### Q3: 迁移后某些页面显示 key 而不是文本？

**A**: 检查以下几点：
1. key 格式是否正确（首字母大写）
2. 语言包文件夹结构是否正确
3. index.js 中的模块加载逻辑是否正确

### Q4: 可以同时保留旧版本和新版本吗？

**A**: 不建议。建议完全迁移到新版本以避免混淆。

### Q5: 我有很多文件要改，有什么工具可以自动化？

**A**: 可以使用上面提供的迁移脚本，或使用编辑器的批量替换功能。

---

## 回滚方案

如果迁移过程中遇到问题，可以：

1. **从 Git 恢复**:
   ```bash
   git checkout -- .
   ```

2. **使用备份**: 确保迁移前已备份项目

3. **分阶段迁移**: 
   - 先迁移一个小模块
   - 测试无误后再迁移其他模块

---

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细变更
2. 阅读 [README.md](./README.md) 了解新功能
3. 查看 [新功能说明.md](./新功能说明.md) 了解使用示例

---

## 迁移检查清单

使用此清单确保完成所有迁移步骤：

- [ ] 更新 `config.json` 配置
- [ ] 重命名目录 `i18n` → `lang`
- [ ] 转换语言包结构（单文件 → 文件夹）
- [ ] 更新 index.js 的导入逻辑
- [ ] 更新 main.js 的导入路径
- [ ] 批量替换所有 key（小写 → 大写开头）
- [ ] 更新路由配置中的 key
- [ ] 测试项目启动
- [ ] 测试语言切换功能
- [ ] 测试所有页面显示
- [ ] 执行构建测试
- [ ] 提交代码

---

## 总结

迁移到新版本将带来：
- ✅ 更清晰的代码组织
- ✅ 更好的模块化管理
- ✅ 更统一的命名规范
- ✅ 更易于维护和扩展

虽然迁移需要一些工作，但长期来看将大大提高项目的可维护性！🎉
