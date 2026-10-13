import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper xác thực admin
async function verifyAdmin(adminId: string | null) {
  if (!adminId) return false;
  let adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser && adminId.includes("@")) {
    adminUser = await prisma.user.findUnique({ where: { email: adminId.toLowerCase().trim() } });
  }
  const isRootAdmin =
    adminId.toLowerCase().includes("hoanglinhcntti") ||
    adminUser?.email?.toLowerCase() === "hoanglinhcntti@gmail.com";
  return isRootAdmin || adminUser?.role === "ADMIN";
}

// GET /api/admin/revenue?adminId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Từ chối truy cập: Chỉ Quản trị viên (ADMIN) mới có quyền truy cập!" },
        { status: 403 }
      );
    }

    // Lấy tất cả đơn hàng đã thanh toán thành công (status = "PAID")
    const paidOrders = await prisma.paymentOrder.findMany({
      where: {
        status: "PAID",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    let totalRevenue = 0;
    let todayRevenue = 0;
    let thisMonthRevenue = 0;
    let thisYearRevenue = 0;

    let todayOrdersCount = 0;
    let thisMonthOrdersCount = 0;
    let thisYearOrdersCount = 0;

    // Doanh thu theo 30 ngày gần nhất
    const dailyMap: Record<string, { revenue: number; count: number; date: string }> = {};
    // Doanh thu theo các tháng trong năm hiện tại
    const monthlyMap: Record<string, { revenue: number; count: number; month: string }> = {};
    // Doanh thu theo các năm
    const yearlyMap: Record<string, { revenue: number; count: number; year: string }> = {};

    paidOrders.forEach((order) => {
      const amount = Number(order.amount || 0);
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toISOString().slice(0, 10);
      const yearStr = String(orderDate.getFullYear());
      const monthStr = `${yearStr}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;

      // Tổng cộng
      totalRevenue += amount;

      // Hôm nay
      if (dateStr === todayStr) {
        todayRevenue += amount;
        todayOrdersCount += 1;
      }

      // Tháng này
      if (orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth) {
        thisMonthRevenue += amount;
        thisMonthOrdersCount += 1;
      }

      // Năm này
      if (orderDate.getFullYear() === currentYear) {
        thisYearRevenue += amount;
        thisYearOrdersCount += 1;
      }

      // Thống kê theo ngày (lưu toàn bộ)
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { revenue: 0, count: 0, date: dateStr };
      }
      dailyMap[dateStr].revenue += amount;
      dailyMap[dateStr].count += 1;

      // Thống kê theo tháng
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { revenue: 0, count: 0, month: monthStr };
      }
      monthlyMap[monthStr].revenue += amount;
      monthlyMap[monthStr].count += 1;

      // Thống kê theo năm
      if (!yearlyMap[yearStr]) {
        yearlyMap[yearStr] = { revenue: 0, count: 0, year: yearStr };
      }
      yearlyMap[yearStr].revenue += amount;
      yearlyMap[yearStr].count += 1;
    });

    // Chuyển sang mảng và sắp xếp
    const dailyStats = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
    const monthlyStats = Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month));
    const yearlyStats = Object.values(yearlyMap).sort((a, b) => b.year.localeCompare(a.year));

    // Lấy 20 giao dịch gần nhất
    const recentOrders = paidOrders.slice(0, 30).map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      amount: o.amount,
      credits: o.credits,
      packageName: o.packageName || "Nạp Credits",
      paymentMethod: o.paymentMethod,
      transactionId: o.transactionId,
      createdAt: o.createdAt,
      user: o.user,
    }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders: paidOrders.length,
        todayRevenue,
        todayOrdersCount,
        thisMonthRevenue,
        thisMonthOrdersCount,
        thisYearRevenue,
        thisYearOrdersCount,
      },
      dailyStats,
      monthlyStats,
      yearlyStats,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống khi thống kê doanh thu" },
      { status: 500 }
    );
  }
}
