@echo off
chcp 65001 >nul
title OmniAI - Khoi Dong Fullstack Server & Cloudflare Tunnel
echo ============================================================
echo   OMNIAI - KHOI DONG SERVER (FRONTEND + BACKEND) & TUNNEL
echo ============================================================
echo.

:: 1. Nap PATH cho Node.js va npm
set "PATH=C:\Program Files\nodejs;C:\Users\PC\AppData\Roaming\npm;C:\Users\PC\AppData\Local\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"

echo [1/2] Dang kiem tra va khoi dong Next.js Server (Frontend + Backend API)...
start "OmniAI Server (Frontend + Backend)" powershell -NoExit -Command "$env:Path = [System.Environment]::GetEnvironmentVariable('Path','User') + ';' + [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';C:\Program Files\nodejs'; & fnm env --shell powershell 2>$null | Out-String | Invoke-Expression; npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Dang ket noi Cloudflare Tunnel de tao URL Public...
echo.
echo ============================================================
echo   HAY COPY DUONG LINK CO DUOI .trycloudflare.com BEN DUOI
echo   DE TRUY CAP TU DIEN THOAI HOAC GUI CHO NGUOI KHAC!
echo ============================================================
echo.

:loop
cloudflared tunnel --url http://127.0.0.1:3000 --http-host-header 127.0.0.1:3000
echo.
echo [!] Tunnel bi ngat ket noi. Dang tu dong ket noi lai sau 3 giay...
timeout /t 3 /nobreak >nul
goto loop
