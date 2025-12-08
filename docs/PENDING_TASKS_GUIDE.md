# 待处理任务记录功能指南

## 📖 快速导航

- [功能概述](#功能概述)
- [快速使用](#快速使用)
- [功能特点](#功能特点)
- [手动处理流程](#手动处理流程)
- [配置选项](#配置选项)
- [常见问题](#常见问题)
- [示例场景](#示例场景)
- [最佳实践](#最佳实践)

---

## 功能概述

在 i18n 自动转换过程中，部分中文字符串可能因为各种原因无法自动转换成功。**待处理任务记录**会自动生成一个清单，列出所有转换失败和跳过处理的文本，让你可以方便地手动处理这些项目。

## 快速使用

### 第一步：运行完整流程
```bash
node src/index.js full
```

### 第二步：查看生成的待处理任务文件
执行完成后会在 `output` 目录生成两个文件：

```
output/
├── pending-tasks-2025-12-04T07-59-34.md    # Markdown格式（推荐查看）
└── pending-tasks-2025-12-04T07-59-34.json  # JSON格式（程序处理）
```

### 第三步：打开Markdown文件查看
```bash
# 使用VS Code打开
code output/pending-tasks-*.md

# 或使用其他编辑器
notepad output/pending-tasks-*.md
```

---

## 功能特点

### 1. 自动生成
- 在执行 `full` 命令（完整流程）时自动生成
- 只有当存在失败或跳过的记录时才会生成文件
- 生成两种格式：Markdown（方便阅读）和 JSON（方便程序化处理）

### 2. 详细记录

#### 📊 统计概览
- 转换失败的数量
- 跳过处理的数量
- 总计数量

#### ❌ 转换失败记录
每个失败项包含：
- 文件路径
- 行号
- 原始中文文本
- 失败原因
- 发生时间
- ☑️ 处理状态复选框

示例：
```markdown
### 1. `src/views/Product.vue`

- **行号**: 85
  - **原文**: `{{ currentProduct.stock }}件`
  - **原因**: 未找到匹配的文本
  - **时间**: 2025/12/4 15:59:32
  - **处理状态**: [ ] 待处理
```

#### ⏭️ 跳过处理记录
按跳过原因分类：
- 变量引用
- 注释内容
- 特殊格式
- 其他原因

### 3. 处理建议
文件中包含详细的处理建议，帮助开发者快速解决问题：
- 常见失败原因的解决方案
- 跳过处理项的检查要点
- 完整的手动处理流程

---

## 手动处理流程

### 1. 定位问题
- 在Markdown文件中找到需要处理的项目
- 查看文件路径和行号

### 2. 打开文件
- 用编辑器打开对应文件
- 跳转到指定行号
  - **VS Code**: 按 `Ctrl+G`（Windows）或 `Cmd+G`（Mac）
  - 或使用 `Ctrl+P`（Windows）或 `Cmd+P`（Mac），输入文件路径和 `:行号`

### 3. 修复问题
根据失败原因选择处理方式：

#### 处理转换失败的文本
```vue
<!-- 修改前 -->
<el-button @click="submitOrder">提交订单</el-button>

<!-- 修改后 -->
<el-button @click="submitOrder">{{ $t('Order.submit') }}</el-button>
```

同时在语言包中添加对应的 key：
```javascript
// output/zh-CN/order.js
export default {
  "submit": "提交订单"
}
```

#### 检查跳过处理的变量
```javascript
// 如果是固定文本，需要转换
const message = '操作成功'
// 改为
const message = this.$t('Common.success')

// 如果是真正的动态变量，无需处理
const userName = userData.name
```

### 4. 标记完成
在待处理文件中打勾表示已完成：
```markdown
- **处理状态**: [x] 已完成
```

### 5. 验证结果
```bash
node src/index.js validate
```

---

## 配置选项

在 `config.json` 中配置待处理任务记录的行为：

```json
{
  "pendingTasks": {
    "enabled": true,                        // 是否启用待处理任务记录
    "outputFormat": ["markdown", "json"],   // 输出格式
    "includeSkipped": true,                 // 是否包含跳过的记录
    "includeFailed": true                   // 是否包含失败的记录
  }
}
```

---

## 文件格式说明

### Markdown 格式
易于阅读和编辑的格式，包含：
- 📊 统计概览
- ❌ 转换失败列表（按文件分组）
- ⏭️ 跳过处理列表（按原因分组）
- 💡 处理建议和流程指导

### JSON 格式
便于程序化处理的格式：
```json
{
  "generatedAt": "2025-12-04T07:35:44.000Z",
  "summary": {
    "failed": 5,
    "skipped": 12,
    "total": 17
  },
  "failed": [
    {
      "original": "提交订单",
      "filePath": "src/views/Order.vue",
      "line": 123,
      "reason": "未找到匹配的文本",
      "timestamp": "2025-12-04T07:35:44.000Z"
    }
  ],
  "skipped": [
    {
      "text": "price",
      "filePath": "src/views/Product.vue",
      "section": "script",
      "line": 45,
      "reason": "变量引用",
      "timestamp": "2025-12-04T07:35:44.000Z"
    }
  ]
}
```

---

## 常见问题

### Q1: 为什么会有转换失败？

**常见原因**：
- 文本在替换前被修改过
- 包含特殊字符导致匹配失败
- 文本格式复杂（如多行文本、包含引号等）
- 动态拼接的字符串

**解决方法**：
1. 查看失败原因和上下文
2. 定位到源文件的具体位置
3. 手动添加 i18n 调用
4. 在语言包中添加对应的翻译

### Q2: 跳过处理的内容是否需要国际化？

需要根据具体情况判断：

- **变量引用**：检查变量值是否为固定中文文本
  - 如果是固定文本 → 需要转换
  - 如果是动态变量 → 无需处理
  
- **注释内容**：通常不需要国际化
  - 代码注释 → 通常不需要
  - 文档注释 → 可能需要（如API文档）
  
- **特殊格式**：数字、日期等使用特定的国际化方法
  - 数字格式化：`$n()`
  - 日期格式化：`$d()`

### Q3: 如何快速定位问题代码？

**VS Code 快捷方式**：
1. 按 `Ctrl+P`（Windows）或 `Cmd+P`（Mac）
2. 输入文件路径，例如：`src/views/Order.vue`
3. 输入 `:行号` 跳转，例如：`:123`

### Q4: 处理完成后如何验证？

运行验证命令：
```bash
node src/index.js validate
```

验证会检查：
- i18n 配置是否完整
- 翻译文件是否存在
- 是否还有遗漏的中文文本

---

## 示例场景

### 场景1: 处理模板字符串失败

**待处理记录**：
```markdown
### 1. `src/views/Order.vue`

- **行号**: 123
  - **原文**: `提交订单`
  - **原因**: 未找到匹配的文本
  - **处理状态**: [ ] 待处理
```

**处理步骤**：

1. 打开 `src/views/Order.vue`，跳转到第 123 行

2. 找到相关代码：
   ```vue
   <el-button @click="submitOrder">提交订单</el-button>
   ```

3. 修改为 i18n 调用：
   ```vue
   <el-button @click="submitOrder">{{ $t('Order.submit') }}</el-button>
   ```

4. 在语言包中添加翻译（`output/zh-CN/order.js`）：
   ```javascript
   export default {
     "submit": "提交订单",
     // ... 其他翻译
   }
   ```

5. 在待处理记录中标记为完成：`[x] 已完成`

### 场景2: 处理复杂模板表达式

**待处理记录**：
```markdown
- **行号**: 45
  - **原文**: `您好，{{ userName }}！今天是{{ todayDate }}，祝您工作愉快！`
  - **原因**: 复杂的模板表达式
```

**处理步骤**：

1. 在语言包中添加带参数的翻译：
   ```javascript
   export default {
     "greeting": "您好，{userName}！今天是{todayDate}，祝您工作愉快！"
   }
   ```

2. 修改源文件：
   ```vue
   <template>
     <!-- 修改前 -->
     <div>您好，{{ userName }}！今天是{{ todayDate }}，祝您工作愉快！</div>
     
     <!-- 修改后 -->
     <div>{{ $t('Common.greeting', { userName, todayDate }) }}</div>
   </template>
   ```

3. 标记为完成：`[x]`

### 场景3: 检查跳过的变量引用

**待处理记录**：
```markdown
- **行号 45**: `message`
  - **区域**: script
  - **原因**: 变量引用
  - **处理状态**: [ ] 待处理
```

**检查步骤**：

1. 查看变量的定义和使用：
   ```javascript
   const message = '操作成功'  // 固定文本
   ```

2. 判断是否需要转换：
   - 如果是固定文本 → 需要转换：
     ```javascript
     const message = this.$t('Common.success')
     ```
   
   - 如果是真正的动态变量 → 无需处理：
     ```javascript
     const message = response.data.message  // 动态变量
     ```

3. 标记处理结果：`[x]`

---

## 最佳实践

### 1. 及时处理
每次转换后立即查看并处理待处理任务，避免积累过多问题。

### 2. 优先级排序
- **优先处理**：转换失败的项目（这些是确实需要国际化的）
- **其次检查**：跳过的项目（判断是否真的需要国际化）

### 3. 批量处理
对于同类问题，可以批量处理提高效率：
- 相同的失败原因使用相同的解决方案
- 相同模块的文本可以统一处理

### 4. 验证测试
处理完成后运行验证命令确保没有遗漏：
```bash
node src/index.js validate
```

### 5. 保存记录
将已完成的待处理文件存档，便于追溯：
```bash
# 创建已完成目录
mkdir output/completed

# 移动已处理的文件
mv output/pending-tasks-*.md output/completed/
```

### 6. 使用工具
利用编辑器的功能提高效率：
- 使用搜索和替换功能
- 使用多光标编辑
- 使用快捷键快速导航

---

## 相关命令

```bash
# 执行完整流程（包含生成待处理任务）
node src/index.js full

# 仅验证转换结果
node src/index.js validate

# 查看日志文件
cat logs/i18n-conversion-*.log

# 查看待处理任务（Windows）
type output\pending-tasks-*.md

# 查看待处理任务（Linux/Mac）
cat output/pending-tasks-*.md
```

---

## 技术实现

待处理任务记录功能在 `src/utils/logger.js` 中实现：

```javascript
// 生成待处理任务文件
logger.generatePendingTasks(outputDir)
```

该方法会：
1. 检查是否有失败或跳过的记录
2. 如果有，生成 Markdown 和 JSON 格式的文件
3. 返回生成的文件路径
4. 在控制台显示文件位置

---

## 需要帮助？

如果遇到问题：
1. 查看本文档的常见问题部分
2. 检查日志文件：`logs/i18n-conversion-*.log`
3. 查看验证报告：`output/validation-report.md`
4. 参考主文档：[README.md](../README.md)
5. 查看变更日志：[CHANGELOG.md](../CHANGELOG.md)

---

**最后更新**: 2025-12-08  
**版本**: 1.0.0
