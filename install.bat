@echo off
chcp 65001 >nul
title Antigravity Arabic RTL Installer
echo.
echo ========================================================
echo    Antigravity Arabic ^& RTL Support - Quick Setup
echo ========================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] حدث خطأ أثناء التثبيت.
)
echo.
pause
