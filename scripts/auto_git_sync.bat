@echo off
echo ========================================================
echo   Auto Git Sync - Tu dong cap nhat Code len GitHub
echo ========================================================
echo.

set GIT_PATH=C:\Users\PC\MinGit\cmd\git.exe

cd /d "c:\Tool-AI"

echo [%date% %time%] Dang kiem tra thay doi code...
"%GIT_PATH%" status --porcelain > %TEMP%\git_changes.txt

for %%I in (%TEMP%\git_changes.txt) do if %%~zI GTR 0 (
    echo [%date% %time%] Phat hien thay doi! Dang commit va push len GitHub...
    "%GIT_PATH%" add .
    "%GIT_PATH%" commit -m "auto-sync: cap nhat code tu dong [%date% %time%]"
    "%GIT_PATH%" push origin main
    echo [%date% %time%] -> Da dong bo len GitHub thanh cong!
) else (
    echo [%date% %time%] Khong co thay doi moi.
)

del %TEMP%\git_changes.txt
