# Vue i18n 自动转换工具

一个帮助大型Vue项目快速引入i18n国际化支持的自动化工具。通过AST语法树解析，自动提取项目中的中文文本，生成i18n配置文件，并支持自动替换源代码。

## 功能特性

- ✅ **智能提取**: 自动识别Vue和JS/TS文件中的中文文本
- ✅ **模板字符串支持**: 自动识别并标记包含变量的模板字符串
- ✅ **分类输出**: 区分普通文本和模板文本，便于处理
- ✅ **i18n配置生成**: 自动生成语言包和初始化文件
- ✅ **智能Key生成**: 支持语义化和hash两种key生成策略
- ✅ **自动替换**: 可选的自动替换功能，将中文转换为i18n调用
- ✅ **安全备份**: 替换前自动备份，支持预览模式

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
    "i18nPath": "./src/i18n",           // i18n配置目录
    "importPath": "@/i18n",             // 导入路径
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

这将在目标项目中生成i18n配置文件：

```
target-project/
└── src/
    └── i18n/
        ├── index.js           # i18n初始化文件
        └── locales/
            └── zh-CN.js       # 中文语言包
```

**生成的语言包示例** (`src/i18n/locales/zh-CN.js`):

```javascript
export default {
  "common": {
    "submit": "提交",
    "cancel": "取消",
    "home": "首页"
  },
  "user": {
    "welcome": "欢迎{username}登录",
    "userManagement": "用户管理"
  }
};
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
    <h1>{{ $t('user.userManagement') }}</h1>
    <button>{{ $t('common.submit') }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: this.$t('message.operationSuccess')
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

# 完整流程
node src/index.js full

# 查看帮助
node src/index.js --help
```

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
| `i18nPath` | i18n配置目录 | `./src/i18n` |
| `importPath` | 导入路径别名 | `@/i18n` |
| `keyStrategy` | key生成策略 | `semantic` |

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

## 技术栈

- **Node.js**: 运行环境
- **@vue/compiler-sfc**: Vue单文件组件解析
- **@babel/parser**: JavaScript/TypeScript解析
- **@babel/traverse**: AST遍历
- **commander**: 命令行接口

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0 (2025-12-03)
- 初始版本发布
- 支持Vue文件和JS/TS文件的中文提取
- 支持模板字符串识别
- 支持自动生成i18n配置
- 支持自动替换源代码

## 联系方式

如有问题或建议，请提交Issue或发送邮件至：your-email@example.com
