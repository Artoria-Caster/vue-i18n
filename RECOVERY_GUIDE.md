# Vue2-Demo 恢复指南

## 问题说明

在运行 `node src/index.js full` 后，vue2-demo项目出现了以下问题：

1. **Vue解析器兼容性问题** - 已修复：工具现在使用 vue-template-compiler 支持 Vue 2
2. **复杂表达式处理问题** - 三元表达式被错误地当作变量处理
3. **对象路径变量名问题** - `currentProduct.stock`这样的路径不能直接作为JS对象的key

## 已完成的修复

### 1. 修复VueParser支持Vue2
- 工具使用 vue-template-compiler 支持 Vue 2
- 调整解析API以兼容Vue2

### 2. 修复变量命名逻辑
- 添加`generateSafeVarName`方法，为复杂表达式生成安全的变量名
- 对于`obj.prop`形式，使用`prop`作为变量名
- 对于复杂表达式，使用`val0`, `val1`等

### 3. 跳过复杂表达式
- 提取器现在会跳过包含三元运算符、比较运算符等复杂表达式的模板

## 如何恢复vue2-demo项目

由于原始文件已被修改，需要从源码重新恢复：

### 方法1：从压缩包恢复（如果有zip格式）
```powershell
cd d:\LZY\Projects\vue-i18n\examples
# 需要先将vue2-demo.rar转换为.zip格式
Expand-Archive -Path vue2-demo.zip -DestinationPath . -Force
```

### 方法2：手动清理（推荐）
1. 删除i18n相关导入和配置
2. 恢复被替换的中文文本

### 方法3：使用git（如果项目在git中）
```powershell
git checkout -- examples/vue2-demo
```

## 重新运行工具

恢复项目后，使用修复后的工具：

```powershell
cd d:\LZY\Projects\vue-i18n
node src/index.js full
```

## 注意事项

1. **复杂表达式的手动处理** - 对于三元表达式等复杂逻辑，需要手动处理国际化
2. **测试验证** - 运行后务必测试所有功能
3. **备份重要** - 使用工具前确保有git或其他备份

## 工具改进点

1. ✅ Vue2解析器支持
2. ✅ 安全变量名生成
3. ✅ 跳过复杂表达式
4. ✅ main.js自动注入i18n实例（需手动修改）

## 待完善

1. 自动在main.js中注入i18n实例
2. 更智能的复杂表达式处理
3. 更好的备份机制
4. 增量更新支持
