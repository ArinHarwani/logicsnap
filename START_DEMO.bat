@echo off
title LogicSnap Setup & Server
echo.
echo =====================================================
echo  LogicSnap Cafe - Secure Automated Setup
echo =====================================================
echo.
echo You will be asked for a Setup Password.
echo If you don't know it, please ask the team. 
echo.

call npm run judge-setup

if %errorlevel% neq 0 (
    echo.
    echo ❌ Setup encountered an error. 
    echo Please make sure you entered the correct password.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
pause
