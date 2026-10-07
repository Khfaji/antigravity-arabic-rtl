#requires -Version 5.1
<#
.SYNOPSIS
    One-click installer for Antigravity Arabic & RTL Support
.DESCRIPTION
    Installs the background RTL daemon, global AI prompt rules, and enables auto-start.
#>

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Antigravity Arabic & RTL Support - One-Click Setup    " -ForegroundColor Cyan
Write-Host "   تفعيل دعم اللغة العربية واتجاه اليمين لليسار في Antigravity" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/5] التحقق من وجود Node.js..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "❌ خطأ: Node.js غير مثبت على جهازك!" -ForegroundColor Red
    Write-Host "يرجى تثبيت Node.js أولاً عبر تشغيل:" -ForegroundColor Yellow
    Write-Host "winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    exit 1
}
$nodeVersion = node -v
Write-Host "✅ تم العثور على Node.js ($nodeVersion)" -ForegroundColor Green

# 2. Target Directories
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDataDir = [System.Environment]::GetFolderPath('ApplicationData')
$userProfile = [System.Environment]::GetFolderPath('UserProfile')
$targetDir = Join-Path $appDataDir "antigravity-rtl"
$geminiConfigDir = Join-Path $userProfile ".gemini\config"
$geminiRulesDir = Join-Path $geminiConfigDir "rules"

Write-Host "[2/5] إعداد مجلدات النظام..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
New-Item -ItemType Directory -Path $geminiRulesDir -Force | Out-Null

# 3. Copy Service Files
Write-Host "[3/5] تثبيت ملفات الخدمة..." -ForegroundColor Yellow
Copy-Item (Join-Path $scriptDir "src\service.js") -Destination $targetDir -Force
Copy-Item (Join-Path $scriptDir "src\start_hidden.vbs") -Destination $targetDir -Force

# 4. Copy AI Rules
Write-Host "[4/5] تثبيت القواعد العامة للذكاء الاصطناعي..." -ForegroundColor Yellow
Copy-Item (Join-Path $scriptDir "rules\AGENTS.md") -Destination (Join-Path $geminiRulesDir "AGENTS.md") -Force
Copy-Item (Join-Path $scriptDir "rules\GEMINI.md") -Destination (Join-Path $geminiConfigDir "GEMINI.md") -Force

# 5. Register Startup (Registry + Startup Folder)
Write-Host "[5/5] تسجيل التشغيل التلقائي مع الويندوز..." -ForegroundColor Yellow
$vbsPath = Join-Path $targetDir "start_hidden.vbs"
$regValue = "wscript.exe `"$vbsPath`""

# Register in HKCU Run
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "AntigravityRTLService" -Value $regValue

# Copy to Startup folder as backup
$startupDir = [System.IO.Path]::Combine($appDataDir, "Microsoft\Windows\Start Menu\Programs\Startup")
if (Test-Path $startupDir) {
    Copy-Item $vbsPath -Destination (Join-Path $startupDir "AntigravityRTL.vbs") -Force
}

# 6. Start the service now
Write-Host "🚀 تشغيل الخدمة في الخلفية الآن..." -ForegroundColor Yellow
Start-Process "wscript.exe" -ArgumentList "`"$vbsPath`""

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   ✅ تم تفعيل دعم اللغة العربية بنجاح تام!              " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "المميزات المفعلة الآن:" -ForegroundColor Cyan
Write-Host "1. صندوق المحادثة: يتجه لليمين تلقائياً عند كتابة أي حرف عربي." -ForegroundColor White
Write-Host "2. رسائلك المرسلة: تستقر في اليمين بشكل سليم ومنظم." -ForegroundColor White
Write-Host "3. ردود المساعد: تعرض من اليمين لليسار مع الحفاظ على الأكواد." -ForegroundColor White
Write-Host "4. يعمل بصمت في الخلفية ويبدأ تلقائياً مع تشغيل جهازك." -ForegroundColor White
Write-Host ""
