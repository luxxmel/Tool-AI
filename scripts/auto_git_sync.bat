@echo off
set GIT_EXE="C:\Users\PC\MinGit\cmd\git.exe"

%GIT_EXE% status --porcelain | findstr /R "." >nul
if %errorlevel% neq 0 (
    echo [INFO] khong co thay doi nao de push.
    exit /b 0
)

echo [AUTO-SYNC] Dang day code len GitHub...
%GIT_EXE% add .
%GIT_EXE% commit -m "Auto sync code: %date% %time%"
%GIT_EXE% push origin main

if %errorlevel% eq 0 (
    echo [SUCCESS] Da day code len GitHub thanh cong!
) else (
    echo [ERROR] Loi khi push code len GitHub.
)
