# 项目结构说明

```
i18n-tool/                           # 项目根目录
│
├── src/                             # 源代码目录
│   ├── index.js                     # 主入口文件，CLI接口
│   │
│   ├── scanner/                     # 文件扫描模块
│   │   └── index.js                 # 递归扫描目录，过滤文件
│   │
│   ├── parser/                      # 解析器模块
│   │   ├── index.js                 # 统一解析器接口
│   │   ├── vueParser.js            # Vue单文件组件解析器
│   │   └── jsParser.js             # JavaScript/TypeScript解析器
│   │
│   ├── extractor/                   # 提取器模块
│   │   └── index.js                 # 中文文本提取逻辑
│   │
│   ├── generator/                   # 生成器模块
│   │   ├── index.js                 # JSON文件生成器
│   │   └── i18nGenerator.js        # i18n配置生成器
│   │
│   └── replacer/                    # 替换器模块
│       └── index.js                 # 自动替换中文为i18n调用
│
├── examples/                        # 示例项目
│   ├── README.md                    # 示例说明
│   └── example-project/             # 示例Vue项目
│       ├── src/
│       │   ├── views/              # 视图组件
│       │   │   ├── Home.vue
│       │   │   └── User.vue
│       │   ├── components/         # 通用组件
│       │   │   └── Button.vue
│       │   └── utils/              # 工具函数
│       │       └── message.js
│       └── package.json
│
├── output/                          # 输出目录（运行时生成）
│   └── i18n-extracted-*.json       # 提取的中文文本JSON文件
│
├── backup/                          # 备份目录（替换时生成）
│   └── backup-*/                   # 带时间戳的备份
│
├── config.json                      # 配置文件
├── package.json                     # 项目依赖配置
├── .gitignore                       # Git忽略文件配置
├── README.md                        # 完整使用文档
├── QUICK_START.md                   # 快速开始指南
├── 功能文档.md                      # 功能设计文档
└── 需求.md                          # 原始需求文档
```

## 核心模块说明

### 1. Scanner（扫描器）
- **职责**: 遍历目标项目，找出需要处理的文件
- **主要功能**:
  - 递归扫描目录
  - 根据配置过滤文件类型
  - 排除指定目录和文件
  - 读取文件内容

### 2. Parser（解析器）
- **职责**: 解析不同类型的文件，生成AST
- **主要功能**:
  - VueParser: 解析.vue文件的template和script
  - JsParser: 解析.js/.ts文件，提取字符串节点
  - 支持模板字符串和普通字符串

### 3. Extractor（提取器）
- **职责**: 从AST中提取中文文本
- **主要功能**:
  - 识别中文字符串
  - 区分普通文本和模板文本
  - 记录文件路径、行号等元信息
  - 生成唯一的key标识

### 4. Generator（生成器）
- **职责**: 生成JSON和i18n配置文件
- **主要功能**:
  - 格式化提取结果为JSON
  - 生成i18n语言包文件
  - 生成i18n初始化代码
  - 智能生成key值

### 5. Replacer（替换器）
- **职责**: 自动替换源代码中的中文
- **主要功能**:
  - 基于AST的精确替换
  - 处理Vue template和script
  - 处理JS/TS文件
  - 自动添加import语句
  - 备份原文件

## 数据流

```
目标Vue项目
    ↓
[Scanner] 扫描文件
    ↓
文件列表
    ↓
[Parser] 解析文件 → AST
    ↓
[Extractor] 提取中文
    ↓
提取结果 { normal, templates }
    ↓
[Generator] 生成JSON
    ↓
i18n-extracted-xxx.json
    ↓
[I18nGenerator] 生成i18n配置
    ↓
lang/zh-CN/*.js + lang/index.js
    ↓
[Replacer] 替换源代码（可选）
    ↓
更新后的Vue项目
```

## 配置文件结构

### config.json
```json
{
  "targetProject": "目标项目路径",
  "outputDir": "输出目录",
  "fileExtensions": "要扫描的文件类型",
  "excludeDirs": "排除的目录",
  "excludeFiles": "排除的文件",
  "autoReplace": {
    "enabled": "是否自动替换",
    "backup": "是否备份",
    "i18nPath": "i18n配置路径",
    "keyStrategy": "key生成策略"
  },
  "keyMappings": "预定义的key映射",
  "keyPrefixes": "基于路径的key前缀"
}
```

## 输出文件结构

### JSON输出
```json
{
  "metadata": {
    "extractedAt": "提取时间",
    "normalCount": "普通文本数量",
    "templateCount": "模板文本数量",
    "total": "总数"
  },
  "normal": {
    "文件路径::区域::行号": "中文文本"
  },
  "templates": {
    "文件路径::区域::行号": {
      "original": "原始模板字符串",
      "type": "__TEMPLATE__",
      "variables": ["变量列表"]
    }
  }
}
```

### i18n配置输出
```
target-project/src/i18n/
├── index.js              # i18n初始化
└── locales/
    └── zh-CN.js          # 中文语言包
```

## 扩展指南

### 添加新的文件类型支持
1. 在 `parser/` 中创建新的解析器
2. 在 `parser/index.js` 中注册新类型
3. 更新 `config.json` 的 `fileExtensions`

### 自定义key生成策略
修改 `generator/i18nGenerator.js` 中的 `generateKey` 方法

### 添加新的替换规则
修改 `replacer/index.js` 中的替换逻辑

## 技术栈

- **Node.js**: 运行环境
- **vue-template-compiler**: Vue 2 单文件组件编译器
- **@babel/parser**: JavaScript解析器
- **@babel/traverse**: AST遍历
- **@babel/generator**: 代码生成
- **glob**: 文件匹配
- **commander**: CLI框架

## 开发建议

1. **模块化**: 每个模块职责单一，便于维护
2. **可配置**: 通过config.json控制行为
3. **错误处理**: 每个模块都有完善的错误处理
4. **日志输出**: 及时反馈处理进度
5. **测试先行**: 在示例项目上验证功能

## 性能优化建议

- 大型项目可分批处理
- 使用流式处理避免内存溢出
- 缓存解析结果
- 并行处理多个文件
