"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function GoogleOneTap() {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Nếu đã đăng nhập hoặc chưa có clientId thì không bật One Tap
    if (isAuthenticated || !clientId) return;

    // Load Google Identity Services script nếu chưa có
    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleOneTap();
      document.body.appendChild(script);
    } else if ((window as any).google?.accounts?.id) {
      initGoogleOneTap();
    }

    function initGoogleOneTap() {
      const g = (window as any).google;
      if (!g?.accounts?.id || !clientId) return;

      try {
        g.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              console.log("Nhận token từ Google One Tap, đang đăng nhập...");
              await loginWithGoogle({ credential: response.credential });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Bật popup One Tap với error suppression để tránh cảnh báo bảo mật
        g.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            // Không hiển thị popup (bị chặn bởi browser hoặc origin), bỏ qua âm thầm
          } else if (notification?.isSkippedMoment?.()) {
            // Bị bỏ qua, bỏ qua âm thầm
          }
        });
      } catch (err) {
        // Suppress Google One Tap initialization errors
      }
    }
  }, [isAuthenticated, clientId, loginWithGoogle]);

  return null;
}
