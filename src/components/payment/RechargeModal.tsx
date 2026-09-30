"use client";

import React, { useState, useId, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PAYMENT_CONFIG } from "@/lib/payos";

export interface PresetPackage {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  price: number;
  credits: number;
  bonusCredits?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  description: string;
  features: string[];
}

export const PRESET_PACKAGES: PresetPackage[] = [
  {
    id: "pkg-starter",
    name: "Gói Dùng Thử",
    badge: "Khởi động nhẹ",
    badgeColor: "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30",
    price: 19000,
    credits: 65, // 50c + 15c thưởng (~292đ/c)
    bonusCredits: 15,
    description: "Trải nghiệm nhanh các trợ lý AI, giải bài tập, tạo ảnh hoặc dịch tài liệu tức thì.",
    features: [
      "50 Credits + 15 Credits thưởng thêm",
      "Tiết kiệm 30% so với mua lẻ từng credit",
      "Mở khóa tất cả 28+ trợ lý AI & bộ tạo ảnh",
      "Hạn dùng vĩnh viễn không bao giờ hết hạn",
    ],
  },
  {
    id: "pkg-standard",
    name: "Gói Tiêu Chuẩn",
    badge: "Bán chạy nhất 🔥",
    badgeColor: "bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/40",
    price: 49000,
    credits: 220, // 150c + 70c thưởng (~222đ/c)
    bonusCredits: 70,
    isPopular: true,
    description: "Lựa chọn được ưa chuộng nhất của học sinh, sinh viên và dân văn phòng sử dụng thường ngày.",
    features: [
      "150 Credits + 70 Credits tặng thêm (+47%)",
      "Chỉ ~222đ / credit (Nhiều hơn mua lẻ 50k đến 70 credits)",
      "Hỗ trợ phân tích ảnh đa phương thức & tạo ảnh HD",
      "Hàng chờ ưu tiên tốc độ cao thế hệ mới",
    ],
  },
  {
    id: "pkg-pro",
    name: "Gói Chuyên Nghiệp",
    badge: "Khuyên dùng ⭐",
    badgeColor: "bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/40",
    price: 99000,
    credits: 500, // 350c + 150c thưởng (~198đ/c)
    bonusCredits: 150,
    isRecommended: true,
    description: "Dành cho lập trình viên, content creator và chuyên gia nghiên cứu dữ liệu chuyên sâu.",
    features: [
      "350 Credits + 150 Credits tặng thêm (+43%)",
      "Chỉ ~198đ / credit (Tặng thêm hẳn 150 credits so với mua lẻ)",
      "Mở khóa chế độ Deep Reasoning & Claude Fable 5.1",
      "Phân tích code sâu & tạo tài liệu dài mượt mà",
      "Huy hiệu VIP Pro và ưu tiên máy chủ cao nhất",
    ],
  },
  {
    id: "pkg-ultimate",
    name: "Gói VIP Cả Tháng",
    badge: "Siêu ưu đãi -55%",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    price: 199000,
    credits: 1200, // 800c + 400c thưởng (~165đ/c)
    bonusCredits: 400,
    description: "Lựa chọn hoàn hảo để sử dụng thoải mái cả tháng không lo gián đoạn công việc sáng tạo.",
    features: [
      "800 Credits + 400 Credits thưởng khủng (+50%)",
      "Chỉ ~165đ / credit (Hời hơn mua lẻ 400 credits)",
      "Không giới hạn các model AI mạnh nhất",
      "Băng thông tạo ảnh và chat ưu tiên tuyệt đối",
    ],
  },
  {
    id: "pkg-master",
    name: "Gói Doanh Nhân & Master",
    badge: "Khủng nhất 👑",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    price: 349000,
    credits: 2500, // 1600c + 900c thưởng (~139đ/c)
    bonusCredits: 900,
    description: "Dành cho nhóm làm việc, coder và nhà sáng tạo nội dung cày cuốc cường độ cao.",
    features: [
      "1.600 Credits + 900 Credits thưởng cực đại (+56%)",
      "Chỉ ~139đ / credit (Mức giá tốt nhất toàn hệ thống)",
      "Mở toàn bộ đặc quyền VIP tối thượng",
      "Hỗ trợ kỹ thuật 1-1 và xử lý song song không giới hạn",
    ],
  },
];

// Định nghĩa các mốc nạp nhanh cố định (Exact VNĐ & tương ứng Credits)
export const QUICK_CUSTOM_AMOUNTS = [
  { vnd: 10000, credits: 25, label: "10k (25c)" },
  { vnd: 20000, credits: 50, label: "20k (50c)" },
  { vnd: 50000, credits: 140, label: "50k (140c)" },
  { vnd: 100000, credits: 300, label: "100k (300c)" },
  { vnd: 200000, credits: 650, label: "200k (650c)" },
  { vnd: 500000, credits: 1800, label: "500k (1.800c)" },
];

// Hàm tính giá tiền mua tùy ý theo số credits
export function calculateCustomPrice(credits: number): {
  unitPrice: number;
  totalPrice: number;
  discountPercent: number;
  savedAmount: number;
} {
  const basePricePerCredit = 400; // VNĐ gốc

  // Kiểm tra nếu số credits trùng khớp chính xác với mốc nhanh thì giữ đúng giá tiền mốc đó
  const matchedQuick = QUICK_CUSTOM_AMOUNTS.find((q) => q.credits === credits);
  if (matchedQuick) {
    const totalPrice = matchedQuick.vnd;
    const unitPrice = Math.round(totalPrice / credits);
    const originalPrice = credits * basePricePerCredit;
    const savedAmount = Math.max(0, originalPrice - totalPrice);
    const discountPercent = originalPrice > 0 ? Math.round((savedAmount / originalPrice) * 100) : 0;
    return { unitPrice, totalPrice, discountPercent, savedAmount };
  }

  let discountPercent = 0;
  if (credits >= 1000) {
    discountPercent = 30; // 280đ/c
  } else if (credits >= 600) {
    discountPercent = 22; // 312đ/c
  } else if (credits >= 300) {
    discountPercent = 16; // 336đ/c
  } else if (credits >= 100) {
    discountPercent = 8; // 368đ/c
  }

  const unitPrice = Math.round(basePricePerCredit * (1 - discountPercent / 100));
  // Làm tròn giá về bội số 1.000 VNĐ cho đẹp và chuẩn giao dịch ngân hàng
  const rawTotal = credits * unitPrice;
  const totalPrice = Math.max(10000, Math.round(rawTotal / 1000) * 1000);
  const originalPrice = credits * basePricePerCredit;
  const savedAmount = Math.max(0, originalPrice - totalPrice);

  return { unitPrice, totalPrice, discountPercent, savedAmount };
}

// Hàm quy đổi từ số tiền VNĐ sang số Credits tương ứng
export function calculateCreditsFromVnd(vnd: number): number {
  const safeVnd = Math.max(10000, Number(vnd) || 10000);
  const matchedQuick = QUICK_CUSTOM_AMOUNTS.find((q) => q.vnd === safeVnd);
  if (matchedQuick) {
    return matchedQuick.credits;
  }
  if (safeVnd >= 500000) {
    return Math.round(safeVnd / 280);
  } else if (safeVnd >= 200000) {
    return Math.round(safeVnd / 310);
  } else if (safeVnd >= 100000) {
    return Math.round(safeVnd / 335);
  } else if (safeVnd >= 40000) {
    return Math.round(safeVnd / 360);
  } else {
    return Math.max(25, Math.round(safeVnd / 400));
  }
}

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackageId?: string;
  initialCustomCredits?: number;
  autoCheckout?: boolean;
  customPriceOverride?: number;
}

export default function RechargeModal({
  isOpen,
  onClose,
  defaultPackageId,
  initialCustomCredits = 50,
  autoCheckout = false,
  customPriceOverride,
}: RechargeModalProps) {
  const { user, updateUserCredits } = useAuth();
  const { language, t } = useLanguage();
  const inputId = useId();

  // Mode: "select" (chọn số lượng/gói) | "checkout" (quét mã QR) | "success" (chúc mừng)
  const [step, setStep] = useState<"select" | "checkout" | "success">("select");
  const [activeTab, setActiveTab] = useState<"custom" | "package">("custom");

  // Custom amount state
  const [customCredits, setCustomCredits] = useState<number>(initialCustomCredits);
  const [customVndInput, setCustomVndInput] = useState<string>("");

  // Selected package state
  const [selectedPackage, setSelectedPackage] = useState<PresetPackage | null>(
    PRESET_PACKAGES.find((p) => p.id === defaultPackageId) || PRESET_PACKAGES[1]
  );

  // Checkout state
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "momo" | "card">("vietqr");
  const [orderCode, setOrderCode] = useState<string>("");
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>("");
  const [payosCheckoutUrl, setPayosCheckoutUrl] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string>("");
  const [successInfo, setSuccessInfo] = useState<{ creditsAdded: number; totalCredits: number } | null>(null);
  const [activeBankInfo, setActiveBankInfo] = useState<typeof PAYMENT_CONFIG>(PAYMENT_CONFIG);
  const [activeMemo, setActiveMemo] = useState<string>("");
  const [noticePopup, setNoticePopup] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Tính toán số tiền hiện tại tùy vào tab đang chọn
  const customPricing = calculateCustomPrice(customCredits);
  const checkoutPrice =
    activeTab === "package" && selectedPackage
      ? selectedPackage.price
      : customPricing.totalPrice;

  const checkoutCredits =
    activeTab === "package" && selectedPackage
      ? selectedPackage.credits
      : customCredits;

  const checkoutTitle =
    activeTab === "package" && selectedPackage
      ? selectedPackage.name
      : `Mua ${customCredits} Credits tùy ý`;

  // Tạo đơn hàng thanh toán qua API và chuyển sang bước checkout
  const initCheckout = async () => {
    if (!user) return;
    setIsCreatingOrder(true);
    setVerifyNotice("");

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: checkoutPrice,
          credits: checkoutCredits,
          packageName: checkoutTitle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderCode(String(data.orderCode));
        setDynamicQrUrl(data.qrCodeUrl || "");
        setPayosCheckoutUrl(data.checkoutUrl || null);
        if (data.bankInfo) setActiveBankInfo(data.bankInfo);
        if (data.memo) setActiveMemo(data.memo);
        setStep("checkout");
      } else {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setOrderCode(randomCode);
        setStep("checkout");
      }
    } catch {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOrderCode(randomCode);
      setStep("checkout");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Tự động kiểm tra trạng thái thanh toán Realtime qua Webhook / PayOS (Polling mỗi 2.5s)
  useEffect(() => {
    if (step !== "checkout" || !orderCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check-status?orderCode=${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID") {
            if (data.totalCredits !== undefined) {
              updateUserCredits(data.totalCredits);
            }
            setSuccessInfo({
              creditsAdded: data.creditsAdded || checkoutCredits,
              totalCredits: data.totalCredits || ((user?.credits ?? 0) + checkoutCredits),
            });
            setStep("success");
          }
        }
      } catch (err) {
        // bỏ qua lỗi mạng tạm thời khi polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [step, orderCode, checkoutCredits, user, updateUserCredits]);

  useEffect(() => {
    if (isOpen) {
      if (defaultPackageId) {
        const pkg = PRESET_PACKAGES.find((p) => p.id === defaultPackageId);
        if (pkg) {
          setSelectedPackage(pkg);
          setActiveTab("package");
        }
      }
      if (initialCustomCredits) {
        setCustomCredits(initialCustomCredits);
      }
      if (autoCheckout) {
        initCheckout();
      }
    } else {
      // Reset khi đóng
      setStep("select");
      setIsVerifying(false);
      setVerifyNotice("");
      setSuccessInfo(null);
      setPayosCheckoutUrl(null);
    }
  }, [isOpen, defaultPackageId, autoCheckout, initialCustomCredits]);

  if (!isOpen) return null;

  // Xử lý sao chép văn bản
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Xác nhận đã thanh toán -> Kiểm tra trạng thái đơn hàng thời gian thực
  const handleConfirmPayment = async () => {
    if (!user || !orderCode) return;
    setIsVerifying(true);
    setVerifyNotice(
      language === "en"
        ? "Verifying bank transfer with ACB / VietQR PRO..."
        : "Đang kết nối kiểm tra giao dịch với ACB / VietQR PRO..."
    );

    try {
      // 1. Kiểm tra trạng thái đơn hàng từ PayOS / Webhook
      const checkRes = await fetch(`/api/payment/check-status?orderCode=${orderCode}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.status === "PAID") {
          updateUserCredits(checkData.totalCredits);
          setSuccessInfo({
            creditsAdded: checkData.creditsAdded || checkoutCredits,
            totalCredits: checkData.totalCredits,
          });
          setStep("success");
          return;
        }
      }

      // Giả lập độ trễ kiểm tra
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 2. Thử kiểm tra lần 2 đề phòng webhook vừa đến
      const checkRes2 = await fetch(`/api/payment/check-status?orderCode=${orderCode}`);
      if (checkRes2.ok) {
        const checkData2 = await checkRes2.json();
        if (checkData2.status === "PAID") {
          updateUserCredits(checkData2.totalCredits);
          setSuccessInfo({
            creditsAdded: checkData2.creditsAdded || checkoutCredits,
            totalCredits: checkData2.totalCredits,
          });
          setStep("success");
          return;
        }
      }

      // 3. Nếu chưa thấy tiền về -> Hiển thị popup thông báo thân thiện (KHÔNG dùng alert của trình duyệt)
      setNoticePopup({
        title: language === "en" ? "Payment Not Received Yet" : "Chưa Nhận Được Giao Dịch Chuyển Khoản!",
        message:
          language === "en"
            ? `The banking system has not detected any incoming payment for order #OMNI${orderCode} yet.`
            : `Hệ thống ngân hàng ACB chưa ghi nhận giao dịch chuyển tiền cho đơn hàng #OMNI${orderCode}.`,
      });
    } catch (error) {
      console.error("Lỗi khi kiểm tra thanh toán:", error);
      setNoticePopup({
        title: language === "en" ? "Bank Sync in Progress" : "Đang Đồng Bộ Ngân Hàng...",
        message:
          language === "en"
            ? "We could not reach the payment gateway. If you already transferred, please wait 15-30 seconds, credits will be added automatically."
            : "Chưa ghi nhận tiền vào tài khoản. Nếu bạn đã hoàn tất chuyển khoản, xin vui lòng đợi 15-30 giây, hệ thống sẽ tự động cập nhật ngay nhé!",
      });
    } finally {
      setIsVerifying(false);
      setVerifyNotice("");
    }
  };

  // VietQR Dynamic URL (Tài khoản ACB Lê Hoàng Linh chuẩn VietQR PRO)
  const memoText = `OMNI ${orderCode}`;
  const vietQrUrl =
    dynamicQrUrl ||
    `https://img.vietqr.io/image/${PAYMENT_CONFIG.bankId}-${PAYMENT_CONFIG.accountNo}-compact2.png?amount=${checkoutPrice}&addInfo=${encodeURIComponent(
      memoText
    )}&accountName=${encodeURIComponent(PAYMENT_CONFIG.accountName)}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng"
        >
          ✕
        </button>

        {/* ======================================================== */}
        {/* BƯỚC 1: CHỌN SỐ LƯỢNG HOẶC GÓI NẠP (SELECT STEP) */}
        {/* ======================================================== */}
        {step === "select" && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d0e14]/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">
                  🪙
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Nạp Credits Trò Chuyện AI
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      Tự động 24/7
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Số dư hiện tại:{" "}
                    <strong className="text-amber-500 font-bold">
                      {user?.role === "ADMIN" ? "∞ Vô hạn" : `${user?.credits ?? 0} Credits`}
                    </strong>
                    {" • "}1 Credit dùng cho 1 lượt trò chuyện hoặc thao tác AI thông minh
                  </p>
                </div>
              </div>

              {/* Chuyển đổi giữa 2 hình thức: Mua Tùy Ý & Mua Theo Gói */}
              <div className="flex p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl mt-4">
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "custom"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span>⚡</span>
                  <span>Mua Tùy Ý (Muốn bao nhiêu mua bấy nhiêu)</span>
                </button>
                <button
                  onClick={() => setActiveTab("package")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "package"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span>🎁</span>
                  <span>Gói Tiết Kiệm (Nhiều Ưu Đãi)</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 flex-1">
              {/* TAB 1: MUA TÙY Ý */}
              {activeTab === "custom" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-500 block mb-0.5">
                        💡 Tỉ Giá & Bảng Chiết Khấu Tự Động (Tối ưu nhất thị trường):
                      </span>
                      <span>
                        Dưới 100c: <strong className="text-slate-900 dark:text-white">400đ</strong> • Từ 100c: <strong className="text-emerald-500">giảm 10% (360đ)</strong> • Từ 300c: <strong className="text-emerald-500">giảm 20% (320đ)</strong> • Từ 600c: <strong className="text-emerald-500">giảm 25% (300đ)</strong> • Từ 1.000c: <strong className="text-emerald-500">giảm 35% (260đ)</strong>
                      </span>
                    </div>
                  </div>

                  {/* Nhập 2 chiều: Số tiền VNĐ <-> Số Credits */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Ô nhập số tiền VNĐ */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Số tiền muốn nạp (VNĐ):
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="10000"
                            step="5000"
                            placeholder="Nhập số tiền..."
                            value={customPricing.totalPrice}
                            onChange={(e) => {
                              const val = Math.max(10000, Number(e.target.value) || 10000);
                              const calculatedCredits = calculateCreditsFromVnd(val);
                              setCustomCredits(calculatedCredits);
                            }}
                            className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl text-base font-black text-slate-900 dark:text-white focus:outline-hidden"
                          />
                          <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-bold">
                            VNĐ
                          </span>
                        </div>
                      </div>

                      {/* Ô nhập số Credits */}
                      <div>
                        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Số lượng Credits nhận được:
                        </label>
                        <div className="relative">
                          <input
                            id={inputId}
                            type="number"
                            min="10"
                            max="10000"
                            step="5"
                            value={customCredits}
                            onChange={(e) => {
                              const val = Math.max(10, Math.min(10000, Number(e.target.value) || 10));
                              setCustomCredits(val);
                            }}
                            className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-800 border-2 border-amber-500 rounded-xl text-base font-black text-amber-500 focus:outline-hidden"
                          />
                          <span className="absolute right-3.5 top-3 text-xs text-amber-500/80 font-bold">
                            Credits 🪙
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Range Slider */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Kéo thanh trượt để chỉnh nhanh:</span>
                        <strong className="text-amber-500 font-bold">{customCredits} Credits</strong>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="2500"
                        step="25"
                        value={customCredits}
                        onChange={(e) => setCustomCredits(Number(e.target.value))}
                        className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>25 credits (10.000đ)</span>
                        <span>500 credits (150.000đ)</span>
                        <span>2.500 credits (650.000đ)</span>
                      </div>
                    </div>

                    {/* Nút bấm nhanh (Quick VNĐ & Credits Pills) */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block mb-2">
                        Các mốc nạp nhanh phổ biến (Chuẩn VNĐ):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {QUICK_CUSTOM_AMOUNTS.map((item) => (
                          <button
                            key={item.credits}
                            type="button"
                            onClick={() => setCustomCredits(item.credits)}
                            className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                              customCredits === item.credits
                                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black"
                                : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div>{item.label}</div>
                            <div className={`text-[10px] ${customCredits === item.credits ? "text-slate-900" : "text-amber-500 font-semibold"}`}>
                              {item.vnd.toLocaleString("vi-VN")} đ
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hộp tổng kết thành tiền */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Đơn giá áp dụng:{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {customPricing.unitPrice.toLocaleString("vi-VN")} đ / credit
                        </strong>
                        {customPricing.discountPercent > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            Giảm {customPricing.discountPercent}% (Tiết kiệm{" "}
                            {customPricing.savedAmount.toLocaleString("vi-VN")}đ)
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black text-amber-500 mt-1">
                        {customPricing.totalPrice.toLocaleString("vi-VN")}{" "}
                        <span className="text-sm font-semibold text-slate-400">VNĐ</span>
                      </div>
                    </div>

                    <button
                      onClick={initCheckout}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>Tiến hành thanh toán</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MUA THEO GÓI */}
              {activeTab === "package" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {PRESET_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-lg shadow-amber-500/10"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {/* Badge nổi bật */}
                          {pkg.badge && (
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                                {pkg.badge}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          )}

                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                              {pkg.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {pkg.description}
                            </p>

                            <div className="my-3 flex items-baseline gap-2">
                              <span className="text-2xl font-black text-amber-500">
                                🪙 {pkg.credits}
                              </span>
                              <span className="text-xs font-medium text-slate-400">Credits</span>
                              {pkg.bonusCredits && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                                  +Tặng {pkg.bonusCredits}c
                                </span>
                              )}
                            </div>

                            <ul className="space-y-1.5 mb-4">
                              {pkg.features.map((feat, idx) => (
                                <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                  <span className="text-emerald-500 text-xs font-bold">✓</span>
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900 dark:text-white">
                              {pkg.price.toLocaleString("vi-VN")} đ
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPackage(pkg);
                                initCheckout();
                              }}
                              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950"
                              }`}
                            >
                              Chọn gói này
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nút thanh toán gói đã chọn */}
                  {selectedPackage && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Gói đang chọn:</span>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {selectedPackage.name} —{" "}
                          <strong className="text-amber-500">
                            {selectedPackage.price.toLocaleString("vi-VN")} đ
                          </strong>{" "}
                          ({selectedPackage.credits} Credits)
                        </div>
                      </div>
                      <button
                        onClick={initCheckout}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        Thanh toán gói ➔
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 2: MÀN HÌNH THANH TOÁN (CHECKOUT STEP) */}
        {/* ======================================================== */}
        {step === "checkout" && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Checkout Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d0e14]/50 flex items-center justify-between">
              <button
                onClick={() => setStep("select")}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại chọn gói</span>
              </button>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Tổng thanh toán
                </span>
                <span className="text-base font-black text-amber-500">
                  {checkoutPrice.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>

            {/* Checkout Body */}
            <div className="p-5 sm:p-6 space-y-6 flex-1">
              {/* Chọn phương thức thanh toán */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "vietqr", name: "VietQR Ngân Hàng", icon: "🏦", badge: "Khuyên dùng" },
                  { id: "momo", name: "Ví MoMo", icon: "📱", badge: "Nhanh chóng" },
                  { id: "card", name: "Thẻ Quốc Tế", icon: "💳", badge: "Visa/Master" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? "border-amber-500 bg-amber-500/10 text-amber-500"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{m.icon}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {m.name}
                    </div>
                    <span className="text-[9px] text-amber-500 font-semibold">{m.badge}</span>
                  </button>
                ))}
              </div>

              {/* Chi tiết theo phương thức */}
              {paymentMethod === "vietqr" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  {/* Mã QR */}
                  <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Header Ngân Hàng & VietQR PRO */}
                    <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="font-extrabold px-2 py-0.5 rounded-md bg-blue-600 text-white tracking-wide shadow-xs">
                        ACB
                      </span>
                      <span className="font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white tracking-wider shadow-xs text-[10px]">
                        VietQR PRO
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-inner">
                      <img
                        src={vietQrUrl}
                        alt="Mã QR Chuyển khoản VietQR PRO"
                        className="w-56 h-auto object-contain rounded-lg"
                      />
                    </div>

                    <div className="mt-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{language === "en" ? "Scan with any Banking App / MoMo" : "Quét mã bằng mọi app Ngân Hàng / MoMo"}</span>
                    </div>

                    {payosCheckoutUrl && (
                      <a
                        href={payosCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[11px] transition-colors"
                      >
                        <span>{language === "en" ? "Open PayOS Gateway" : "Mở cổng PayOS trực tuyến"}</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>

                  {/* Thông tin chuyển khoản sao chép 1 chạm */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === "en" ? "Manual Transfer Information" : "Thông tin chuyển khoản thủ công"}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Tự động duyệt 24/7
                      </span>
                    </div>

                    {/* Ngân hàng */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Ngân hàng</span>
                        <strong className="text-slate-900 dark:text-white font-bold text-xs">
                          {activeBankInfo.bankName}
                        </strong>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {activeBankInfo.bankId}
                      </span>
                    </div>

                    {/* Chủ tài khoản */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Chủ tài khoản</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs tracking-wide">
                          {activeBankInfo.accountName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeBankInfo.accountName, "name")}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        {copiedField === "name" ? "Đã copy ✓" : "Copy"}
                      </button>
                    </div>

                    {/* Số tài khoản */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Số tài khoản</span>
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm tracking-wider">
                          {activeBankInfo.accountDisplayNo || activeBankInfo.accountNo}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeBankInfo.accountNo, "account")}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        {copiedField === "account" ? "Đã copy ✓" : "Copy"}
                      </button>
                    </div>

                    {/* Số tiền */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Số tiền chính xác</span>
                        <span className="font-mono font-black text-amber-500 text-sm">
                          {checkoutPrice.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(checkoutPrice.toString(), "amount")}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        {copiedField === "amount" ? "Đã copy ✓" : "Copy"}
                      </button>
                    </div>

                    {/* Nội dung chuyển khoản */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border-2 border-rose-500">
                      <div>
                        <span className="text-[10px] text-rose-500 font-extrabold block">
                          Nội dung chuyển tiền (BẮT BUỘC)
                        </span>
                        <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm tracking-wider">
                          {activeMemo || `OMNI ${orderCode}`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeMemo || `OMNI ${orderCode}`, "memo")}
                        className="px-3 py-1.5 text-[11px] font-black rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-sm"
                      >
                        {copiedField === "memo" ? "Đã copy ✓" : "Copy"}
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      * Nhập chính xác nội dung <strong className="text-rose-500 font-mono">{activeMemo || `OMNI ${orderCode}`}</strong> để hệ thống tự động cộng Credits trong 5-10 giây.
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "momo" && (
                <div className="p-5 rounded-3xl bg-pink-500/5 border border-pink-500/20 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
                    📱
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Thanh toán MoMo bằng VietQR PRO
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Mở ứng dụng MoMo, bấm <strong className="text-pink-500">"Quét Mã"</strong> và quét mã QR VietQR PRO bên tab <strong className="text-amber-500">VietQR Ngân Hàng</strong> để chuyển trực tiếp đến ACB: <span className="font-mono font-bold text-slate-900 dark:text-white">2776 3051</span> ({PAYMENT_CONFIG.accountName}).
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPaymentMethod("vietqr")}
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Xem Mã QR VietQR để Quét bằng MoMo ➔
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs text-slate-500">
                    Hỗ trợ thẻ Visa, MasterCard, JCB phát hành tại Việt Nam và Quốc tế.
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Số thẻ (16 chữ số)"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nút Xác nhận đã chuyển khoản */}
              <div className="space-y-2">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Hệ thống đang kiểm tra giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Tôi Đã Chuyển Khoản Thành Công</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Hệ thống tự động kiểm tra và cộng <strong className="text-amber-500">+{checkoutCredits} Credits</strong> ngay khi nhận được tiền từ ngân hàng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 3: MÀN HÌNH CHÚC MỪNG (SUCCESS STEP) */}
        {/* ======================================================== */}
        {step === "success" && (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-4xl mx-auto shadow-inner border border-emerald-500/30">
              🎉
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Nạp Credits Thành Công!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Giao dịch mã <span className="font-mono font-bold text-amber-500">#OMNI{orderCode}</span> đã được ghi nhận.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Số Credits nạp:</span>
                <strong className="text-emerald-500 font-bold">
                  +{successInfo?.creditsAdded} Credits
                </strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Số dư tài khoản mới:</span>
                <strong className="text-amber-500 font-black text-sm">
                  🪙 {successInfo?.totalCredits} Credits
                </strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
            >
              Tiếp tục sử dụng AI ngay 🚀
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* POPUP THÔNG BÁO CHƯA NHẬN ĐƯỢC THANH TOÁN (INLINE MODAL) */}
        {/* ======================================================== */}
        {noticePopup && (
          <div
            onClick={() => setNoticePopup(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white dark:bg-[#141624] border border-amber-500/40 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-4"
            >
              {/* Nút đóng */}
              <button
                type="button"
                onClick={() => setNoticePopup(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
                ⏳
              </div>

              {/* Tiêu đề & Nội dung */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {noticePopup.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {noticePopup.message}
                </p>
              </div>

              {/* Hướng dẫn chi tiết */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2.5">
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-amber-500 font-bold shrink-0">1.</span>
                  <span>
                    {language === "en"
                      ? "If you have already paid, banking transfers usually take 10-30 seconds to sync."
                      : "Nếu bạn đã chuyển khoản, ngân hàng liên kết VietQR thường mất 10 - 30 giây để xử lý."}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-rose-500 font-bold shrink-0">2.</span>
                  <span>
                    {language === "en" ? (
                      <>
                        Please verify transfer amount <strong className="text-amber-500">{checkoutPrice.toLocaleString("vi-VN")} đ</strong> and memo <strong className="text-rose-500 font-mono">OMNI {orderCode}</strong>.
                      </>
                    ) : (
                      <>
                        Vui lòng kiểm tra đã chuyển đúng số tiền <strong className="text-amber-500">{checkoutPrice.toLocaleString("vi-VN")} đ</strong> và nội dung <strong className="text-rose-500 font-mono">OMNI {orderCode}</strong>.
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 font-bold shrink-0">3.</span>
                  <span>
                    {language === "en"
                      ? "Our system is actively listening. Credits will be automatically added as soon as the bank confirms!"
                      : "Hệ thống vẫn đang tự động lắng nghe và sẽ cộng Credits ngay lập tức khi tiền vào tài khoản!"}
                  </span>
                </div>
              </div>

              {/* Nút thao tác */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoticePopup(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === "en" ? "I'll wait" : "Đợi thêm 15s"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNoticePopup(null);
                    handleConfirmPayment();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {language === "en" ? "Check again ↻" : "Kiểm tra lại ↻"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
