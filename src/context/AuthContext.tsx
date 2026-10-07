"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  role: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => void;
  loginWithGoogle: (data: {
    credential?: string;
    accessToken?: string;
    email?: string;
    name?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  loginWithOAuthUser: (user: User) => void;
  updateUserCredits: (credits: number) => void;
  updateUserProfile: (data: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tool_ai_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)tool_ai_auth_user=([^;]+)/);
        if (match && match[1]) {
          try {
            stored = decodeURIComponent(match[1]);
            localStorage.setItem(STORAGE_KEY, stored);
          } catch {}
        }
      }

      if (stored) {
        const parsed: User = JSON.parse(stored);
        if (parsed?.id?.startsWith("guest_")) {
          // Xóa bỏ guest cũ nếu có
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem("omni_guest_id");
          setUser(null);
        } else if (parsed) {
          if (parsed?.role === "ADMIN" || parsed?.email?.toLowerCase() === "hoanglinhcntti@gmail.com") {
            parsed.role = "ADMIN";
            parsed.credits = 999999;
          }
          setUser(parsed);
          if (typeof document !== "undefined") {
            document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=31536000; SameSite=Lax`;
          }

          // Đồng bộ credits mới nhất từ Database máy chủ
          fetch(`/api/user/credits?userId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (data?.credits !== undefined && parsed.role !== "ADMIN" && parsed.email?.toLowerCase() !== "hoanglinhcntti@gmail.com") {
                setUser((prev) => (prev ? { ...prev, credits: data.credits } : prev));
                localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify({ ...parsed, credits: data.credits })
                );
              }
            })
            .catch(() => {});
        }
      } else {
        // Không tự động tạo tài khoản khách: để người dùng trên máy khác tự đăng nhập bằng Facebook, GitHub, Google hoặc Email
        setUser(null);
      }
    } catch (e) {
      console.error("Lỗi khi đọc thông tin đăng nhập từ localStorage:", e);
    } finally {
      setIsLoading(false);
    }

    // Lắng nghe BroadcastChannel & postMessage & storage event để đồng bộ tức thì khi đăng nhập từ popup hoặc tab khác
    let bc: BroadcastChannel | null = null;
    const handleOAuthMsg = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        const newUser = event.data.user;
        if (newUser.role === "ADMIN" || newUser.email?.toLowerCase() === "hoanglinhcntti@gmail.com") {
          newUser.role = "ADMIN";
          newUser.credits = 999999;
        }
        setUser(newUser);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        } catch {}
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            if (parsed.role === "ADMIN" || parsed.email?.toLowerCase() === "hoanglinhcntti@gmail.com") {
              parsed.role = "ADMIN";
              parsed.credits = 999999;
            }
            setUser(parsed);
          }
        } catch {}
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleOAuthMsg);
      window.addEventListener("storage", handleStorageChange);
      try {
        if (window.BroadcastChannel) {
          bc = new BroadcastChannel("oauth_channel");
          bc.onmessage = (event) => {
            if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
              const newUser = event.data.user;
              if (newUser.role === "ADMIN" || newUser.email?.toLowerCase() === "hoanglinhcntti@gmail.com") {
                newUser.role = "ADMIN";
                newUser.credits = 999999;
              }
              setUser(newUser);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
              } catch {}
            }
          };
        }
      } catch {}
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleOAuthMsg);
        window.removeEventListener("storage", handleStorageChange);
      }
      if (bc) bc.close();
    };
  }, []);

  const loginWithGoogle = async (data: {
    credential?: string;
    accessToken?: string;
    email?: string;
    name?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Đăng nhập Google thất bại" };
      }

      const loggedInUser: User = resData.user;
      setUser(loggedInUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      if (typeof document !== "undefined") {
        document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(loggedInUser))}; path=/; max-age=2592000; SameSite=Lax`;
      }
      return { success: true };
    } catch (err) {
      console.error("Lỗi khi kết nối đến API auth Google:", err);
      return { success: false, error: "Lỗi kết nối đến máy chủ" };
    }
  };

  const loginWithFacebook = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Đăng nhập hoặc đăng ký tài khoản Facebook vào Database
      const fbEmail = "facebook.user@gmail.com";
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fbEmail,
          name: "Facebook User",
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Đăng nhập Facebook thất bại" };
      }

      const loggedInUser: User = {
        ...resData.user,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      };
      setUser(loggedInUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      if (typeof document !== "undefined") {
        document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(loggedInUser))}; path=/; max-age=2592000; SameSite=Lax`;
      }
      return { success: true };
    } catch (err) {
      console.error("Lỗi khi đăng nhập Facebook:", err);
      return { success: false, error: "Lỗi kết nối máy chủ Facebook" };
    }
  };

  const updateUserCredits = (newCredits: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const actualCredits = prev.role === "ADMIN" ? 999999 : newCredits;
      const updated = { ...prev, credits: actualCredits };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Lỗi cập nhật localStorage:", err);
      }
      return updated;
    });
  };

  const login = async (
    emailOrUsername: string,
    _password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrUsername.trim()) {
      return { success: false, error: "Vui lòng nhập email" };
    }

    try {
      const cleanInput = emailOrUsername.trim();
      const email = cleanInput.includes("@")
        ? cleanInput.toLowerCase()
        : `${cleanInput.toLowerCase()}@biettuot.io`;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: cleanInput.split("@")[0],
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Đăng nhập thất bại" };
      }

      const loggedInUser: User = resData.user;
      if (loggedInUser.role === "ADMIN") {
        loggedInUser.credits = 999999;
      }
      setUser(loggedInUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      if (typeof document !== "undefined") {
        document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(loggedInUser))}; path=/; max-age=2592000; SameSite=Lax`;
      }
      return { success: true };
    } catch (e) {
      console.error("Lỗi đăng nhập:", e);
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const loginDemo = () => {
    const demoUser: User = {
      id: "cmuchyzaf0000tar86bsjbasb",
      email: "hoanglinhcntti@gmail.com",
      username: "hoanglinhcntti",
      displayName: "Lịnh Hoàng",
      avatar: "https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c",
      role: "ADMIN",
      credits: 999999,
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    if (typeof document !== "undefined") {
      document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(demoUser))}; path=/; max-age=2592000; SameSite=Lax`;
    }
  };

  const loginWithOAuthUser = (loggedInUser: User) => {
    if (loggedInUser.role === "ADMIN" || loggedInUser.email?.toLowerCase() === "hoanglinhcntti@gmail.com") {
      loggedInUser.role = "ADMIN";
      loggedInUser.credits = 999999;
    }
    setUser(loggedInUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      if (typeof document !== "undefined") {
        document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(loggedInUser))}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch (err) {
      console.error("Lỗi lưu user vào localStorage:", err);
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (typeof document !== "undefined") {
          document.cookie = `tool_ai_auth_user=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=2592000; SameSite=Lax`;
        }
      } catch (err) {
        console.error("Lỗi cập nhật localStorage:", err);
      }
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("omni_guest_id");
    if (typeof document !== "undefined") {
      document.cookie = "tool_ai_auth_user=; path=/; max-age=0; SameSite=Lax";
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginDemo,
        loginWithGoogle,
        loginWithFacebook,
        loginWithOAuthUser,
        updateUserCredits,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
