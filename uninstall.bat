@echo off
chcp 65001 >nul
title Antigravity Arabic RTL Uninstaller
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
echo.
pause
