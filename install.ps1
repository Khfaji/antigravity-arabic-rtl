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

# 1. Check & Auto-Install Node.js
Write-Host "[1/5] التحقق من بيئة Node.js..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
    # Check default paths in case PATH hasn't refreshed
    $defaultPaths = @("C:\Program Files\nodejs", "C:\Program Files (x86)\nodejs")
    foreach ($p in $defaultPaths) {
        if (Test-Path (Join-Path $p "node.exe")) {
            $env:Path = "$p;" + $env:Path
            $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
            break
        }
    }
}

if (-not $nodeCmd) {
    Write-Host "⚠️ لم يتم العثور على Node.js. جاري تثبيته تلقائياً عبر winget..." -ForegroundColor Yellow
    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCmd) {
        try {
            winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
            $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
            $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
        } catch {
            Write-Host "تعذر التثبيت التلقائي لـ winget." -ForegroundColor DarkYellow
        }
    }
}

if (-not $nodeCmd) {
    Write-Host "❌ خطأ: Node.js مطلوب لتشغيل الخدمة." -ForegroundColor Red
    Write-Host "يرجى تثبيت Node.js من: https://nodejs.org ثم إعادة تشغيل التثبيت." -ForegroundColor Yellow
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

# 3. Copy or Download Service Files
Write-Host "[3/5] تثبيت ملفات الخدمة..." -ForegroundColor Yellow
$baseUrl = "https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main"

function Fetch-Or-Copy($relPath, $destPath) {
    $localFile = Join-Path $scriptDir $relPath
    if (Test-Path $localFile) {
        Copy-Item $localFile -Destination $destPath -Force
    } else {
        $url = "$baseUrl/" + ($relPath.Replace("\", "/"))
        Invoke-WebRequest -Uri $url -OutFile $destPath -UseBasicParsing
    }
}

Fetch-Or-Copy "src\service.js" (Join-Path $targetDir "service.js")
Fetch-Or-Copy "src\inject.js" (Join-Path $targetDir "inject.js")
Fetch-Or-Copy "src\start_hidden.vbs" (Join-Path $targetDir "start_hidden.vbs")
Fetch-Or-Copy "src\antigravity_launcher.vbs" (Join-Path $targetDir "antigravity_launcher.vbs")
Fetch-Or-Copy "src\antigravity_ide_launcher.vbs" (Join-Path $targetDir "antigravity_ide_launcher.vbs")

# 4. Copy or Download AI Rules
Write-Host "[4/5] تثبيت القواعد العامة للذكاء الاصطناعي..." -ForegroundColor Yellow
Fetch-Or-Copy "rules\AGENTS.md" (Join-Path $geminiRulesDir "AGENTS.md")
Fetch-Or-Copy "rules\GEMINI.md" (Join-Path $geminiConfigDir "GEMINI.md")

# 5. Install Antigravity IDE Extension (Auto-detected)
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
    Write-Host "[5/6] تم اكتشاف Antigravity IDE! جاري تثبيت إضافة الـ RTL تلقائياً..." -ForegroundColor Yellow
    try {
        & $ideCmd --install-extension omid-io.antigravity-rtl 2>$null
        Write-Host "✅ تم تثبيت إضافة RTL داخل Antigravity IDE بنجاح!" -ForegroundColor Green
    } catch {
        Write-Host "تخطي تثبيت إضافة الـ IDE." -ForegroundColor DarkYellow
    }
}

# 6. Register Startup (Registry + Startup Folder) & App Dual-Launcher
Write-Host "[6/6] تسجيل التشغيل التلقائي مع الويندوز واقتران التطبيق..." -ForegroundColor Yellow
$vbsPath = Join-Path $targetDir "start_hidden.vbs"
$launcherVbs = Join-Path $targetDir "antigravity_launcher.vbs"
$ideLauncherVbs = Join-Path $targetDir "antigravity_ide_launcher.vbs"

# Register in HKCU Run
$regValue = "wscript.exe `"$vbsPath`""
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "AntigravityRTLService" -Value $regValue

# Copy to Startup folder as backup
$startupDir = [System.IO.Path]::Combine($appDataDir, "Microsoft\Windows\Start Menu\Programs\Startup")
if (Test-Path $startupDir) {
    Copy-Item $vbsPath -Destination (Join-Path $startupDir "AntigravityRTL.vbs") -Force
}

# Attach to Antigravity & Antigravity IDE Shortcuts (Start Menu & Desktop)
$wsh = New-Object -ComObject WScript.Shell

$antigravityExe = "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
if (Test-Path $antigravityExe) {
    $shortcutPaths = @(
        "$appDataDir\Microsoft\Windows\Start Menu\Programs\Antigravity.lnk",
        "$userProfile\Desktop\Antigravity.lnk",
        "$userProfile\OneDrive\Desktop\Antigravity.lnk"
    )
    foreach ($sc in $shortcutPaths) {
        if (Test-Path $sc) {
            try {
                $lnk = $wsh.CreateShortcut($sc)
                $lnk.TargetPath = "wscript.exe"
                $lnk.Arguments = "`"$launcherVbs`""
                $lnk.IconLocation = "$antigravityExe,0"
                $lnk.Save()
            } catch {}
        }
    }
}

$ideExe = "$env:LOCALAPPDATA\Programs\Antigravity IDE\Antigravity IDE.exe"
if (Test-Path $ideExe) {
    $ideShortcuts = @(
        "$appDataDir\Microsoft\Windows\Start Menu\Programs\Antigravity IDE\Antigravity IDE.lnk",
        "$userProfile\Desktop\Antigravity IDE.lnk",
        "$userProfile\OneDrive\Desktop\Antigravity IDE.lnk"
    )
    foreach ($sc in $ideShortcuts) {
        if (Test-Path $sc) {
            try {
                $lnk = $wsh.CreateShortcut($sc)
                $lnk.TargetPath = "wscript.exe"
                $lnk.Arguments = "`"$ideLauncherVbs`""
                $lnk.IconLocation = "$ideExe,0"
                $lnk.Save()
            } catch {}
        }
    }
}

# Start the service now
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
Write-Host "4. محرر Antigravity IDE: تم تثبيت وتفعيل إضافة RTL تلقائياً داخله." -ForegroundColor White
Write-Host "5. يعمل بصمت في الخلفية ويبدأ تلقائياً مع تشغيل جهازك." -ForegroundColor White
Write-Host ""

