# 手动集成 i18n 配置指南

本指南说明如何将工具生成的 i18n 配置手动集成到你的 Vue 2 项目中。

## 概述

从版本更新后，工具不再直接在目标项目内部生成 i18n 配置文件，而是将所有文件输出到 `output` 目录。这样做的好处是：

- ✅ 不会意外修改目标项目的文件结构
- ✅ 可以先检查生成的文件再决定是否使用
- ✅ 更灵活的集成方式，可以根据项目需求调整
- ✅ 更安全，避免覆盖现有配置

## 生成的文件结构

运行 `npm run generate output/i18n-extracted-xxx.json` 后，会在 output 目录生成：

```
output/
├── i18n-extracted-xxx.json       # 提取的中文文本
├── zh-CN/                        # 语言包文件夹（仅供查看）
│   ├── common.js
│   ├── user.js
│   └── ...
├── translation-template.txt      # 翻译对照模板
└── lang/                         # i18n配置文件夹（需要复制到项目）
    ├── index.js                  # i18n初始化文件
    └── locales/
        └── zh-CN/                # 中文语言包
            ├── common.js
            ├── user.js
            └── ...
```

## 集成步骤

### 1. 复制 lang 文件夹到项目

将 `output/lang` 文件夹复制到你的 Vue 项目的 `src` 目录下：

**Windows (PowerShell/CMD):**
```bash
xcopy /E /I output\lang your-vue-project\src\lang
```

**Linux/Mac:**
```bash
cp -r output/lang your-vue-project/src/lang
```

复制后项目结构：
```
your-vue-project/
└── src/
    ├── main.js
    ├── App.vue
    └── lang/                     # 新增的i18n配置
        ├── index.js
        └── locales/
            └── zh-CN/
                ├── common.js
                ├── user.js
                └── ...
```

### 2. 安装 vue-i18n

如果项目还没有安装 vue-i18n，需要安装（Vue 2 需要使用 8.x 版本）：

```bash
cd your-vue-project
npm install vue-i18n@8
```

### 3. 在 main.js 中引入 i18n

修改你的 `main.js` 文件，引入 i18n 配置：

```javascript
import Vue from 'vue'
import App from './App.vue'
import i18n from './lang'  // 引入i18n配置

Vue.config.productionTip = false

new Vue({
  i18n,  // 将i18n实例注入到根Vue实例
  render: h => h(App)
}).$mount('#app')
```

### 4. 配置 webpack 别名（如果使用 @ 别名）

如果你的项目配置了路径别名（如 `@` 指向 `src`），确保 `vue.config.js` 或 webpack 配置正确：

**vue.config.js:**
```javascript
const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
}
```

### 5. 验证集成

启动项目，确保没有报错：

```bash
npm run serve
```

在浏览器控制台中，应该能看到 Vue 实例中包含 `$i18n` 对象。

## 使用 i18n

### 在模板中使用

```vue
<template>
  <div>
    <!-- 简单文本 -->
    <h1>{{ $t('Common.home') }}</h1>
    
    <!-- 带变量的文本 -->
    <p>{{ $t('User.welcome', { username: currentUser }) }}</p>
  </div>
</template>
```

### 在 JavaScript 中使用

```javascript
export default {
  data() {
    return {
      message: this.$t('Common.submit')
    }
  },
  methods: {
    showMessage() {
      alert(this.$t('Message.operationSuccess'))
    }
  }
}
```

## 添加更多语言

### 1. 生成翻译模板

工具已经生成了 `output/translation-template.txt`，将其发送给翻译人员填写。

### 2. 使用翻译模板生成其他语言

填写完翻译模板后，运行：

```bash
# 生成英文配置
npm run translate output en-US

# 生成日文配置
npm run translate output ja-JP
```

这会在 `output/lang/` 下生成对应的语言包文件夹。

### 3. 更新 index.js

修改 `src/lang/index.js`，添加其他语言：

```javascript
import Vue from 'vue';
import VueI18n from 'vue-i18n';

// 导入中文语言包
const zhCNContext = require.context('./zh-CN', false, /\.js$/);

// 导入英文语言包
const enUSContext = require.context('./en-US', false, /\.js$/);

// 合并中文模块
const zhCN = {};
zhCNContext.keys().forEach(key => {
  const moduleName = key.replace('./', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCN[capitalizedName] = zhCNContext(key).default;
});

// 合并英文模块
const enUS = {};
enUSContext.keys().forEach(key => {
  const moduleName = key.replace('./', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  enUS[capitalizedName] = enUSContext(key).default;
});

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

export default i18n;
```

### 4. 添加语言切换功能

```vue
<template>
  <div>
    <select v-model="$i18n.locale">
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  </div>
</template>
```

## 自定义配置

### 修改语言包结构

如果你需要不同的文件结构，可以手动调整 `output/lang` 中的文件：

1. 合并或拆分模块文件
2. 修改 `index.js` 中的导入逻辑
3. 调整 key 的组织方式

### 使用不同的 i18n 路径

如果你希望将 i18n 配置放在其他位置（如 `src/i18n`），只需：

1. 将 `output/lang` 复制到目标位置
2. 更新 `main.js` 中的 import 路径

## 常见问题

### Q1: 为什么不直接生成到项目中？

A: 为了安全和灵活性。将文件输出到 output 目录，你可以先检查和测试，确认无误后再集成到项目中。

### Q2: 可以修改生成的文件吗？

A: 可以！生成的文件只是模板，你可以根据项目需求自由修改。

### Q3: 如何更新语言包？

A: 重新运行提取和生成命令，然后手动合并新的语言包文件到项目中。

### Q4: require.context 是什么？

A: 这是 webpack 提供的功能，用于动态导入模块。如果你的项目不使用 webpack（如使用 Vite），需要调整导入方式。

### Q5: Vite 项目如何使用？

Vite 不支持 `require.context`，需要使用 `import.meta.glob`：

```javascript
// Vite 版本的 index.js
import Vue from 'vue';
import VueI18n from 'vue-i18n';

// 动态导入所有中文语言包
const zhCNModules = import.meta.glob('./zh-CN/*.js', { eager: true });

const zhCN = {};
Object.entries(zhCNModules).forEach(([path, module]) => {
  const moduleName = path.match(/\/([^/]+)\.js$/)[1];
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCN[capitalizedName] = module.default;
});

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN
  }
});

export default i18n;
```

## 总结

通过手动集成的方式，你可以：

- 完全控制 i18n 配置的位置和结构
- 在集成前检查和调整生成的文件
- 根据项目构建工具（webpack/Vite）调整导入方式
- 更灵活地管理多语言配置

如有其他问题，请参考 [README.md](../README.md) 或提交 Issue。
