# 翻译生成功能使用文档

## 功能说明

该功能用于根据`zh-CN.js`（中文语言包）和填写好的`translation-template.txt`（翻译对照模板）生成其他语言的i18n配置文件。

## 前置步骤

1. 首先运行提取和重新生成命令，生成`zh-CN.js`和`translation-template.txt`：

```bash
npm run regenerate output/i18n-extracted-xxx.json
```

这会在`output`目录下生成：
- `zh-CN.js` - 中文语言包
- `translation-template.txt` - 翻译对照模板

2. 打开`translation-template.txt`，填写翻译内容：

```
# 翻译对照模板

# 格式说明：
# 每行格式为：中文文本 = 翻译文本
# 请在等号后面填写对应的翻译内容
# 支持变量占位符 {变量名}

# ==========================================

操作 = Action
取消 = Cancel
确定 = OK
删除 = Delete
...
```

## 使用方法

### 方法1: 使用npm命令（推荐）

生成默认的`en-US.js`：
```bash
npm run translate
```

生成指定语言的配置文件：
```bash
npm run translate output en-US    # 生成英语配置
npm run translate output ja-JP    # 生成日语配置
npm run translate output ko-KR    # 生成韩语配置
npm run translate output fr-FR    # 生成法语配置
```

### 方法2: 使用node命令

```bash
node src/index.js translate [输出目录] [目标语言]
```

参数说明：
- `输出目录`（可选）：包含`zh-CN.js`和`translation-template.txt`的目录，默认为`./output`
- `目标语言`（可选）：目标语言代码，默认为`en-US`

示例：
```bash
# 使用默认参数（./output目录，en-US语言）
node src/index.js translate

# 指定输出目录
node src/index.js translate output

# 指定输出目录和目标语言
node src/index.js translate output ja-JP
```

## 输出结果

运行成功后，会在指定目录生成对应语言的配置文件，例如：
- `en-US.js` - 英语配置文件
- `ja-JP.js` - 日语配置文件
- `ko-KR.js` - 韩语配置文件

生成的文件格式与`zh-CN.js`相同，可以直接在项目中使用。

## 翻译统计

命令执行过程中会显示翻译统计信息：
```
开始生成en-US语言包...
1. 读取zh-CN.js文件...
   ✓ 成功读取中文语言包
2. 读取翻译模板...
   ✓ 成功读取 37 条翻译
3. 执行翻译...
   ✓ 已翻译: 37 条
   ✓ 未翻译: 296 条
   ✓ 翻译率: 11%
4. 生成语言包文件...
   ✓ 已生成: output\en-US.js
```

## 常见语言代码

- `en-US` - 英语（美国）
- `en-GB` - 英语（英国）
- `zh-TW` - 繁体中文（台湾）
- `zh-HK` - 繁体中文（香港）
- `ja-JP` - 日语（日本）
- `ko-KR` - 韩语（韩国）
- `fr-FR` - 法语（法国）
- `de-DE` - 德语（德国）
- `es-ES` - 西班牙语（西班牙）
- `it-IT` - 意大利语（意大利）
- `ru-RU` - 俄语（俄罗斯）
- `pt-BR` - 葡萄牙语（巴西）
- `ar-SA` - 阿拉伯语（沙特阿拉伯）
- `th-TH` - 泰语（泰国）
- `vi-VN` - 越南语（越南）

## 注意事项

1. 确保`translation-template.txt`中已填写翻译内容，未填写的项将保持原中文
2. 支持变量占位符，如`{username}`、`{count}`等，翻译时请保留
3. 生成的配置文件格式与`zh-CN.js`完全一致，可直接使用
4. 翻译率低于100%时，未翻译的文本将保持原中文显示

## 完整工作流程

1. 提取中文文本：`npm run extract`
2. 重新生成语言包：`npm run regenerate output/i18n-extracted-xxx.json`
3. 填写翻译模板：编辑`output/translation-template.txt`
4. 生成其他语言：`npm run translate output en-US`
5. 使用生成的配置文件在项目中进行国际化

## 示例：生成英语配置

```bash
# 1. 重新生成zh-CN.js和翻译模板
npm run regenerate output/i18n-extracted-2025-12-04_08-34-12.json

# 2. 编辑 output/translation-template.txt，填写英文翻译
# 例如：
# 用户名 = Username
# 密码 = Password
# 登录 = Login

# 3. 生成英语配置文件
npm run translate output en-US

# 4. 生成的 output/en-US.js 可以直接使用
```
