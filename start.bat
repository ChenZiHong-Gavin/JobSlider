@echo off
chcp 65001 >nul
echo ===================================
echo     JobSlider 启动脚本
echo ===================================
echo.

:: 检查端口占用
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [警告] 端口 8000 被占用，尝试关闭...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a 2>nul
)

netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo [警告] 端口 3000 被占用，尝试关闭...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul
)

echo.
echo [1/3] 正在启动后端服务...
start "JobSlider Backend" cmd /k "cd /d D:\Project\JobSlider\backend && python main.py"

timeout /t 3 /nobreak >nul

echo [2/3] 正在启动前端服务...
start "JobSlider Frontend" cmd /k "cd /d D:\Project\JobSlider\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] 正在打开浏览器...
start http://localhost:3000

echo.
echo ===================================
echo     服务已启动！
echo     前端: http://localhost:3000
 echo     后端: http://localhost:8000
echo ===================================
echo.
echo 按任意键关闭所有服务...
pause >nul

taskkill /FI "WindowTitle eq JobSlider Backend*" /F 2>nul
taskkill /FI "WindowTitle eq JobSlider Frontend*" /F 2>nul

echo 服务已关闭。
timeout /t 2 /nobreak >nul
