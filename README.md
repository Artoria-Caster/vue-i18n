# tricolor-vue2-i18n

一个帮助大型 Vue2 项目快速引入i18n国际化支持的自动化命令行工具。通过AST语法树解析，自动提取项目中的中文文本，生成i18n配置文件，并支持自动替换源代码。

> **注意**: 本工具专为 Vue2 项目设计，使用 vue-i18n@8.x 版本。

## 🚀 快速使用 (CLI命令行工具)

### 全局安装

```bash
npm install -g tricolor-vue2-i18n
```

### 在项目中使用

```bash
# 进入你的Vue2项目目录
cd your-vue2-project

# 1. 初始化（提取中文并生成语言包）
tricolor-vue2-i18n init

# 2. 替换中文为i18n调用
tricolor-vue2-i18n replace

# 3. 生成英文语言包（可选）
tricolor-vue2-i18n translate en-us

# 4. 验证转换结果
tricolor-vue2-i18n verify
```

### CLI文档

- 📖 [CLI完整文档](./CLI_README.md)
- 🚀 [CLI快速开始](./CLI_QUICK_START.md)

## 📚 原始工具文档导航

- **快速开始**: [QUICK_START.md](./QUICK_START.md) - 5分钟快速上手指南
- **手动集成指南**: [docs/MANUAL_INTEGRATION.md](./docs/MANUAL_INTEGRATION.md) - 如何手动将生成的配置集成到项目中
- **变更日志**: [CHANGELOG.md](./CHANGELOG.md) - 查看最新更新和修复
- **详细文档**: [docs/](./docs/) - 更多技术文档
  - [项目结构说明](./docs/PROJECT_STRUCTURE.md)
  - [使用示例](./docs/EXAMPLES.md)
  - [过滤功能示例](./docs/FILTER_EXAMPLES.md)
  - [翻译生成指南](./docs/TRANSLATE_GUIDE.md) - 多语言配置生成
  - [翻译示例](./docs/TRANSLATION_EXAMPLES.md) - 翻译模板填写示例

## 功能特性

- ✅ **智能提取**: 自动识别Vue和JS/TS文件中的中文文本
- ✅ **智能过滤**: 自动过滤console.log打印和代码注释中的中文，避免不必要的转换
- ✅ **模板字符串支持**: 自动识别并标记包含变量的模板字符串
- ✅ **分类输出**: 区分普通文本和模板文本，便于处理
- ✅ **i18n配置生成**: 自动生成语言包和初始化文件
- ✅ **智能Key生成**: 支持语义化和hash两种key生成策略
- ✅ **自动替换**: 可选的自动替换功能，将中文转换为i18n调用
- ✅ **安全备份**: 替换前自动备份，支持预览模式
- ✅ **待处理任务记录**: 自动生成转换失败和跳过项的详细记录，方便手动处理

## 项目结构

```
i18n-tool/
├── src/
│   ├── index.js              # 主入口文件
│   ├── scanner/              # 文件扫描模块
│   │   └── index.js
│   ├── parser/               # 解析器模块
│   │   ├── index.js          # 统一接口
│   │   ├── vueParser.js      # Vue文件解析器
│   │   └── jsParser.js       # JS/TS解析器
│   ├── extractor/            # 提取器模块
│   │   └── index.js
│   ├── generator/            # 生成器模块
│   │   ├── index.js          # JSON生成器
│   │   └── i18nGenerator.js  # i18n配置生成器
│   └── replacer/             # 替换器模块
│       └── index.js
├── config.json               # 配置文件
├── output/                   # 输出目录
├── backup/                   # 备份目录
├── package.json
└── README.md
```

## 安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd i18n-tool
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置项目

编辑 `config.json` 文件：

```json
{
  "targetProject": "../target-project",  // 待转换的Vue项目路径
  "outputDir": "./output",               // JSON输出目录
  "fileExtensions": [".vue", ".js", ".ts"],  // 扫描的文件类型
  "excludeDirs": [                       // 排除的目录
    "node_modules",
    "dist",
    ".git"
  ],
  "excludeFiles": [                      // 排除的文件
    "*.min.js",
    "*.test.js"
  ],
  "autoReplace": {
    "enabled": false,                    // 是否启用自动替换
    "backup": true,                      // 是否备份
    "i18nPath": "./src/lang",           // 语言包配置目录
    "importPath": "@/lang",             // 导入路径
    "keyStrategy": "semantic"            // key生成策略: semantic/hash
  }
}
```

## 使用方法

### 方式一：分步执行

#### 1. 提取中文文本

```bash
npm start
# 或
npm run extract
```

这将扫描目标项目，提取所有中文文本，并生成JSON文件到 `output/` 目录。

**输出示例** (`output/i18n-extracted-2025-12-03_12-00-00.json`):

```json
{
  "metadata": {
    "extractedAt": "2025-12-03T12:00:00.000Z",
    "normalCount": 150,
    "templateCount": 25,
    "total": 175
  },
  "normal": {
    "src/views/Home.vue::template::line:5": "首页",
    "src/views/Home.vue::template::line:12": "欢迎使用",
    "src/utils/message.js::file::line:8": "操作成功"
  },
  "templates": {
    "src/views/User.vue::template::line:15": {
      "original": "欢迎{{username}}登录",
      "type": "__TEMPLATE__",
      "variables": ["username"]
    }
  }
}
```

#### 2. 生成i18n配置文件

```bash
npm run generate output/i18n-extracted-xxx.json
```

这将在output目录中生成语言包配置文件：

```
output/
├── i18n-extracted-xxx.json
├── zh-cn/                 # 中文语言包文件夹
│   ├── common.js          # 公共模块
│   ├── user.js            # 用户模块
│   └── order.js           # 订单模块
├── translation-template.txt
└── lang/                  # i18n配置文件夹（新）
    ├── index.js           # i18n初始化文件
    └── zh-cn/             # 中文语言包（与上面的zh-cn相同）
        ├── common.js
        ├── user.js
        └── order.js
```

**生成的语言包示例** (`output/lang/zh-cn/common.js`):

```javascript
export default {
  "submit": "提交",
  "cancel": "取消",
  "home": "首页"
};
```

**用户模块示例** (`output/lang/zh-cn/user.js`):

```javascript
export default {
  "welcome": "欢迎{username}登录",
  "userManagement": "用户管理"
};
```

**i18n初始化文件** (`output/lang/index.js`):

```javascript
import Vue from 'vue';
import VueI18n from 'vue-i18n';

// 使用 require.context 动态导入语言包模块
const zhCNContext = require.context('./zh-cn', false, /\.js$/);

// 合并模块
const zhCN = {};
zhCNContext.keys().forEach(key => {
  const moduleName = key.replace('./', '').replace('.js', '');
  const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  zhCN[capitalizedName] = zhCNContext(key).default;
});

Vue.use(VueI18n);

const lang = new VueI18n({
  locale: 'zh-cn',
  fallbackLocale: 'zh-cn',
  messages: {
    'zh-cn': zhCN
  }
});

export default lang;
```

#### 2.1 手动集成到项目

将生成的 `output/lang` 文件夹复制到你的Vue项目中（通常是 `src/lang`），然后在 `main.js` 中引入：

```javascript
import Vue from 'vue'
import App from './App.vue'
import lang from './lang'  // 引入lang配置

new Vue({
  lang,
  render: h => h(App)
}).$mount('#app')
```

确保已安装 vue-i18n（Vue 2需要8.x版本）：

```bash
npm install vue-i18n@8
```

#### 3. 替换源代码（可选）

```bash
# 预览模式（不实际修改文件）
npm run replace output/i18n-extracted-xxx.json -- --preview

# 执行替换
npm run replace output/i18n-extracted-xxx.json
```

替换效果示例：

**替换前**:
```vue
<template>
  <div>
    <h1>用户管理</h1>
    <button>提交</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '操作成功'
    }
  }
}
</script>
```

**替换后**:
```vue
<template>
  <div>
    <h1>{{ $t('User.userManagement') }}</h1>
    <button>{{ $t('Common.submit') }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: this.$t('Message.operationSuccess')
    }
  }
}
</script>
```

### 方式二：完整流程

执行完整的提取 -> 生成 -> 替换流程：

```bash
node src/index.js full
```

## 命令行接口

```bash
# 提取中文文本
node src/index.js extract

# 生成i18n配置
node src/index.js generate <jsonFile>

# 替换源代码
node src/index.js replace <jsonFile> [--preview]

# 重新生成语言包和翻译模板
node src/index.js regenerate <jsonFile>

# 根据翻译模板生成其他语言配置文件
node src/index.js translate [outputDir] [targetLang]

# 完整流程
node src/index.js full

# 验证转换结果
node src/index.js validate

# 查看帮助
node src/index.js --help
```

### npm 脚本

```bash
npm run extract      # 提取中文文本
npm run generate     # 生成i18n配置
npm run replace      # 替换源代码
npm run regenerate   # 重新生成语言包
npm run translate    # 生成其他语言配置（默认en-US）
npm run verify       # 验证项目文件
```

## 多语言支持

### 生成其他语言配置

工具支持根据中文语言包和翻译对照模板生成其他语言的配置文件。详细文档请参考 [翻译生成指南](./docs/TRANSLATE_GUIDE.md)。

**快速使用**：

1. 运行 `npm run regenerate` 生成 `zh-cn.js` 和 `translation-template.txt`
2. 编辑 `translation-template.txt`，填写翻译内容
3. 运行 `npm run translate output en-us` 生成英语配置文件

支持的语言代码示例：
- `en-us` - 英语（美国）
- `ja-jp` - 日语（日本）
- `ko-kr` - 韩语（韩国）
- `fr-fr` - 法语（法国）
- 等其他标准语言代码

## 配置说明

### 基础配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `targetProject` | 目标Vue项目路径 | `../target-project` |
| `outputDir` | JSON输出目录 | `./output` |
| `fileExtensions` | 扫描的文件类型 | `[".vue", ".js", ".ts"]` |
| `excludeDirs` | 排除的目录 | `["node_modules", "dist", ".git"]` |
| `excludeFiles` | 排除的文件模式 | `["*.min.js", "*.test.js"]` |

### 自动替换配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `enabled` | 是否启用自动替换 | `false` |
| `backup` | 是否备份原文件 | `true` |
| `backupDir` | 备份目录 | `./backup` |
| `preview` | 预览模式 | `false` |
| `importPath` | 导入路径别名（用于替换时的import语句） | `@/lang` |
| `keyStrategy` | key生成策略 | `semantic` |

**注意**: `i18nPath` 配置已移除，所有输出统一到 `output/lang` 目录，需要手动复制到项目中。

### Key映射配置

可以为常用文本预定义key：

```json
{
  "keyMappings": {
    "提交": "common.submit",
    "取消": "common.cancel",
    "确认": "common.confirm"
  },
  "keyPrefixes": {
    "src/views/user/": "user.",
    "src/views/admin/": "admin.",
    "src/components/common/": "common."
  }
}
```

## 处理模板字符串

工具会自动识别并标记模板字符串，需要手动审核：

**JavaScript模板字符串**:
```javascript
// 原始
const msg = `欢迎${username}登录`;

// 提取结果
{
  "original": "欢迎${username}登录",
  "type": "__TEMPLATE__",
  "variables": ["username"]
}

// 转换后
const msg = this.$t('welcome', { username });
```

**Vue插值表达式**:
```vue
<!-- 原始 -->
<p>共{{total}}条记录</p>

<!-- 提取结果 -->
{
  "original": "共{{total}}条记录",
  "type": "__TEMPLATE__",
  "variables": ["total"]
}

<!-- 转换后 -->
<p>{{ $t('totalRecords', { total }) }}</p>
```

## 注意事项

1. **备份数据**: 在执行替换前，请确保项目已提交到版本控制系统
2. **模板审核**: 模板字符串需要人工审核，确保变量名正确
3. **导入路径**: 根据项目配置调整 `importPath`
4. **注释处理**: 默认会提取注释中的中文，可根据需要过滤
5. **测试充分**: 替换后请充分测试项目功能

## 特殊情况处理

### 排除特定内容

在代码中添加注释标记来排除特定内容：

```javascript
// i18n-ignore
const text = '这段文字不会被提取';
```

### 动态文本

对于动态拼接的文本，建议手动重构：

```javascript
// 不推荐
const msg = '用户' + name + '已登录';

// 推荐
const msg = this.$t('userLoggedIn', { name });
```

## 示例项目

在 `examples/` 目录下提供了示例项目，演示了完整的使用流程。

## 常见问题

### Q: 提取不到某些文本？
A: 检查文件是否在 `excludeDirs` 或 `excludeFiles` 中被排除。

### Q: Key重复怎么办？
A: 工具会自动在重复key后添加数字后缀，或者使用 `keyMappings` 手动指定。

### Q: 如何处理多语言？
A: 修改配置中的 `generateEnglish` 为 `true`，然后手动翻译 `en-US.js`。

### Q: 替换后出现错误？
A: 使用 `--preview` 参数预览，检查语法是否正确。确保有备份。

## 前置要求

- Node.js >= 14.0.0
- Vue 2.x 项目
- npm 或 yarn

## 技术栈

- **Node.js**: 运行环境
- **vue-template-compiler**: Vue 2 单文件组件解析
- **@babel/parser**: JavaScript/TypeScript解析
- **@babel/traverse**: AST遍历
- **commander**: 命令行接口

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 更新日志

查看完整的更新日志：[CHANGELOG.md](./CHANGELOG.md)

### 最新版本亮点 (2025-12-04)

- ✅ **待处理任务记录**: 自动生成转换失败和跳过项的详细记录文件（Markdown + JSON）
- ✅ **详细日志记录**: 记录所有提取和替换操作，生成详细报告
- ✅ **转换后验证**: 自动检查是否有遗漏的中文，生成验证报告
- ✅ **混合内容处理**: 增强对混合文本和标签的处理能力
- ✅ **循环引用修复**: 修复语言包文件被错误替换导致循环引用的问题
- ✅ **Vue2完全兼容**: 使用 vue-template-compiler 完整支持 Vue 2

### 📝 待处理任务记录功能

当运行完整流程时，工具会自动生成待处理任务记录文件，包含所有转换失败和跳过处理的文本：

```bash
node src/index.js full
```

生成的文件：
- `output/pending-tasks-{timestamp}.md` - Markdown格式，便于阅读和标记处理状态
- `output/pending-tasks-{timestamp}.json` - JSON格式，便于程序化处理

**查看待处理任务**:
```bash
# 查看Markdown文件（推荐）
code output/pending-tasks-*.md

# 或使用cat命令
cat output/pending-tasks-*.md
```

详细使用说明请查看：[docs/PENDING_TASKS.md](./docs/PENDING_TASKS.md)

## 联系方式

如有问题或建议，请提交Issue。

