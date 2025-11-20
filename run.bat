@echo off
cls

echo.
echo ========================================
echo   Whisk AI + Veo3 Video Generator
echo   Starting server...
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm install
    echo.
    if errorlevel 1 (
        echo Error: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Create required directories
if not exist "images" mkdir images
if not exist "assets" mkdir assets
if not exist "projects" mkdir projects
if not exist "videos" mkdir videos

echo.
echo Starting server...
echo.
echo Server will run on: http://localhost:3002
echo Open in browser: http://localhost:3002/index2.html
echo.
echo Press Ctrl+C to stop the server
echo.

node runner.js

if errorlevel 1 (
    echo.
    echo [91mServer crashed with code %errorlevel%! Check logs above (API errors will show full response if not 200).[0m
    echo.
    pause
)
