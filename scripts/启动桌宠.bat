@echo off
rem 开发模式启动桌宠（被桌面快捷方式调用）
cd /d "%~dp0\.."
start "" /min cmd /c "npm start"
