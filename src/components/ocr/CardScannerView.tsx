"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import RechargeModal from "@/components/payment/RechargeModal";
import { compressImage } from "@/lib/imageUtils";

export interface ScannedContact {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  socials: string;
  notes: string;
  imagePreview?: string;
  scannedAt: string;
}

interface CardScannerViewProps {
  onOpenLoginModal?: () => void;
}

export default function CardScannerView({ onOpenLoginModal }: CardScannerViewProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Danh sách danh thiếp đã quét
  const [contacts, setContacts] = useState<ScannedContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Trạng thái quét & camera
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Đọc danh thiếp đã lưu từ LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("omni_scanned_cards");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setContacts(parsed);
          if (parsed.length > 0) {
            setSelectedContactId(parsed[0].id);
          }
        }
      }
    } catch {}
  }, []);

  // Lưu danh thiếp vào LocalStorage khi danh sách thay đổi
  const saveContacts = (updated: ScannedContact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem("omni_scanned_cards", JSON.stringify(updated.slice(0, 100)));
    } catch {}
  };

  // Toast thông báo
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mở Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Ưu tiên camera sau trên điện thoại
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Không thể mở Camera. Vui lòng cấp quyền truy cập Camera trên trình duyệt của bạn hoặc chọn tải ảnh từ máy."
      );
      setIsCameraActive(false);
    }
  };

  // Dừng Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Chụp ảnh từ Camera
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    handleProcessImage(dataUrl);
  };

  // Xử lý chọn file ảnh từ máy
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1600, 0.9);
      if (dataUrl) {
        handleProcessImage(dataUrl);
      }
    } catch (err) {
      showToast("Lỗi đọc file ảnh");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Gửi ảnh lên API để trích xuất dữ liệu AI Vision
  const handleProcessImage = async (imageBase64: string) => {
    setPreviewImage(imageBase64);
    setIsScanning(true);

    try {
      const res = await fetch("/api/card-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          userId: user?.id,
        }),
      });

      if (res.status === 401) {
        onOpenLoginModal?.();
        setIsScanning(false);
        return;
      }
      if (res.status === 403) {
        setShowRechargeModal(true);
        setIsScanning(false);
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Quét ảnh thất bại");
      }

      const data = json.data;
      const newContact: ScannedContact = {
        id: `card_${Date.now()}`,
        fullName: data.fullName || "Chưa rõ họ tên",
        jobTitle: data.jobTitle || "",
        company: data.company || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        website: data.website || "",
        socials: data.socials || "",
        notes: data.notes || "",
        imagePreview: imageBase64,
        scannedAt: new Date().toLocaleString("vi-VN"),
      };

      const updated = [newContact, ...contacts];
      saveContacts(updated);
      setSelectedContactId(newContact.id);
      showToast("✨ Đã trích xuất thông tin danh thiếp thành công!");
    } catch (err: any) {
      console.error("Scan error:", err);
      showToast(err.message || "Không thể quét danh thiếp.");
    } finally {
      setIsScanning(false);
    }
  };

  // Cập nhật giá trị trường dữ liệu của contact
  const handleUpdateContact = (id: string, field: keyof ScannedContact, val: string) => {
    const updated = contacts.map((c) => (c.id === id ? { ...c, [field]: val } : c));
    saveContacts(updated);
  };

  // Xóa một danh thiếp
  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    saveContacts(updated);
    if (selectedContactId === id) {
      setSelectedContactId(updated.length > 0 ? updated[0].id : null);
    }
    showToast("Đã xóa danh thiếp khỏi danh sách.");
  };

  // Xóa toàn bộ
  const handleClearAll = () => {
    if (contacts.length === 0) return;
    if (confirm("Bạn có chắc chắn muốn xóa tất cả danh thiếp đã quét?")) {
      saveContacts([]);
      setSelectedContactId(null);
      showToast("Đã dọn dẹp sạch danh thiếp.");
    }
  };

  // Xuất file CSV / Excel (có BOM UTF-8 để tiếng Việt không bị lỗi font)
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      showToast("Chưa có dữ liệu danh thiếp để xuất file!");
      return;
    }

    const headers = [
      "Họ và Tên",
      "Chức Vụ",
      "Công Ty",
      "Số Điện Thoại",
      "Email",
      "Địa Chỉ",
      "Website",
      "Mạng Xã Hội",
      "Ghi Chú / Dịch Vụ",
      "Thời Gian Quét",
    ];

    const rows = contacts.map((c) => [
      `"${(c.fullName || "").replace(/"/g, '""')}"`,
      `"${(c.jobTitle || "").replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${(c.website || "").replace(/"/g, '""')}"`,
      `"${(c.socials || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      `"${(c.scannedAt || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Danh_Sach_Card_Visit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Đã tải file Excel/CSV thành công!");
  };

  // Mở trực tiếp trên Google Sheets (sao chép bảng TSV chuẩn vào Clipboard rồi mở sheets.new)
  const handleOpenGoogleSheets = () => {
    if (contacts.length === 0) {
      showToast("Chưa có danh thiếp nào để mở trên Google Sheets!");
      return;
    }

    const headers = [
      "Họ và Tên",
      "Chức Vụ",
      "Công Ty",
      "Số Điện Thoại",
      "Email",
      "Địa Chỉ",
      "Website",
      "Mạng Xã Hội",
      "Ghi Chú / Dịch Vụ",
      "Thời Gian Quét",
    ];

    const rows = contacts.map((c) => [
      c.fullName,
      c.jobTitle,
      c.company,
      c.phone,
      c.email,
      c.address,
      c.website,
      c.socials,
      c.notes,
      c.scannedAt,
    ]);

    // Dùng Tab (\t) để khi Ctrl+V vào Google Sheets sẽ tự động nhảy ô chính xác
    const tsvContent = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");

    navigator.clipboard.writeText(tsvContent).then(
      () => {
        showToast("📋 Đã copy toàn bộ dữ liệu! Đang mở Google Sheets mới, hãy nhấn Ctrl + V để dán...");
        setTimeout(() => {
          window.open("https://sheets.new", "_blank");
        }, 1200);
      },
      () => {
        window.open("https://sheets.new", "_blank");
      }
    );
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0] || null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-xl">
          <span className="text-xl">✨</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900/90 border border-blue-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              AI VISION INTEL OCR 2.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Quét Card Visit & Trích Xuất Data</span>
              <span className="text-amber-400 text-xl sm:text-2xl">📇</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Dùng Camera quét danh thiếp / tài liệu hoặc tải ảnh lên. AI sẽ tự động bóc tách Họ tên, Số điện thoại, Email, Công ty, Chức vụ và cho phép xuất trực tiếp ra Google Sheets & Excel.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Nút bật Camera */}
            <button
              onClick={() => {
                if (isCameraActive) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{isCameraActive ? "Tắt Camera" : "Mở Camera Quét"}</span>
            </button>

            {/* Nút Upload Ảnh */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tải Ảnh Lên</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Camera Live Modal / Stream View */}
      {isCameraActive && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-blue-500 bg-black shadow-2xl p-4 flex flex-col items-center">
          <div className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Khung ngắm Card Visit */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-cyan-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1"></div>
                <div className="w-6 h-6 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1"></div>
              </div>
              <p className="text-center text-xs sm:text-sm font-semibold text-cyan-200 bg-slate-950/70 py-1 px-3 rounded-full self-center backdrop-blur-md">
                Đặt card visit nằm gọn trong khung ngắm
              </p>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1"></div>
                <div className="w-6 h-6 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1"></div>
              </div>
            </div>
          </div>

          {/* Action Bar dưới Camera */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={captureFromCamera}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="w-3 h-3 rounded-full bg-slate-950 animate-ping"></span>
              <span>Chụp & Phân Tích Ngay</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-5 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <span>⚠️</span>
          <span>{cameraError}</span>
        </div>
      )}

      {/* Scanning Indicator Spinner */}
      {isScanning && (
        <div className="rounded-3xl border border-blue-500/40 bg-slate-900/90 p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-cyan-400 animate-spin"></div>
            <span className="absolute text-2xl animate-pulse">🔍</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-cyan-300">
              AI Vision đang đọc & bóc tách từng thông tin trên danh thiếp...
            </h3>
            <p className="text-xs text-slate-400">
              Nhận diện Họ tên, Chức vụ, Số điện thoại, Email, Website và Địa chỉ công ty
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace: 2 Cột (Trái: Bảng danh sách & Xuất file | Phải: Xem chi tiết & Form sửa) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 cột): Danh sách & Bảng dữ liệu đã quét */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0f111c] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Toolbar Cột Trái */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Dữ Liệu Đã Quét
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                {contacts.length} thẻ
              </span>
            </div>

            {/* Các nút Export */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={contacts.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Tải file Excel / CSV về máy"
              >
                <span>📊</span>
                <span>Xuất Excel (.csv)</span>
              </button>

              <button
                onClick={handleOpenGoogleSheets}
                disabled={contacts.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-cyan-400 border border-blue-500/30 text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Sao chép dữ liệu & mở Google Sheets mới"
              >
                <span>📑</span>
                <span>Mở Google Sheets</span>
              </button>

              {contacts.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Xóa tất cả"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Table / List View */}
          {contacts.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl">
                📇
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Chưa có danh thiếp nào được quét
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Bấm <strong>&quot;Mở Camera Quét&quot;</strong> hoặc <strong>&quot;Tải Ảnh Lên&quot;</strong> ở trên để bóc tách thông tin danh thiếp tự động.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {contacts.map((c) => {
                const isSelected = c.id === selectedContactId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContactId(c.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 shadow-md"
                        : "bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {c.imagePreview ? (
                        <img
                          src={c.imagePreview}
                          alt="Card"
                          className="w-12 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs shrink-0">
                          📇
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {c.fullName || "Chưa rõ tên"}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {c.jobTitle && <span className="font-medium text-blue-600 dark:text-cyan-400">{c.jobTitle}</span>}
                          {c.company && <span>• {c.company}</span>}
                        </div>
                        {c.phone && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            📞 {c.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(c.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (5 cột): Form Chi Tiết & Chỉnh Sửa Dữ Liệu */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0f111c] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span>Chi Tiết Dữ Liệu Thẻ</span>
              <span className="text-xs font-normal text-slate-400">(Có thể sửa trực tiếp)</span>
            </h3>
            {selectedContact && (
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedContact.scannedAt}
              </span>
            )}
          </div>

          {!selectedContact ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
              Chọn một danh thiếp từ danh sách bên trái hoặc quét mới để xem & chỉnh sửa.
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Ảnh gốc xem trước */}
              {selectedContact.imagePreview && (
                <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 max-h-48 flex items-center justify-center">
                  <img
                    src={selectedContact.imagePreview}
                    alt="Card Preview"
                    className="w-full h-full max-h-48 object-contain"
                  />
                </div>
              )}

              {/* Form Input các trường */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    👤 Họ và Tên:
                  </label>
                  <input
                    type="text"
                    value={selectedContact.fullName}
                    onChange={(e) => handleUpdateContact(selectedContact.id, "fullName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      💼 Chức Vụ:
                    </label>
                    <input
                      type="text"
                      value={selectedContact.jobTitle}
                      onChange={(e) => handleUpdateContact(selectedContact.id, "jobTitle", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="Giám đốc kinh doanh"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      🏢 Công Ty:
                    </label>
                    <input
                      type="text"
                      value={selectedContact.company}
                      onChange={(e) => handleUpdateContact(selectedContact.id, "company", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="Công ty Cổ phần ABC"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      📞 Số Điện Thoại:
                    </label>
                    <input
                      type="text"
                      value={selectedContact.phone}
                      onChange={(e) => handleUpdateContact(selectedContact.id, "phone", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="0912 345 678"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      ✉️ Email:
                    </label>
                    <input
                      type="email"
                      value={selectedContact.email}
                      onChange={(e) => handleUpdateContact(selectedContact.id, "email", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="contact@abc.vn"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    📍 Địa Chỉ:
                  </label>
                  <input
                    type="text"
                    value={selectedContact.address}
                    onChange={(e) => handleUpdateContact(selectedContact.id, "address", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="Tầng 5, Tòa nhà Landmark, TP.HCM"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      🌐 Website:
                    </label>
                    <input
                      type="text"
                      value={selectedContact.website}
                      onChange={(e) => handleUpdateContact(selectedContact.id, "website", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://abc.com"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      📱 Mạng Xã Hội:
                    </label>
                    <input
                      type="text"
                      value={selectedContact.socials}
                      onChange={(e) => handleUpdateContact(selectedContact.id, "socials", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="Zalo: 0912345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    📝 Ghi Chú / Dịch Vụ:
                  </label>
                  <textarea
                    rows={2}
                    value={selectedContact.notes}
                    onChange={(e) => handleUpdateContact(selectedContact.id, "notes", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Chuyên gia tư vấn giải pháp chuyển đổi số..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nạp tiền */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
        />
      )}
    </div>
  );
}
