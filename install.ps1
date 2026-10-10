#requires -Version 5.1
<#
.SYNOPSIS
    Antigravity Arabic Suite - Interactive Visual Terminal Setup
.DESCRIPTION
    Installs the complete Arabic and RTL engine, AI instructions, background watcher daemon,
    and immediately injects live into running Antigravity instances with interactive progress stages.
#>

$ErrorActionPreference = "Stop"

# Force standard UTF-8 for Output and Input streams
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "         Antigravity Arabic Suite - Modern Pipeline Installer            " -ForegroundColor White
Write-Host "         Arabic and RTL Engine Setup for Google Antigravity              " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""

# Helpers for rich segmented console progress bar
$Script:Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$Script:StageTimers = @{}

function Render-PipelineBar([int]$currentStage, [int]$totalStages, [string]$statusText, [int]$pct) {
    $width = 34
    $filledChars = [Math]::Max(0, [Math]::Min($width, [int](($pct / 100) * $width)))
    $unfilledChars = $width - $filledChars
    
    $barFilled = New-Object string ([char]0x2588, $filledChars)
    $barUnfilled = New-Object string ([char]0x2591, $unfilledChars)
    
    $elapsed = $Script:Stopwatch.ElapsedMilliseconds
    $timeStr = if ($elapsed -ge 1000) { "{0:N2}s" -f ($elapsed / 1000) } else { "$elapsed ms" }

    Write-Host "  +--------------------------------------------------------------------+" -ForegroundColor DarkGray
    Write-Host "  | " -NoNewline -ForegroundColor DarkGray
    Write-Host "Installation Track: [" -NoNewline -ForegroundColor Cyan
    Write-Host "$barFilled" -NoNewline -ForegroundColor Green
    Write-Host "$barUnfilled" -NoNewline -ForegroundColor DarkGray
    Write-Host "] " -NoNewline -ForegroundColor Cyan
    Write-Host ("{0,3}%" -f $pct) -NoNewline -ForegroundColor White
    Write-Host ("  Time: {0,7}" -f $timeStr) -NoNewline -ForegroundColor DarkYellow
    Write-Host " |" -ForegroundColor DarkGray
    Write-Host "  | " -NoNewline -ForegroundColor DarkGray
    Write-Host ("Stage [{0}/{1}]: {2,-49}" -f $currentStage, $totalStages, $statusText) -NoNewline -ForegroundColor White
    Write-Host " |" -ForegroundColor DarkGray
    Write-Host "  +--------------------------------------------------------------------+" -ForegroundColor DarkGray
    Write-Host ""
}

function Log-Step([int]$stage, [int]$total, [string]$title, [string]$detail, [int]$pct) {
    Render-PipelineBar $stage $total $title $pct
    Write-Host "  [>] $detail" -ForegroundColor DarkCyan
    Start-Sleep -Milliseconds 150
}

# 1. Environment and Node.js Verification
$t1 = [System.Diagnostics.Stopwatch]::StartNew()
Log-Step 1 5 "Environment and Runtime Verification" "Checking Node.js engine and execution prerequisites..." 15

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
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
    Write-Host "  [!] Node.js not detected in PATH. Auto-installing via winget..." -ForegroundColor Yellow
    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCmd) {
        try {
            winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
        } catch {}
    }
}

if (-not $nodeCmd) {
    Write-Host ""
    Write-Host "  [X] Error: Node.js runtime is required to run background engine." -ForegroundColor Red
    Write-Host "  Please download and install it from https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}
$nodeVer = node -v
Write-Host "  [+] Node.js confirmed: $nodeVer" -ForegroundColor Green
$Script:StageTimers["Stage1"] = $t1.ElapsedMilliseconds

# 2. Directory Structure Preparation
$t2 = [System.Diagnostics.Stopwatch]::StartNew()
Log-Step 2 5 "System Paths and Directory Structure" "Creating AppData directories and AI instruction roots..." 35

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDataDir = [System.Environment]::GetFolderPath("ApplicationData")
$userProfile = [System.Environment]::GetFolderPath("UserProfile")
$targetDir = Join-Path $appDataDir "antigravity-rtl"
$geminiConfigDir = Join-Path $userProfile ".gemini\config"
$geminiRulesDir = Join-Path $geminiConfigDir "rules"

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
New-Item -ItemType Directory -Path $geminiRulesDir -Force | Out-Null
Write-Host "  [+] Target workspace ready: $targetDir" -ForegroundColor Green
$Script:StageTimers["Stage2"] = $t2.ElapsedMilliseconds

# 3. Deploy Engine Core Files
$t3 = [System.Diagnostics.Stopwatch]::StartNew()
Log-Step 3 5 "Engine Package and Source Deployment" "Deploying RTL inject scripts, CDP watcher and AI rules..." 60

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
Fetch-Or-Copy "rules\AGENTS.md" (Join-Path $geminiRulesDir "AGENTS.md")
Fetch-Or-Copy "rules\GEMINI.md" (Join-Path $geminiConfigDir "GEMINI.md")
Fetch-Or-Copy "version.json" (Join-Path $targetDir "version.json")

Write-Host "  [+] Engine modules and AI rules successfully published" -ForegroundColor Green
$Script:StageTimers["Stage3"] = $t3.ElapsedMilliseconds

# 4. Auto-Start and Launcher Registration
$t4 = [System.Diagnostics.Stopwatch]::StartNew()
Log-Step 4 5 "System Autostart and Shortcut Binding" "Registering Windows startup entry and pairing dual shortcuts..." 80

$vbsPath = Join-Path $targetDir "start_hidden.vbs"
$launcherVbs = Join-Path $targetDir "antigravity_launcher.vbs"
$ideLauncherVbs = Join-Path $targetDir "antigravity_ide_launcher.vbs"

# Register in HKCU Run
$regValue = "wscript.exe `"$vbsPath`""
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "AntigravityRTLService" -Value $regValue

# Startup folder fallback
$startupDir = [System.IO.Path]::Combine($appDataDir, "Microsoft\Windows\Start Menu\Programs\Startup")
if (Test-Path $startupDir) {
    Copy-Item $vbsPath -Destination (Join-Path $startupDir "AntigravityRTL.vbs") -Force
}

# Bind Shortcuts
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

# Optional IDE Extension
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
    try {
        & $ideCmd --install-extension omid-io.antigravity-rtl 2>$null
    } catch {}
}

Write-Host "  [+] Startup registry and paired dual-shortcuts configured" -ForegroundColor Green
$Script:StageTimers["Stage4"] = $t4.ElapsedMilliseconds

# 5. Live Service Activation and Injection
$t5 = [System.Diagnostics.Stopwatch]::StartNew()
Log-Step 5 5 "Service Activation and Live Injection" "Restarting watcher daemon and injecting RTL into active window..." 100

# Stop any running service.js instance cleanly
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "service\.js" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Sleep -Milliseconds 400

# Start fresh service process
Start-Process "wscript.exe" -ArgumentList "`"$vbsPath`""

# Execute instant one-shot injection
$serviceScript = Join-Path $targetDir "service.js"
if (Test-Path $serviceScript) {
    try {
        node $serviceScript --inject-only 2>$null
    } catch {}
}

Write-Host "  [+] Watcher daemon active and live injection executed" -ForegroundColor Green
$Script:StageTimers["Stage5"] = $t5.ElapsedMilliseconds

# Final Completion Summary
$totalTime = $Script:Stopwatch.ElapsedMilliseconds
$tTotalStr = if ($totalTime -ge 1000) { "{0:N2} seconds" -f ($totalTime / 1000) } else { "$totalTime ms" }

Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "            Antigravity Arabic Suite Installed Successfully!              " -ForegroundColor White
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Stage Performance Breakdown:" -ForegroundColor Cyan
Write-Host ("  [1] Environment & Runtime  : {0,6} ms  | Completed" -f $Script:StageTimers["Stage1"]) -ForegroundColor Gray
Write-Host ("  [2] System Directory Tree  : {0,6} ms  | Completed" -f $Script:StageTimers["Stage2"]) -ForegroundColor Gray
Write-Host ("  [3] Core Modules & Rules   : {0,6} ms  | Completed" -f $Script:StageTimers["Stage3"]) -ForegroundColor Gray
Write-Host ("  [4] Startup & Pairing      : {0,6} ms  | Completed" -f $Script:StageTimers["Stage4"]) -ForegroundColor Gray
Write-Host ("  [5] Live Daemon & Injection: {0,6} ms  | Completed" -f $Script:StageTimers["Stage5"]) -ForegroundColor Gray
Write-Host "  ------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ("  Total Execution Duration   : {0}" -f $tTotalStr) -ForegroundColor Yellow
Write-Host ""
Write-Host "  Active Features Inside Antigravity App:" -ForegroundColor Cyan
Write-Host "  * Full RTL support with ultra-clean IBM Plex Sans Arabic font" -ForegroundColor White
Write-Host "  * Precise twin circular quota meters (Hourly / Weekly quotas)" -ForegroundColor White
Write-Host "  * Project status capsule with release track and direct uninstall button" -ForegroundColor White
Write-Host "  * Continuous background watcher and instant injection without reloads" -ForegroundColor White
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor DarkGray
Write-Host "  Installation complete. The window stays open for review." -ForegroundColor Green
Write-Host "  Press any key to close..." -ForegroundColor Gray
Write-Host "==========================================================================" -ForegroundColor DarkGray
Write-Host ""

try {
    [Console]::ReadKey($true) | Out-Null
} catch {
    Read-Host "Press Enter to exit..."
}