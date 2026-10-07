#requires -Version 5.1
$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "إلغاء تثبيت إضافة Antigravity Arabic & RTL Support..." -ForegroundColor Yellow

# 1. Stop background node service running service.js
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object { $_.CommandLine -like "*antigravity-rtl*" } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
}

# 2. Remove registry startup
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "AntigravityRTLService" -ErrorAction SilentlyContinue

# 3. Remove Startup folder file
$appDataDir = [System.Environment]::GetFolderPath('ApplicationData')
$startupFile = [System.IO.Path]::Combine($appDataDir, "Microsoft\Windows\Start Menu\Programs\Startup\AntigravityRTL.vbs")
if (Test-Path $startupFile) { Remove-Item $startupFile -Force }

# 4. Remove IDE Extension if installed
$ideCmd = Get-Command antigravity-ide.cmd -ErrorAction SilentlyContinue
if (-not $ideCmd) {
    $defaultIdePaths = @(
        "$env:LOCALAPPDATA\Programs\Antigravity IDE\bin\antigravity-ide.cmd",
        "$env:ProgramFiles\Antigravity IDE\bin\antigravity-ide.cmd"
    )
    foreach ($p in $defaultIdePaths) {
        if (Test-Path $p) {
            $ideCmd = $p
            break
        }
    }
}
if ($ideCmd) {
    & $ideCmd --uninstall-extension omid-io.antigravity-rtl 2>$null
}

# 5. Remove target folder
$targetDir = Join-Path $appDataDir "antigravity-rtl"
if (Test-Path $targetDir) { Remove-Item $targetDir -Recurse -Force }

Write-Host "✅ تم إلغاء التثبيت بنجاح." -ForegroundColor Green
Write-Host ""
