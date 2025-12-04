# 快速开始指南

本指南将帮助您快速上手 Vue2 i18n 自动转换工具。

## 前置要求

- Node.js >= 14.0.0
- 一个需要国际化的 Vue 2 项目

## 5分钟快速开始

### 第一步：安装依赖

```bash
cd i18n-tool
npm install
```

### 第二步：配置目标项目

编辑 `config.json`，修改 `targetProject` 为你的 Vue 2 项目路径：

```json
{
  "targetProject": "../your-vue-project"
}
```

### 第三步：提取中文文本

```bash
npm start
```

执行后会在 `output/` 目录生成JSON文件，包含所有提取的中文文本。

### 第四步：查看和修改提取结果

打开 `output/i18n-extracted-xxx.json`，检查提取的内容：

```json
{
  "metadata": {
    "total": 100
  },
  "normal": {
    "src/views/Home.vue::template::line:5": "首页"
  },
  "templates": {
    "src/views/User.vue::template::line:8": {
      "original": "欢迎{{username}}登录",
      "variables": ["username"]
    }
  }
}
```

**同时自动生成：**

1. **`output/zh-CN.js`** - 中文语言包文件
   ```javascript
   export default {
     common: {
       首页: "首页",
       用户管理: "用户管理"
     }
   }
   ```

2. **`output/translation-template.txt`** - 翻译对照模板文件
   ```
   # 翻译对照模板
   # 格式说明：
   # 每行格式为：中文文本 = 翻译文本
   # 请在等号后面填写对应的翻译内容
   
   首页 = 
   用户管理 = 
   欢迎{username}登录 = 
   ```

**使用翻译对照模板：**
- 将 `translation-template.txt` 发送给翻译人员
- 翻译人员在等号后填写对应的翻译内容
- 例如：`首页 = Home`
- 支持变量占位符，如：`欢迎{username}登录 = Welcome {username}`

**修改JSON后重新生成文件：**

如果你修改了提取的JSON文件（如调整key、添加/删除条目），可以重新生成语言包和翻译模板：

```bash
# 方式1：使用npm脚本
npm run regenerate output/i18n-extracted-xxx.json

# 方式2：直接使用node命令
node src/index.js regenerate output/i18n-extracted-xxx.json
```

这会根据修改后的JSON重新生成 `zh-CN.js` 和 `translation-template.txt` 文件。

### 第五步：生成其他语言配置（可选）

如果需要支持多语言（如英语、日语等），可以使用翻译生成功能：

**1. 填写翻译模板**

打开 `output/translation-template.txt`，在等号后填写翻译内容：

```
首页 = Home
用户管理 = User Management
欢迎{username}登录 = Welcome {username}
退出登录 = Logout
```

**2. 生成目标语言配置文件**

```bash
# 生成英语配置
npm run translate output en-US

# 生成日语配置
npm run translate output ja-JP

# 生成韩语配置
npm run translate output ko-KR
```

这会在 `output/` 目录生成对应的语言包文件（如 `en-US.js`）。

> 详细文档请参考 [翻译生成指南](./docs/TRANSLATE_GUIDE.md)

### 第六步：生成i18n配置（可选）

```bash
node src/index.js generate output/i18n-extracted-xxx.json
```

这会在你的 Vue 2 项目中创建：
- `src/i18n/index.js` - i18n初始化文件（使用 vue-i18n@8.x）
- `src/i18n/locales/zh-CN.js` - 中文语言包

### 第七步：手动集成i18n

在你的 `main.js` 中引入i18n：

```javascript
import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
```

安装vue-i18n（如果还没安装）：

```bash
cd your-vue-project
npm install vue-i18n
```

### 第八步：手动替换或自动替换

#### 选项A：手动替换（推荐用于生产环境）

根据JSON文件手动将中文替换为i18n调用：

```vue
<!-- 替换前 -->
<h1>首页</h1>

<!-- 替换后 -->
<h1>{{ $t('common.home') }}</h1>
```

#### 选项B：自动替换（谨慎使用）

```bash
# 先预览
node src/index.js replace output/i18n-extracted-xxx.json --preview

# 确认无误后执行替换（会自动备份）
node src/index.js replace output/i18n-extracted-xxx.json
```

## 完整流程（一键执行）

如果想一次性完成所有步骤：

```bash
node src/index.js full
```

⚠️ **注意**：使用完整流程前，请确保：
1. 项目已提交到git
2. 在配置中启用了 `autoReplace.enabled`
3. 先在测试项目上验证

## 测试示例项目

我们提供了一个示例项目供测试：

```bash
# 修改配置指向示例项目
# config.json 中设置：
# "targetProject": "./examples/example-project"

# 运行提取
npm start

# 查看输出
ls output/
```

## 常见使用场景

### 场景1：大型项目首次引入i18n

```bash
# 1. 提取所有中文
npm start

# 2. 修改JSON（可选）
# 编辑 output/i18n-extracted-xxx.json

# 3. 如果修改了JSON，重新生成语言包
npm run regenerate output/i18n-extracted-xxx.json

# 4. 生成i18n配置
node src/index.js generate output/i18n-extracted-xxx.json

# 5. 分批手动替换（安全）
# 根据JSON文件逐文件替换
```

### 场景2：调整提取结果

```bash
# 1. 提取中文
npm start

# 2. 手动修改JSON文件
# - 调整key名称
# - 删除不需要的条目
# - 合并重复项

# 3. 重新生成语言包和翻译模板
npm run regenerate output/i18n-extracted-xxx.json

# 4. 继续后续步骤
```

### 场景3：增量更新

```bash
# 只处理新增的文件，配置excludeDirs排除已处理的目录
```

### 场景4：快速原型

```bash
# 使用完整流程
node src/index.js full
```

## 下一步

- 阅读完整 [README.md](README.md) 了解详细功能
- 查看 [功能文档.md](功能文档.md) 了解技术细节
- 在测试项目上验证工具效果
- 根据实际需求调整 `config.json` 配置

## 获取帮助

```bash
node src/index.js --help
```

## 故障排除

### 问题1：提取不到文本

- 检查 `targetProject` 路径是否正确
- 检查文件是否被 `excludeDirs` 排除

### 问题2：依赖安装失败

```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题3：替换后项目报错

- 检查是否正确安装了 vue-i18n
- 检查 main.js 是否正确引入了i18n
- 查看备份目录恢复原文件

## 最佳实践

1. ✅ 先在分支上测试
2. ✅ 使用预览模式验证
3. ✅ 保持良好的git提交习惯
4. ✅ 手动审核模板字符串
5. ❌ 不要在生产环境直接运行

祝使用愉快！🎉
