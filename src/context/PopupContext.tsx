"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export type PopupType = "info" | "success" | "warning" | "error";

export interface PopupOptions {
  title?: string;
  message: string;
  type?: PopupType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupContextType {
  showAlert: (message: string, title?: string, type?: PopupType) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showSuccess: (message: string, title?: string) => Promise<void>;
  showError: (message: string, title?: string) => Promise<void>;
  showWarning: (message: string, title?: string) => Promise<void>;
  openPopup: (options: PopupOptions) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupOptions | null>(null);
  const resolveRef = useRef<((val: any) => void) | null>(null);

  const closePopup = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setPopup(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (popup?.onConfirm) popup.onConfirm();
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setPopup(null);
  }, [popup]);

  const handleCancel = useCallback(() => {
    if (popup?.onCancel) popup.onCancel();
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setPopup(null);
  }, [popup]);

  const showAlert = useCallback(
    (message: string, title?: string, type: PopupType = "info"): Promise<void> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setPopup({
          title:
            title ||
            (type === "error"
              ? "Thông báo lỗi"
              : type === "success"
              ? "Thành công"
              : type === "warning"
              ? "Cảnh báo"
              : "Thông báo"),
          message,
          type,
          confirmText: "Đã hiểu",
        });
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, title = "Thành công"): Promise<void> => {
      return showAlert(message, title, "success");
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, title = "Thông báo lỗi"): Promise<void> => {
      return showAlert(message, title, "error");
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title = "Cảnh báo"): Promise<void> => {
      return showAlert(message, title, "warning");
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (message: string, title = "Xác nhận hành động"): Promise<boolean> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setPopup({
          title,
          message,
          type: "warning",
          confirmText: "Đồng ý",
          cancelText: "Hủy bỏ",
        });
      });
    },
    []
  );

  const openPopup = useCallback((options: PopupOptions) => {
    setPopup(options);
  }, []);

  // Thay thế triệt để window.alert và window.confirm của trình duyệt
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    window.alert = (msg?: any) => {
      showAlert(String(msg ?? ""), "Thông báo", "info");
    };

    window.confirm = (msg?: any) => {
      showConfirm(String(msg ?? ""), "Xác nhận hành động");
      // Trả về false tạm thời cho synchronous call cũ, còn UI popup xịn vẫn kích hoạt
      return false;
    };

    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    };
  }, [showAlert, showConfirm]);

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && popup) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popup, handleCancel]);

  return (
    <PopupContext.Provider
      value={{
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        openPopup,
        closePopup,
      }}
    >
      {children}

      {/* Global Interactive Modal Popup */}
      {popup && (
        <div
          onClick={handleCancel}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#12141f] border border-slate-200 dark:border-indigo-900/60 rounded-3xl p-6 shadow-2xl shadow-indigo-950/40 text-center animate-in zoom-in-95 duration-200 space-y-4"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Icon Graphic */}
            <div className="flex justify-center pt-1">
              {popup.type === "error" && (
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center text-2xl shadow-inner">
                  ❌
                </div>
              )}
              {popup.type === "success" && (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-2xl shadow-inner">
                  ✅
                </div>
              )}
              {popup.type === "warning" && (
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                  ⚠️
                </div>
              )}
              {(!popup.type || popup.type === "info") && (
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-cyan-400 flex items-center justify-center text-2xl shadow-inner">
                  ✨
                </div>
              )}
            </div>

            {/* Title & Body */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {popup.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                {popup.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex items-center gap-2.5 pt-2 ${
                popup.cancelText ? "justify-center" : "justify-center"
              }`}
            >
              {popup.cancelText && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  {popup.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-98"
              >
                {popup.confirmText || "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
}
