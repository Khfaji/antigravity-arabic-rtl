@echo off
setlocal
chcp 65001 >nul
title Antigravity Arabic Suite Setup

set "TEMP_PS1=%TEMP%\antigravity_installer.ps1"

echo [*] Downloading latest installer...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/install.ps1', '%TEMP_PS1%')"

if not exist "%TEMP_PS1%" (
    echo [!] Failed to download installer. Please check your internet connection.
    pause
    exit /b 1
)

rem Prefer Windows Terminal if available for crisp Arabic fonts and smooth ligature
where wt.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    if not defined WT_SESSION (
        start "" wt.exe powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -File "%TEMP_PS1%"
        exit /b 0
    )
)

rem Fallback to native PowerShell with -NoExit
powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -File "%TEMP_PS1%"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation finished with exit code %ERRORLEVEL%.
    pause
)
