# 使用示例

> **注意**: 本工具专为 Vue 2 项目设计，所有示例均基于 Vue 2 和 vue-i18n@8.x。

## 示例1：基础使用

### 步骤1：配置

```json
// config.json
{
  "targetProject": "./examples/example-project",
  "outputDir": "./output"
}
```

### 步骤2：提取

```bash
npm start
```

**输出**：
```
========================================
  Vue i18n 自动转换工具 - 提取模式
========================================

目标项目: ./examples/example-project
输出目录: ./output

步骤 1/3: 扫描文件...
✓ 扫描完成，找到 5 个文件

步骤 2/3: 提取中文文本...
  已处理: 5/5 个文件

  提取结果:
    - 普通文本: 45 条
    - 模板文本: 8 条
    - 总计: 53 条

步骤 3/3: 生成JSON文件...

✓ JSON文件已生成: i18n-extracted-2025-12-03_12-00-00.json
  - 普通文本: 45 条
  - 模板文本: 8 条
  - 总计: 53 条

========================================
提取完成！
输出文件: /path/to/output/i18n-extracted-2025-12-03_12-00-00.json
========================================
```

### 步骤3：查看结果

```json
{
  "metadata": {
    "extractedAt": "2025-12-03T12:00:00.000Z",
    "normalCount": 45,
    "templateCount": 8,
    "total": 53
  },
  "normal": {
    "src/views/Home.vue::template::line:3": "首页",
    "src/views/Home.vue::template::line:4": "欢迎使用Vue i18n自动转换工具",
    "src/views/Home.vue::template::line:7": "功能介绍",
    "src/views/User.vue::template::line:3": "用户管理"
  },
  "templates": {
    "src/views/User.vue::template::line:5": {
      "original": "用户名：{{username}}",
      "type": "__TEMPLATE__",
      "variables": ["username"]
    },
    "src/utils/message.js::file::line:27": {
      "original": "欢迎${name}登录",
      "type": "__TEMPLATE__",
      "variables": ["name"]
    }
  }
}
```

## 示例2：生成i18n配置

```bash
node src/index.js generate output/i18n-extracted-2025-12-03_12-00-00.json
```

**生成的文件**：

`examples/example-project/src/i18n/index.js`:
```javascript
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zhCN from './locales/zh-CN';

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

`examples/example-project/src/i18n/locales/zh-CN.js`:
```javascript
export default {
  "common": {
    "home": "首页",
    "submit": "提交",
    "cancel": "取消",
    "edit": "编辑",
    "delete": "删除",
    "save": "保存"
  },
  "user": {
    "userManagement": "用户管理",
    "username": "用户名",
    "welcomeMessage": "欢迎{username}登录"
  },
  "message": {
    "welcome": "欢迎使用Vue i18n自动转换工具",
    "operationSuccess": "操作成功",
    "totalRecords": "共{total}条记录"
  }
};
```

## 示例3：预览替换

```bash
node src/index.js replace output/i18n-extracted-2025-12-03_12-00-00.json --preview
```

**输出**：
```
========================================
  Vue i18n 自动转换工具 - 预览模式
========================================

读取提取的JSON文件...
生成key映射...
预览替换...

=== 预览模式 ===
  examples/example-project/src/views/Home.vue
  examples/example-project/src/views/User.vue
  examples/example-project/src/components/Button.vue
  examples/example-project/src/utils/message.js

========================================
预览完成！
========================================
```

## 示例4：实际替换

### 替换前的代码

`src/views/User.vue`:
```vue
<template>
  <div class="user">
    <h1>用户管理</h1>
    <div class="user-info">
      <p>用户名：{{username}}</p>
      <p>欢迎回来，{{username}}</p>
    </div>
    <button>编辑</button>
    <button>删除</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '张三'
    }
  },
  methods: {
    showAlert() {
      alert('操作成功');
    }
  }
}
</script>
```

### 执行替换

```bash
node src/index.js replace output/i18n-extracted-2025-12-03_12-00-00.json
```

### 替换后的代码

`src/views/User.vue`:
```vue
<template>
  <div class="user">
    <h1>{{ $t('user.userManagement') }}</h1>
    <div class="user-info">
      <p>{{ $t('user.username', { username }) }}</p>
      <p>{{ $t('user.welcomeBack', { username }) }}</p>
    </div>
    <button>{{ $t('common.edit') }}</button>
    <button>{{ $t('common.delete') }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '张三'
    }
  },
  methods: {
    showAlert() {
      alert(this.$t('message.operationSuccess'));
    }
  }
}
</script>
```

## 示例5：完整流程

```bash
# 一键完成所有步骤（需要在config.json中启用autoReplace）
node src/index.js full
```

**配置**：
```json
{
  "targetProject": "./examples/example-project",
  "autoReplace": {
    "enabled": true,
    "backup": true
  }
}
```

**输出**：
```
========================================
  Vue i18n 自动转换工具 - 完整流程
========================================

... (提取过程) ...
... (生成i18n配置) ...
... (执行替换) ...

========================================
完整流程执行完成！
========================================
```

## 示例6：自定义key映射

```json
// config.json
{
  "keyMappings": {
    "提交": "common.submit",
    "取消": "common.cancel",
    "确认": "common.confirm",
    "用户管理": "user.management"
  },
  "keyPrefixes": {
    "src/views/user/": "user.",
    "src/views/product/": "product.",
    "src/components/": "component."
  }
}
```

这样可以确保相同的文本使用相同的key，避免重复。

## 示例7：处理大型项目

对于大型项目，建议分批处理：

```json
// 第一批：只处理 views 目录
{
  "targetProject": "../large-project",
  "fileExtensions": [".vue"],
  "excludeDirs": ["node_modules", "dist", "components", "utils"]
}
```

```bash
npm start
```

处理完成后，再处理其他目录。

## 示例8：集成到Vue项目

### 1. 安装依赖

```bash
cd your-vue-project
npm install vue-i18n
```

### 2. 引入i18n（已自动生成）

`src/main.js`:
```javascript
import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'  // 工具自动生成的

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
```

### 3. 使用i18n

在组件中：
```vue
<template>
  <div>
    <!-- 直接使用 -->
    <h1>{{ $t('common.home') }}</h1>
    
    <!-- 带参数 -->
    <p>{{ $t('user.welcome', { username }) }}</p>
  </div>
</template>

<script>
export default {
  methods: {
    showMessage() {
      // 在JS中使用
      this.$message.success(this.$t('message.success'));
    }
  }
}
</script>
```

## 示例9：切换语言

如果生成了多语言包：

```javascript
// 切换到英文
this.$i18n.locale = 'en-US';

// 切换到中文
this.$i18n.locale = 'zh-CN';
```

## 示例10：手动处理模板字符串

对于复杂的模板字符串，可能需要手动调整：

**原始代码**：
```javascript
const msg = `用户${username}在${time}执行了${action}操作`;
```

**提取结果**：
```json
{
  "original": "用户${username}在${time}执行了${action}操作",
  "variables": ["username", "time", "action"]
}
```

**手动转换**：
```javascript
// 在语言包中定义
{
  "user": {
    "actionLog": "用户{username}在{time}执行了{action}操作"
  }
}

// 在代码中使用
const msg = this.$t('user.actionLog', { username, time, action });
```

## 更多示例

查看 `examples/` 目录获取更多实际示例。

## 故障排除示例

### 问题：提取不完整

**解决**：检查excludeDirs配置
```json
{
  "excludeDirs": ["node_modules", "dist"]  // 不要排除太多
}
```

### 问题：替换后语法错误

**解决**：使用预览模式，逐个文件检查
```bash
node src/index.js replace output/xxx.json --preview
```

### 问题：key冲突

**解决**：使用keyMappings预定义
```json
{
  "keyMappings": {
    "首页": "common.home",
    "用户首页": "user.home"
  }
}
```
