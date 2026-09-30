import { PayOS } from "@payos/node";

export const PAYMENT_CONFIG = {
  bankId: process.env.NEXT_PUBLIC_PAYMENT_BANK_ID || "ACB",
  accountNo: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NO || "27763051",
  accountDisplayNo: "2776 3051",
  accountName: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "LE HOANG LINH",
  bankName: "ACB - Ngân hàng TMCP Á Châu",
};

let payosInstance: PayOS | null = null;

export function getPayOS(): PayOS | null {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    return null;
  }

  // Khóa checksumKey của PayOS bắt buộc phải là chuỗi Hex 64 ký tự (SHA-256)
  if (checksumKey.length !== 64) {
    console.warn(
      `[PayOS] CẢNH BÁO: PAYOS_CHECKSUM_KEY trong .env có ${checksumKey.length} ký tự (chuẩn PayOS là 64 ký tự hex). Hệ thống sẽ chuyển sang dùng VietQR ACB trực tiếp.`
    );
    return null;
  }

  if (!payosInstance) {
    try {
      payosInstance = new PayOS({
        clientId,
        apiKey,
        checksumKey,
      });
    } catch (err) {
      console.error("[PayOS] Khởi tạo thất bại:", err);
      return null;
    }
  }

  return payosInstance;
}
