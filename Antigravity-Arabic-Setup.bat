@echo off
chcp 65001 >nul
title Antigravity Arabic Suite - One-Click Online Setup
echo.
echo ========================================================
echo    Antigravity Arabic Suite - One-Click Online Setup
echo ========================================================
echo.
echo [*] جاري تحميل ملفات التثبيت وإعداد البيئة...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $installerPath = Join-Path $env:TEMP 'antigravity_installer.ps1'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Khfaji/antigravity-arabic-suite/main/install.ps1' -OutFile $installerPath; & $installerPath"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] حدث خطأ أثناء التثبيت. يرجى التأكد من اتصال الإنترنت والمحاولة مجدداً.
)
echo.
pause
