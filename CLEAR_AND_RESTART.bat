@echo off
echo ========================================
echo  Clear Cache and Restart Frontend
echo ========================================
echo.

echo [1/5] Stopping any running npm processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Clearing Vite cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache cleared!
) else (
    echo No cache found
)

echo [3/5] Clearing browser cache instructions...
echo.
echo IMPORTANT: Clear your browser cache NOW!
echo Press Ctrl + Shift + Delete
echo Select "Cached images and files"
echo Click "Clear data"
echo.
pause

echo [4/5] Starting development server...
echo.
start /B npm start

echo [5/5] Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000/franchise/medicines/add

echo.
echo ========================================
echo  Done! Check the browser window
echo ========================================
echo.
echo If still showing error:
echo 1. Close ALL browser tabs
echo 2. Close browser completely
echo 3. Reopen browser
echo 4. Go to: http://localhost:3000/franchise/medicines/add
echo.
pause
