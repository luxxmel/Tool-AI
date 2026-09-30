@echo off
chcp 65001 >nul
echo ========================================================
echo   CẤU HÌNH MỞ CỔNG 3000 TRÊN TƯỜNG LỬA WINDOWS (LAN)
echo ========================================================
echo.
echo Đang kiểm tra quyền Quản trị viên (Administrator)...

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] BẠN CẦN CHẠY FILE NÀY BẰNG QUYỀN ADMIN:
    echo     Chuột phải vào file Mo_Cong_Mang_LAN.bat -^> Chọn "Run as administrator" (Chạy với tư cách quản trị viên).
    echo.
    pause
    exit /b 1
)

echo [1/2] Đang mở cổng TCP 3000 trên Windows Defender Firewall...
netsh advfirewall firewall add rule name="Next.js Dev Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000 profile=any >nul
if %errorLevel% equ 0 (
    echo     -^> Mở cổng 3000 THÀNH CÔNG!
) else (
    echo     -^> Lỗi khi thêm rule tường lửa.
)

echo [2/2] Đang chuyển mạng Wi-Fi sang chế độ Riêng tư (Private Network)...
powershell -Command "Set-NetConnectionProfile -InterfaceAlias 'Wi-Fi' -NetworkCategory Private" >nul 2>&1
if %errorLevel% equ 0 (
    echo     -^> Chuyển sang mạng Riêng tư THÀNH CÔNG!
) else (
    echo     -^> Lưu ý: Mạng Wi-Fi có thể do chính sách công ty quản lý.
)

echo.
echo ========================================================
echo   HOÀN TẤT!
echo   Bây giờ máy cắm dây LAN có thể truy cập:
echo   http://192.168.1.165:3000
echo ========================================================
echo.
pause
