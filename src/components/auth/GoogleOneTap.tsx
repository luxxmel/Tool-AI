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
    } else if (window.google?.accounts?.id) {
      initGoogleOneTap();
    }

    function initGoogleOneTap() {
      if (!window.google?.accounts?.id || !clientId) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              console.log("Nhận token từ Google One Tap, đang đăng nhập...");
              await loginWithGoogle({ credential: response.credential });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });

        // Bật popup One Tap chọn tài khoản Google ở góc màn hình
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error("Lỗi khởi tạo Google One Tap:", err);
      }
    }
  }, [isAuthenticated, clientId, loginWithGoogle]);

  return null;
}
