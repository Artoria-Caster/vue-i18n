# 翻译功能测试脚本

Write-Host "========================================"
Write-Host "  翻译生成功能测试"
Write-Host "========================================"
Write-Host ""

# 1. 检查必需文件
Write-Host "1. 检查必需文件..."
$zhCNPath = "output\zh-CN.js"
$templatePath = "output\translation-template.txt"

if (-not (Test-Path $zhCNPath)) {
    Write-Host "   [X] 未找到 zh-CN.js，请先运行 npm run regenerate"
    exit 1
}
Write-Host "   [OK] 找到 zh-CN.js"

if (-not (Test-Path $templatePath)) {
    Write-Host "   [X] 未找到 translation-template.txt，请先运行 npm run regenerate"
    exit 1
}
Write-Host "   [OK] 找到 translation-template.txt"
Write-Host ""

# 2. 测试生成英语配置
Write-Host "2. 测试生成英语配置（en-US）..."

# 备份原模板
if (Test-Path "output\translation-template.txt.test.bak") {
    Remove-Item "output\translation-template.txt.test.bak"
}
Copy-Item $templatePath "output\translation-template.txt.test.bak"

# 使用测试模板
if (Test-Path "output\translation-template-test.txt") {
    Copy-Item "output\translation-template-test.txt" $templatePath -Force
    Write-Host "   使用测试翻译模板"
}

# 运行生成命令
node src/index.js translate output en-US

if ($LASTEXITCODE -eq 0 -and (Test-Path "output\en-US.js")) {
    Write-Host "   [OK] 成功生成 en-US.js"
} else {
    Write-Host "   [X] 生成失败"
    # 恢复模板
    Copy-Item "output\translation-template.txt.test.bak" $templatePath -Force
    exit 1
}
Write-Host ""

# 3. 测试生成日语配置
Write-Host "3. 测试生成日语配置（ja-JP）..."
node src/index.js translate output ja-JP

if ($LASTEXITCODE -eq 0 -and (Test-Path "output\ja-JP.js")) {
    Write-Host "   [OK] 成功生成 ja-JP.js"
} else {
    Write-Host "   [X] 生成失败"
}
Write-Host ""

# 4. 测试默认参数
Write-Host "4. 测试默认参数..."
node src/index.js translate

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] 默认参数测试通过"
} else {
    Write-Host "   [X] 默认参数测试失败"
}
Write-Host ""

# 5. 验证生成的文件
Write-Host "5. 验证生成的文件..."
$files = Get-ChildItem output -Filter "*.js" | Where-Object { $_.Name -match "^(en-US|ja-JP|zh-CN)\.js$" }
Write-Host "   生成的语言包文件："
foreach ($file in $files) {
    $size = [math]::Round($file.Length / 1KB, 2)
    Write-Host "   - $($file.Name) ($size KB)"
}
Write-Host ""

# 6. 检查en-US.js内容
Write-Host "6. 检查 en-US.js 内容..."
$content = Get-Content "output\en-US.js" -Raw -Encoding UTF8
if ($content -match "export default") {
    Write-Host "   [OK] 文件格式正确（ES6 module）"
} else {
    Write-Host "   [X] 文件格式不正确"
}

# 检查是否有翻译内容
if ($content -match 'Home|Logout|User Management') {
    Write-Host "   [OK] 包含翻译内容"
} else {
    Write-Host "   [!] 未检测到翻译内容（可能翻译模板为空）"
}
Write-Host ""

# 恢复原模板
Write-Host "7. 恢复原翻译模板..."
if (Test-Path "output\translation-template.txt.test.bak") {
    Copy-Item "output\translation-template.txt.test.bak" $templatePath -Force
    Remove-Item "output\translation-template.txt.test.bak"
    Write-Host "   [OK] 已恢复"
}
Write-Host ""

# 测试总结
Write-Host "========================================"
Write-Host "  测试完成！"
Write-Host "========================================"
Write-Host ""
Write-Host "生成的文件位于 output 目录："
Write-Host "  - en-US.js (英语配置)"
Write-Host "  - ja-JP.js (日语配置)"
Write-Host "  - zh-CN.js (中文配置)"
Write-Host ""
Write-Host "下一步："
Write-Host "  1. 编辑 output/translation-template.txt，填写实际翻译"
Write-Host "  2. 运行 npm run translate output <language> 生成语言包"
Write-Host "  3. 将生成的语言包文件部署到项目中"
Write-Host ""
