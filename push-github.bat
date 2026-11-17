@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "REPO_URL=https://github.com/khanhtruongnguyen/Habit.git"
set "BRANCH=main"
set "FIRST_INIT=0"

echo ========================================
echo   Auto Build ^& Push to GitHub (Habit)
echo ========================================
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    goto :fail
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH.
    goto :fail
)

echo [1/4] Running npm run build...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed. Push aborted.
    goto :fail
)

echo.
echo [2/4] Checking Git repository...
if not exist ".git" (
    echo Initializing new Git repository...
    git init
    if errorlevel 1 goto :fail
    git branch -M %BRANCH%
    if errorlevel 1 goto :fail
    git remote add origin "%REPO_URL%"
    if errorlevel 1 goto :fail
    set "FIRST_INIT=1"
) else (
    git remote get-url origin >nul 2>&1
    if errorlevel 1 (
        git remote add origin "%REPO_URL%"
    ) else (
        git remote set-url origin "%REPO_URL%"
    )
    git branch -M %BRANCH% >nul 2>&1
)

git config user.name >nul 2>&1
if errorlevel 1 (
    git config user.name "khanhtruongnguyen"
)

git config user.email >nul 2>&1
if errorlevel 1 (
    git config user.email "khanhtruongnguyen@users.noreply.github.com"
)

echo.
echo [3/4] Staging and committing changes...
git add -A
if errorlevel 1 goto :fail

for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set "NOW=%%i"
if not defined NOW set "NOW=auto update"

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Update: %NOW%"
    if errorlevel 1 goto :fail
) else (
    echo No new changes to commit.
)

echo.
echo [4/4] Pushing to GitHub (%BRANCH%)...
if "%FIRST_INIT%"=="1" (
    echo First push: overwriting remote branch "%BRANCH%" with local code...
    git push -u --force origin %BRANCH%
    if errorlevel 1 goto :fail
) else (
    git push -u origin %BRANCH%
    if errorlevel 1 goto :fail
)

echo.
echo ========================================
echo   DONE! Pushed successfully to GitHub.
echo ========================================
echo.
pause
exit /b 0

:fail
echo.
echo ========================================
echo   FAILED! Please check the error above.
echo ========================================
echo.
pause
exit /b 1
