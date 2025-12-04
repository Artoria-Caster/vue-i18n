# Vue i18n 翻译示例

本文件展示如何填写翻译模板文件 (translation-template.txt)

## 示例1：完整的英文翻译

```
# 翻译对照模板

# 格式说明：
# 每行格式为：中文文本 = 翻译文本
# 请在等号后面填写对应的翻译内容
# 支持变量占位符 {变量名}

# ==========================================

# 通用词汇
企业管理系统 = Enterprise Management System
退出登录 = Logout
首页 = Home
用户管理 = User Management
商品管理 = Product Management
订单管理 = Order Management
系统设置 = System Settings

# 按钮和操作
确定 = OK
取消 = Cancel
删除 = Delete
编辑 = Edit
搜索 = Search
重置 = Reset
保存 = Save
提交 = Submit
添加 = Add
导出 = Export

# 状态
正常 = Normal
禁用 = Disabled
成功 = Success
失败 = Failed
处理中 = Processing
待审核 = Pending Review

# 表单标签
用户名 = Username
密码 = Password
手机号 = Phone Number
邮箱地址 = Email Address
真实姓名 = Real Name
状态 = Status
角色 = Role
创建时间 = Created Time

# 表单提示
请输入用户名 = Please enter username
请输入密码 = Please enter password
请输入手机号 = Please enter phone number
请输入邮箱地址 = Please enter email address
请选择状态 = Please select status
请选择角色 = Please select role

# 带变量的文本（保留花括号中的变量名）
欢迎，{username} = Welcome, {username}
您有{notificationCount}条未读通知 = You have {notificationCount} unread notifications
订单"{id}"支付成功 = Order "{id}" paid successfully
当前版本：{version} = Current version: {version}
确认支付订单"{id}"，金额为¥{amount}？ = Confirm payment for order "{id}", amount: ¥{amount}?

# 验证消息
用户名长度在3到20个字符 = Username length should be between 3 and 20 characters
手机号格式不正确 = Invalid phone number format
邮箱格式不正确 = Invalid email format
密码长度不能少于6位 = Password length must be at least 6 characters

# 系统消息
版权所有 © 2024 企业管理系统 = Copyright © 2024 Enterprise Management System
技术支持：开发团队 = Technical Support: Development Team
```

## 示例2：日语翻译

```
# 日语翻译示例

企业管理系统 = 企業管理システム
退出登录 = ログアウト
首页 = ホーム
用户管理 = ユーザー管理
商品管理 = 商品管理
订单管理 = 注文管理
系统设置 = システム設定

确定 = 確定
取消 = キャンセル
删除 = 削除
编辑 = 編集
搜索 = 検索
保存 = 保存

用户名 = ユーザー名
密码 = パスワード
手机号 = 電話番号
邮箱地址 = メールアドレス

请输入用户名 = ユーザー名を入力してください
请输入密码 = パスワードを入力してください

欢迎，{username} = ようこそ、{username}さん
您有{notificationCount}条未读通知 = {notificationCount}件の未読通知があります
```

## 示例3：韩语翻译

```
# 韩语翻译示例

企业管理系统 = 기업 관리 시스템
退出登录 = 로그아웃
首页 = 홈
用户管理 = 사용자 관리
商品管理 = 상품 관리
订单管理 = 주문 관리
系统设置 = 시스템 설정

确定 = 확인
取消 = 취소
删除 = 삭제
编辑 = 편집
搜索 = 검색

用户名 = 사용자 이름
密码 = 비밀번호
手机号 = 전화번호
邮箱地址 = 이메일 주소

请输入用户名 = 사용자 이름을 입력하세요
请输入密码 = 비밀번호를 입력하세요

欢迎，{username} = 환영합니다, {username}님
您有{notificationCount}条未读通知 = {notificationCount}개의 읽지 않은 알림이 있습니다
```

## 注意事项

1. **保留变量占位符**：翻译时必须保留花括号 `{}` 中的变量名
   - 正确：`欢迎，{username} = Welcome, {username}`
   - 错误：`欢迎，{username} = Welcome, {用户名}` ❌

2. **保持格式一致**：每行格式必须是 `中文文本 = 翻译文本`
   - 等号两边可以有空格，但等号必须存在
   - 只有填写了翻译内容的行才会被识别

3. **注释和空行**：以 `#` 开头的行和空行会被忽略

4. **多行文本**：如果原文是多行文本，在翻译模板中会显示为一行，使用 `\n` 表示换行

5. **特殊字符**：翻译文本中可以包含任何字符，包括引号、换行符等

## 翻译工作流程

1. 运行 `npm run regenerate` 生成翻译模板
2. 将 `translation-template.txt` 发送给翻译人员
3. 翻译人员填写翻译内容
4. 收到翻译后的文件，保存为 `translation-template.txt`
5. 运行 `npm run translate output en-US` 生成对应语言包
6. 将生成的语言包文件部署到项目中

## 批量处理多种语言

如果需要生成多种语言，可以：

1. 为每种语言创建单独的翻译模板文件：
   - `translation-template-en.txt` (英语)
   - `translation-template-ja.txt` (日语)
   - `translation-template-ko.txt` (韩语)

2. 分别生成对应的语言包：
   ```bash
   # 英语
   cp translation-template-en.txt translation-template.txt
   npm run translate output en-US
   
   # 日语
   cp translation-template-ja.txt translation-template.txt
   npm run translate output ja-JP
   
   # 韩语
   cp translation-template-ko.txt translation-template.txt
   npm run translate output ko-KR
   ```

3. 或者使用脚本自动化处理：
   ```bash
   # Windows PowerShell
   Copy-Item translation-template-en.txt translation-template.txt
   npm run translate output en-US
   
   Copy-Item translation-template-ja.txt translation-template.txt
   npm run translate output ja-JP
   
   Copy-Item translation-template-ko.txt translation-template.txt
   npm run translate output ko-KR
   ```
