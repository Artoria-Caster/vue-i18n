# Vue2 i18n测试项目

这是一个用于测试i18n自动转换工具的Vue2示例项目。

## 项目简介

本项目是一个完整的企业管理系统，包含了丰富的中文文本内容，用于测试i18n自动转换工具的各种场景。

## 项目特点

- ✅ 完整的Vue2项目结构
- ✅ 使用Element UI组件库
- ✅ 包含多个页面和组件
- ✅ 丰富的中文文本内容
- ✅ 包含模板字符串
- ✅ 包含Vue Router路由配置
- ✅ 包含Vuex状态管理
- ✅ 包含工具函数和常量定义

## 项目结构

```
vue2-demo/
├── public/
│   └── index.html              # HTML模板（包含中文）
├── src/
│   ├── main.js                 # 入口文件（包含中文）
│   ├── App.vue                 # 根组件（包含中文）
│   ├── views/                  # 页面组件
│   │   ├── Home.vue           # 首页（大量中文）
│   │   ├── User.vue           # 用户管理（表单、表格、对话框）
│   │   ├── Product.vue        # 商品管理（筛选、详情）
│   │   ├── Order.vue          # 订单管理（标签页）
│   │   ├── Settings.vue       # 系统设置（多个配置项）
│   │   └── Login.vue          # 登录页面（表单验证）
│   ├── components/
│   │   └── OrderList.vue      # 订单列表组件
│   ├── router/
│   │   └── index.js           # 路由配置（包含中文meta）
│   ├── store/
│   │   └── index.js           # Vuex状态管理（包含中文）
│   └── utils/
│       ├── helpers.js         # 工具函数（包含中文注释和字符串）
│       ├── constants.js       # 常量定义（大量中文映射）
│       └── request.js         # 请求封装（包含中文提示）
├── package.json
└── README.md
```

## 包含的中文文本场景

### 1. Vue模板中的文本
- 标题、标签、按钮文本
- 表格列标题
- 表单标签
- 提示信息

### 2. 模板字符串
```vue
<p>您好，{{ userName }}！今天是{{ todayDate }}，祝您工作愉快！</p>
<span>比昨日增长{{ visitGrowth }}%</span>
```

### 3. JavaScript字符串
- data中的字符串
- methods中的提示消息
- computed属性中的文本处理
- 对象映射中的中文值

### 4. 常量定义
- 角色名称映射
- 状态文本映射
- 错误提示信息
- 表单验证消息

### 5. 路由配置
- 路由meta中的title
- 路由守卫中的提示消息

### 6. Vuex状态管理
- state中的配置信息
- mutations和actions中的日志消息
- getters中的文本处理

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
npm run serve
```

## 构建项目

```bash
npm run build
```

## 测试i18n转换工具

本项目专门设计用于测试i18n自动转换工具，包含以下测试场景：

1. **普通文本提取** - 提取所有中文文本
2. **模板字符串处理** - 识别包含变量的模板字符串
3. **不同文件类型** - .vue、.js文件
4. **不同区域** - template、script区域
5. **复杂嵌套结构** - 对象、数组、函数参数中的中文
6. **Element UI集成** - 组件属性中的中文文本

## 默认登录信息

- 用户名：admin
- 密码：123456

## 技术栈

- Vue 2.6.14
- Vue Router 3.5.1
- Vuex 3.6.2
- Element UI 2.15.13
- Axios 0.27.2

## 注意事项

1. 本项目为测试项目，不包含真实的后端接口
2. 所有数据均为模拟数据
3. 部分功能仅做UI展示
4. 项目中的中文文本是刻意设计的，用于测试i18n工具的提取能力

## License

MIT
