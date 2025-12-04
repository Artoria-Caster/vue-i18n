# 过滤功能示例

## 示例代码

### 输入代码

```javascript
// 这是一个注释，包含中文
const message = '这个会被提取';

/* 
 * 多行注释
 * 也包含中文
 */
function test() {
  console.log('这个不会被提取'); // console 调用
  console.warn('警告信息也不会被提取');
  
  alert('这个会被提取'); // 普通函数调用
  
  return '成功'; // 这个会被提取
}
```

### 提取结果

```json
{
  "normal": {
    "example.js::file::line:2": "这个会被提取",
    "example.js::file::line:12": "这个会被提取",
    "example.js::file::line:14": "成功"
  }
}
```

### 说明

- ✅ 普通字符串 `'这个会被提取'` - **被提取**
- ❌ console.log 中的 `'这个不会被提取'` - **被过滤**
- ❌ console.warn 中的 `'警告信息也不会被提取'` - **被过滤**
- ✅ alert 中的 `'这个会被提取'` - **被提取**
- ✅ return 语句中的 `'成功'` - **被提取**
- ❌ 注释中的中文 - **被过滤**

## Vue 文件示例

### 输入代码

```vue
<template>
  <div>
    <!-- 这是注释，不会被提取 -->
    <h1>标题文本</h1>  <!-- 会被提取 -->
    <button>提交</button>  <!-- 会被提取 -->
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      // 点击处理函数
      console.log('调试信息'); // 不会被提取
      this.$message.success('操作成功'); // 会被提取
    }
  }
}
</script>
```

### 提取结果

```json
{
  "normal": {
    "Example.vue::template::line:4": "标题文本",
    "Example.vue::template::line:5": "提交",
    "Example.vue::script::line:16": "操作成功"
  }
}
```

### 说明

**Template 部分：**
- ✅ `<h1>标题文本</h1>` - **被提取**
- ✅ `<button>提交</button>` - **被提取**
- ❌ HTML 注释 `<!-- 这是注释 -->` - **被过滤**

**Script 部分：**
- ❌ console.log 中的 `'调试信息'` - **被过滤**
- ✅ this.$message.success 中的 `'操作成功'` - **被提取**
- ❌ JavaScript 注释 `// 点击处理函数` - **被过滤**

## 优势

1. **减少手动筛选** - 自动过滤不需要国际化的内容
2. **提高准确性** - 避免将调试信息错误地添加到语言包
3. **节省时间** - 无需在生成的 JSON 中手动删除 console 和注释
4. **保持整洁** - 语言包只包含真正需要翻译的文本
