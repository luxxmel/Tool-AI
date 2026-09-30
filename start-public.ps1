# Script khởi động tự động OmniAI (Frontend + Backend API) và Cloudflare Quick Tunnel
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   OMNIAI - KHOI DONG SERVER (FRONTEND + BACKEND) & TUNNEL   " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";C:\Program Files\nodejs"
if (Get-Command fnm -ErrorAction SilentlyContinue) {
    & fnm env --shell powershell | Out-String | Invoke-Expression
}

Write-Host "[1/2] Dang khoi dong Next.js Server tren 0.0.0.0:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','User') + ';' + [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';C:\Program Files\nodejs'; & fnm env --shell powershell 2>`$null | Out-String | Invoke-Expression; npm run dev"
Start-Sleep -Seconds 3

Write-Host "[2/2] Dang ket noi Cloudflare Tunnel de lay URL Public..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HAY COPY DUONG LINK CO DUOI .trycloudflare.com BEN DUOI  " -ForegroundColor Green
Write-Host "  DE TRUY CAP TU DIEN THOAI HOAC GUI CHO NGUOI KHAC!        " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

cloudflared tunnel --url http://127.0.0.1:3000 --http-host-header 127.0.0.1:3000
