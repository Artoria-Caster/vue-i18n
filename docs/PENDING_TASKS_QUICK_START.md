# 待处理任务记录功能 - 快速指南

## 什么是待处理任务记录？

在i18n自动转换过程中，部分中文字符串可能因为各种原因无法自动转换。**待处理任务记录**会自动生成一个清单，列出所有转换失败和跳过处理的文本，让你可以方便地手动处理这些项目。

## 快速使用

### 1. 运行完整流程
```bash
node src/index.js full
```

### 2. 查看生成的待处理任务文件
执行完成后会在 `output` 目录生成两个文件：

```
output/
├── pending-tasks-2025-12-04T07-59-34.md    # Markdown格式（推荐查看）
└── pending-tasks-2025-12-04T07-59-34.json  # JSON格式（程序处理）
```

### 3. 打开Markdown文件查看
```bash
# 使用VS Code打开
code output/pending-tasks-*.md

# 或使用其他编辑器
notepad output/pending-tasks-*.md
```

## 文件内容

Markdown文件包含：

### 📊 统计概览
- 转换失败的数量
- 跳过处理的数量
- 总计数量

### ❌ 转换失败列表
每个失败项包含：
- 文件路径
- 行号
- 原始文本
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

### ⏭️ 跳过处理列表
按跳过原因分类，包含：
- 变量引用
- 注释内容
- 特殊格式
- 其他原因

### 💡 处理建议
- 常见问题的解决方案
- 手动处理流程指导
- 最佳实践建议

## 手动处理流程

1. **定位问题**
   - 在Markdown文件中找到需要处理的项目
   - 查看文件路径和行号

2. **打开文件**
   - 用编辑器打开对应文件
   - 跳转到指定行号（VS Code中按 `Ctrl+G`）

3. **修复问题**
   - 根据失败原因选择处理方式
   - 手动添加或修改 i18n 调用

4. **标记完成**
   - 在待处理文件中打勾：`[x]`
   - 方便追踪进度

5. **验证结果**
   ```bash
   node src/index.js validate
   ```

## 常见失败原因

### 1. 未找到匹配的文本
**原因**: 文本格式在替换前发生了变化

**解决**: 手动定位并替换：
```vue
<!-- 修改前 -->
<span>{{ count }}件</span>

<!-- 修改后 -->
<span>{{ $t('product.stockUnit', { count }) }}</span>
```

### 2. 复杂模板表达式
**原因**: 包含复杂的变量插值

**解决**: 使用i18n的参数功能：
```javascript
// 语言包
{
  "welcome": "您好，{name}！今天是{date}"
}

// 使用
this.$t('welcome', { name: userName, date: todayDate })
```

## 配置选项

在 `config.json` 中配置：

```json
{
  "pendingTasks": {
    "enabled": true,                        // 启用待处理任务记录
    "outputFormat": ["markdown", "json"],   // 输出格式
    "includeSkipped": true,                 // 包含跳过的记录
    "includeFailed": true                   // 包含失败的记录
  }
}
```

## 技巧提示

### 快速导航
- VS Code: `Ctrl+P` 输入文件名，`:行号` 跳转
- 使用搜索功能定位文本

### 批量处理
- 对同类问题使用相同的解决方案
- 可以编写脚本批量处理JSON数据

### 进度追踪
- 在Markdown文件中使用复选框 `[x]` 标记已完成
- 定期备份已处理的文件

## 示例场景

### 场景1: 处理模板字符串失败

**待处理记录**:
```markdown
- **行号**: 18
  - **原文**: `您好，{{ userName }}！今天是{{ todayDate }}，祝您工作愉快！`
  - **原因**: 未找到匹配的文本
```

**处理步骤**:
1. 在语言包中添加：
   ```javascript
   {
     "welcome": {
       "greeting": "您好，{userName}！今天是{todayDate}，祝您工作愉快！"
     }
   }
   ```

2. 修改源文件：
   ```vue
   <template>
     <div>{{ $t('welcome.greeting', { userName, todayDate }) }}</div>
   </template>
   ```

3. 标记为完成：`[x]`

### 场景2: 检查跳过的变量

**待处理记录**:
```markdown
- **行号 45**: `message`
  - **区域**: script
  - **原因**: 变量引用
```

**检查步骤**:
1. 查看变量定义
2. 如果是固定文本，需要手动转换
3. 如果是真正的动态变量，标记 `[x]` 无需处理

## 完整文档

详细使用说明和更多示例，请查看：
- [完整文档](./PENDING_TASKS.md)
- [项目README](../README.md)
- [变更日志](../CHANGELOG.md)

## 需要帮助？

如果遇到问题：
1. 查看完整文档中的常见问题部分
2. 检查日志文件：`logs/i18n-conversion-*.log`
3. 查看验证报告：`output/validation-report.md`
4. 提交Issue到项目仓库

---

**更新时间**: 2025-12-04  
**版本**: 1.0.0
