# 在桌面创建「说的道理桌宠」快捷方式（开发模式）
# 用法：在项目根目录右键用 PowerShell 运行，或执行：
#   powershell -ExecutionPolicy Bypass -File scripts/创建桌面快捷方式.ps1

$proj = Resolve-Path "$PSScriptRoot\.."
$desktop = [Environment]::GetFolderPath('Desktop')

$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut("$desktop\说的道理桌宠.lnk")
$sc.TargetPath = "$proj\scripts\启动桌宠.bat"
$sc.WorkingDirectory = "$proj"
$sc.IconLocation = "$proj\assets\pet.ico"
$sc.Description = "说的道理桌宠"
$sc.Save()

Write-Host "已创建桌面快捷方式：$desktop\说的道理桌宠.lnk"
