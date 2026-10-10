@echo off
setlocal
chcp 65001 >nul

rem Prefer Windows Terminal if available for crisp Arabic fonts and smooth ligature
where wt.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    if not defined WT_SESSION (
        start "" wt.exe powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -Command "$ErrorActionPreference = 'Stop'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::InputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8; try { & chcp 65001 >$null 2>&1 } catch {}; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $installerPath = Join-Path $env:TEMP 'antigravity_installer.ps1'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/install.ps1' -OutFile $installerPath; & $installerPath"
        exit /b 0
    )
)

rem Fallback to native PowerShell with UTF-8 setup and -NoExit
powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -Command "$ErrorActionPreference = 'Stop'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::InputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8; try { & chcp 65001 >$null 2>&1 } catch {}; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $installerPath = Join-Path $env:TEMP 'antigravity_installer.ps1'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/install.ps1' -OutFile $installerPath; & $installerPath"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation failed with exit code %ERRORLEVEL%.
    pause
)
