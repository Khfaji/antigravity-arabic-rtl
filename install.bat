@echo off
setlocal
chcp 65001 >nul

rem Prefer Windows Terminal if available for crisp Arabic rendering and smooth font ligature
where wt.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    if not defined WT_SESSION (
        start "" wt.exe -d "%~dp0." powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
        exit /b 0
    )
)

rem Fallback to native PowerShell console
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation failed with exit code %ERRORLEVEL%.
    pause
)
