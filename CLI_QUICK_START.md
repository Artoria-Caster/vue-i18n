# tricolor-vue2-i18n 快速开始指南

## 5分钟快速上手

### 1. 全局安装工具

```bash
npm install -g tricolor-vue2-i18n
```

### 2. 在项目中使用

```bash
# 进入你的Vue2项目目录
cd your-vue2-project

# 初始化i18n配置
tricolor-vue2-i18n init
# 选择是否使用Element UI: 根据项目需要选择 Yes/No

# 替换中文为i18n调用
tricolor-vue2-i18n replace

# 查看待处理任务
cat output/pending-tasks-*.md

# 填写翻译模板 (可选)
# 编辑 output/translation-template.txt 文件

# 生成英文语言包 (可选)
tricolor-vue2-i18n translate en-us

# 验证转换结果
tricolor-vue2-i18n verify
```

### 3. 集成到项目

```bash
# 安装vue-i18n
npm install vue-i18n

# 复制语言包到项目
cp -r output/lang src/
```

在`src/main.js`中添加：

```javascript
import Vue from 'vue'
import App from './App.vue'
import i18n from './lang'  // 导入i18n配置

new Vue({
  i18n,  // 注入i18n
  render: h => h(App)
}).$mount('#app')
```

### 4. 完成！

现在你的项目已经支持国际化了！

## 使用示例

### 切换语言

在任意组件中：

```javascript
// 切换到英文
this.$i18n.locale = 'en-US'

// 切换到中文
this.$i18n.locale = 'zh-CN'

// 保存到localStorage
localStorage.setItem('language', this.$i18n.locale)
```

### 在模板中使用

```vue
<template>
  <div>
    <!-- 简单文本 -->
    <h1>{{ $t('Common.title') }}</h1>
    
    <!-- 带变量的文本 -->
    <p>{{ $t('User.welcome', { name: userName }) }}</p>
    
    <!-- 在属性中使用 -->
    <el-button :title="$t('Common.submit')">
      {{ $t('Common.submit') }}
    </el-button>
  </div>
</template>
```

### 在JS中使用

```javascript
export default {
  methods: {
    showMessage() {
      // 在方法中使用
      this.$message(this.$t('Common.success'))
    }
  }
}
```

## 常用命令

| 命令 | 说明 | 示例 |
|-----|------|-----|
| `init` | 初始化并提取中文 | `tricolor-vue2-i18n init` |
| `replace` | 替换中文为i18n | `tricolor-vue2-i18n replace` |
| `translate` | 生成其他语言包 | `tricolor-vue2-i18n translate en-us` |
| `verify` | 验证转换结果 | `tricolor-vue2-i18n verify` |

## 目录结构

工具运行后会生成：

```
your-vue2-project/
├── output/                    # 工具输出目录
│   ├── lang/                 # 语言包(复制到src/)
│   ├── *.json               # 提取数据
│   └── *.md                 # 报告文件
├── backup/                   # 原文件备份
└── src/
    └── lang/                # 手动复制output/lang到这里
        ├── index.js
        ├── zh-cn/
        └── en-us/
```

## 注意事项

⚠️ **运行前建议**：
1. 提交当前代码到Git
2. 或者手动备份项目

✅ **工具会自动**：
1. 备份修改的文件到`backup/`目录
2. 生成详细的转换报告
3. 列出需要手动处理的特殊情况

## 下一步

- 查看完整文档：[CLI_README.md](./CLI_README.md)
- 了解配置选项
- 学习高级用法

## 需要帮助？

如遇到问题，查看：
1. `output/pending-tasks-*.md` - 待处理任务列表
2. `output/validation-report.md` - 验证报告
3. `output/logs/` - 详细日志

## 示例项目

查看 `examples/vue2-demo` 目录获取完整的示例项目。
