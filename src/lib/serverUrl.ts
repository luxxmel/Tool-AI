import { NextRequest } from "next/server";

/**
 * Lấy URL gốc (origin) chính xác của ứng dụng, hỗ trợ cả localhost, LAN IP,
 * và các Reverse Proxy / Cloudflare Tunnel (qua header X-Forwarded-Host và X-Forwarded-Proto).
 */
export function getAppOrigin(request: NextRequest): string {
  // 1. Ưu tiên biến môi trường NEXT_PUBLIC_APP_URL nếu có cấu hình cố định
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 2. Lấy thông tin từ headers chuyển tiếp của Cloudflare Tunnel / Proxy
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  let forwardedProto = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https") ? "https" : "http");

  // Nếu là domain chính thức biettuot.io.vn thì luôn luôn là https
  if (forwardedHost.includes("biettuot.io.vn")) {
    forwardedProto = "https";
  }

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (request.nextUrl.host.includes("biettuot.io.vn")) {
    return `https://${request.nextUrl.host}`;
  }

  // 3. Mặc định theo request.nextUrl
  return request.nextUrl.origin;
}
