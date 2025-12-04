# 示例项目

这是一个简单的Vue项目示例，用于演示i18n自动转换工具的使用。

## 项目结构

```
example-project/
├── src/
│   ├── views/
│   │   ├── Home.vue
│   │   └── User.vue
│   ├── components/
│   │   └── Button.vue
│   └── utils/
│       └── message.js
└── package.json
```

## 使用步骤

### 1. 配置工具

修改 `i18n-tool/config.json`：

```json
{
  "targetProject": "./examples/example-project"
}
```

### 2. 运行提取

```bash
cd ../..
npm start
```

### 3. 查看结果

检查生成的JSON文件：`output/i18n-extracted-xxx.json`

### 4. 生成i18n配置

```bash
npm run generate output/i18n-extracted-xxx.json
```

查看生成的配置文件：`examples/example-project/src/i18n/`

### 5. 预览替换

```bash
npm run replace output/i18n-extracted-xxx.json -- --preview
```

### 6. 执行替换

```bash
npm run replace output/i18n-extracted-xxx.json
```

## 预期结果

工具将会：
1. 提取所有中文文本
2. 生成i18n配置文件
3. 将源代码中的中文替换为i18n调用

## 注意事项

- 这是一个演示项目，请在实际项目使用前先在测试项目上验证
- 确保项目已提交到git，便于回滚
