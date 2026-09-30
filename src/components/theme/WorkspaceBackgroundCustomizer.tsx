"use client";

import React, { useState, useRef } from "react";
import {
  useWorkspaceBackground,
  WORKSPACE_BACKGROUND_PRESETS,
  BackgroundPreset,
  ParticleEffectType,
  GlassStyle,
} from "@/context/WorkspaceBackgroundContext";
import { AmbientSoundType } from "@/utils/ambientSound";
import { useLanguage } from "@/context/LanguageContext";

export default function WorkspaceBackgroundCustomizer() {
  const {
    bgType,
    bgValue,
    bgName,
    bgPresetId,
    overlayOpacity,
    bgBlur,
    accentGlow,
    ambientSound,
    setAmbientSound,
    ambientVolume,
    setAmbientVolume,
    particlesEnabled,
    setParticlesEnabled,
    particleEffect,
    setParticleEffect,
    glassStyle,
    setGlassStyle,
    randomPreset,
    setPreset,
    setCustomImage,
    setOverlayOpacity,
    setBgBlur,
    resetToDefault,
    fontFamily,
    setFontFamily,
    fontOptions,
  } = useWorkspaceBackground();

  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<"all" | "fonts" | "wallpaper" | "gradient" | "color" | "custom">("all");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPresets = WORKSPACE_BACKGROUND_PRESETS.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setUrlError("Vui lòng nhập đường dẫn hình ảnh hợp lệ (http/https)");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("data:image/")) {
      setUrlError("Đường dẫn phải bắt đầu bằng https://");
      return;
    }

    setCustomImage(trimmed, "Ảnh từ liên kết");
    setUploadSuccess("Đã áp dụng ảnh nền từ URL thành công!");
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUrlError("Chỉ chấp nhận các tệp hình ảnh (PNG, JPG, WEBP, GIF, SVG).");
      return;
    }

    // Limit file size to 4.5MB
    if (file.size > 4.5 * 1024 * 1024) {
      setUrlError("Ảnh quá lớn. Vui lòng chọn ảnh dung lượng dưới 4MB để tối ưu hiệu năng.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomImage(reader.result, file.name || "Ảnh tải lên");
        setUploadSuccess(`Đã tải lên và áp dụng ảnh nền "${file.name}"!`);
        setTimeout(() => setUploadSuccess(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const soundOptions: { id: AmbientSoundType; name: string; icon: string; desc: string }[] = [
    { id: null, name: "Tắt âm thanh", icon: "🔇", desc: "Không phát âm nền" },
    { id: "rain", name: "Mưa rơi êm dịu", icon: "🌧️", desc: "Mưa rơi thanh lọc tâm trí" },
    { id: "waves", name: "Sóng biển vỗ", icon: "🌊", desc: "Nhịp sóng dạt dào êm ả" },
    { id: "alpha", name: "Sóng não 432Hz", icon: "🧘", desc: "Binaural Alpha tập trung sâu" },
    { id: "campfire", name: "Lửa trại ấm cúng", icon: "🔥", desc: "Gỗ cháy tí tách ấm áp" },
  ];

  const particleStyles: { id: ParticleEffectType; name: string; icon: string; desc: string }[] = [
    { id: "stardust", name: "Bụi sao tinh tú", icon: "✨", desc: "Hạt sáng lơ lửng ngân hà" },
    { id: "cyber_rain", name: "Mưa neon Matrix", icon: "⚡", desc: "Vệt sáng kỹ thuật số rơi" },
    { id: "fireflies", name: "Đom đóm ấm áp", icon: "🌟", desc: "Đốm vàng chuyển động hữu cơ" },
    { id: "aurora_waves", name: "Sóng cực quang", icon: "🌈", desc: "Ánh sáng ngọc bích chuyển sắc" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("bg.title", "Studio Giao diện & Không gian Làm việc")}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-500 dark:text-cyan-400 border border-indigo-500/30">
              Ultra Pro 4D
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cá nhân hóa mọi giác quan: hình nền 4K, dải màu cực quang, âm thanh thư giãn và hạt sáng tương tác chuột.
          </p>
        </div>

        {/* Action Buttons: Surprise Me + Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={randomPreset}
            className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-cyan-400 font-bold transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
            title="Đổi hình nền ngẫu nhiên đẹp mắt"
          >
            <span>🎲</span>
            <span>Surprise Me</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetToDefault();
              setUploadSuccess("Đã khôi phục Font chữ, Phông nền và Hiệu ứng về mặc định!");
              setTimeout(() => setUploadSuccess(null), 3000);
            }}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center gap-1.5 font-bold hover:scale-105 shadow-xs"
            title="Khôi phục toàn bộ phông nền, font chữ và hiệu ứng về mặc định ban đầu"
          >
            <span>↺</span>
            <span>Mặc định (Font, Nền, Hiệu ứng)</span>
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{uploadSuccess}</span>
        </div>
      )}

      {urlError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <span>⚠️</span>
          <span>{urlError}</span>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Mock background layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
          style={{
            backgroundColor: bgType === "color" || bgType === "default" ? bgValue : undefined,
            backgroundImage:
              bgType === "gradient"
                ? bgValue
                : bgType === "image" || bgType === "custom"
                ? `url(${bgValue})`
                : undefined,
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
            transform: bgBlur > 0 ? "scale(1.08)" : undefined,
          }}
        />

        {/* Dynamic Glow Accent */}
        <div
          className="absolute top-0 right-1/4 w-72 h-44 rounded-full blur-[90px] opacity-30 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentGlow || "#6366f1" }}
        />

        {/* Mock Dimming Overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: `rgba(7, 8, 13, ${overlayOpacity})`,
          }}
        />

        {/* Content Mockup on top */}
        <div className="relative z-10 p-5 sm:p-6 backdrop-blur-xs flex flex-col justify-between min-h-[150px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 animate-pulse" />
              <span className="text-xs font-bold text-white drop-shadow-md">
                {t("bg.currently_using", "Đang áp dụng:")} {bgName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {ambientSound && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-semibold">
                  <span>🔊</span>
                  <span>{soundOptions.find((s) => s.id === ambientSound)?.name}</span>
                </span>
              )}
              {particlesEnabled && particleEffect !== "none" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold">
                  <span>✨</span>
                  <span>{particleStyles.find((p) => p.id === particleEffect)?.name}</span>
                </span>
              )}
            </div>
          </div>

          {/* Sample Chat Message Mockup */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
              ✦
            </div>
            <div
              className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-lg max-w-md ${
                glassStyle === "ultra_clear"
                  ? "bg-white/40 dark:bg-[#0c0e17]/50 border-white/20 text-white"
                  : glassStyle === "deep_solid"
                  ? "bg-slate-900/95 border-slate-800 text-white"
                  : "bg-white/85 dark:bg-[#0c0e17]/90 border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100"
              }`}
            >
              <p className="text-xs font-medium leading-relaxed">
                {t("bg.sample_preview", "Khung trò chuyện hiển thị rõ ràng, độ tương phản sắc nét trên nền bạn đã chọn.")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 1: Ambient Focus Soundscapes */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Âm thanh nền thư giãn & tập trung (Soundscapes)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-extrabold uppercase">
                  Procedural Audio
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Tạo tiếng mưa rơi, sóng biển hoặc tần số sóng não 432Hz trực tiếp bằng Web Audio API
              </p>
            </div>
          </div>

          {ambientSound && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs">🔊</span>
              <span className="text-xs text-slate-500 font-medium">Âm lượng:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-cyan-400 font-bold min-w-8 text-right">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {soundOptions.map((opt) => {
            const isSelected = ambientSound === opt.id;
            return (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => setAmbientSound(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-cyan-300 font-bold shadow-xs ring-1 ring-indigo-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="text-xl mb-1.5">{opt.icon}</div>
                <div>
                  <div className="text-xs font-bold leading-tight">{opt.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature 2: Interactive Particles & Glass Styles */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Interactive Particles */}
        <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Hiệu ứng hạt động (Live Particles)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setParticlesEnabled(!particlesEnabled)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                particlesEnabled
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {particlesEnabled ? "Đang Bật ✓" : "Đã Tắt"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {particleStyles.map((item) => {
              const isSelected = particlesEnabled && particleEffect === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setParticlesEnabled(true);
                    setParticleEffect(item.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold ring-1 ring-purple-500/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{item.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Glass Card Transparency Style */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💎</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Độ trong suốt thẻ Chat
            </h4>
          </div>

          <div className="space-y-2 pt-1">
            {[
              { id: "frosted", label: "❄️ Mờ sương (Frosted)", sub: "Cân bằng tối ưu độ đọc & thẩm mỹ" },
              { id: "ultra_clear", label: "💎 Trong suốt (Ultra Clear)", sub: "Nhìn thấu hình nền phía sau" },
              { id: "deep_solid", label: "🛡️ Tối sâu (Solid Focus)", sub: "Tập trung tối đa vào văn bản" },
            ].map((glass) => (
              <button
                key={glass.id}
                type="button"
                onClick={() => setGlassStyle(glass.id as GlassStyle)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  glassStyle === glass.id
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-cyan-300 font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{glass.label}</div>
                  <div className="text-[10px] text-slate-400">{glass.sub}</div>
                </div>
                {glassStyle === glass.id && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
        {[
          { id: "all", label: "✨ Tất cả", icon: "✨" },
          { id: "fonts", label: "🔤 Kiểu chữ (Font)", icon: "🔤" },
          { id: "wallpaper", label: "🖼️ Hình nền 4K", icon: "🖼️" },
          { id: "gradient", label: "🌈 Dải màu Mesh", icon: "🌈" },
          { id: "color", label: "🎨 Màu đơn sắc", icon: "🎨" },
          { id: "custom", label: "📁 Tự tải lên / URL", icon: "📁" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Font Selection Section */}
      {(activeCategory === "fonts" || activeCategory === "all") && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔤</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Phông chữ & Kiểu hiển thị (Typography)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tùy biến phông chữ toàn hệ thống — Tối ưu hiển thị văn bản và đọc chữ êm mắt
                </p>
              </div>
            </div>
            {fontFamily !== "default" && (
              <button
                type="button"
                onClick={() => {
                  setFontFamily("default");
                  setUploadSuccess("Đã đặt lại font chữ mặc định (Geist Sans)!");
                  setTimeout(() => setUploadSuccess(null), 2500);
                }}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-bold cursor-pointer flex items-center gap-1"
              >
                <span>↺</span>
                <span>Về font mặc định</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {fontOptions.map((font) => {
              const isSelected = fontFamily === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    setFontFamily(font.id);
                    setUploadSuccess(`Đã áp dụng kiểu chữ "${font.name}"!`);
                    setTimeout(() => setUploadSuccess(null), 2500);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {font.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2">
                    {font.desc}
                  </div>
                  <div
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 text-xs text-slate-800 dark:text-slate-200 truncate font-medium border border-slate-200/50 dark:border-slate-800/50"
                    style={{ fontFamily: font.css }}
                  >
                    Khai phá tri thức & Sáng tạo vô hạn
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Upload / URL Section */}
      {(activeCategory === "custom" || activeCategory === "all") && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>📁</span>
              <span>{t("bg.custom_heading", "Tải ảnh từ máy tính hoặc dán URL")}</span>
            </h4>
            <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (&lt; 4MB)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* File Upload Button */}
            <div className="sm:col-span-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[42px] px-3.5 py-2.5 rounded-xl border border-dashed border-indigo-400 dark:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{t("bg.upload_btn", "Tải ảnh từ máy tính...")}</span>
              </button>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleApplyCustomUrl} className="sm:col-span-7 flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/wallpaper.jpg"
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                {t("bg.apply_btn", "Áp dụng")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Presets Gallery Grid */}
      {activeCategory !== "custom" && activeCategory !== "fonts" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPresets.map((preset) => {
            const isSelected = bgPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPreset(preset)}
                className={`relative group flex flex-col rounded-2xl overflow-hidden border transition-all text-left cursor-pointer p-1.5 ${
                  isSelected
                    ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5 shadow-md"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:shadow-md"
                }`}
              >
                {/* Visual Swatch / Image Box */}
                <div
                  className="w-full h-24 rounded-xl relative overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{
                    backgroundColor: preset.type === "color" || preset.type === "default" ? preset.value : undefined,
                    backgroundImage:
                      preset.type === "gradient"
                        ? preset.value
                        : preset.type === "image"
                        ? preset.previewGradient || `url(${preset.value})`
                        : undefined,
                  }}
                >
                  {/* Subtle darkening so label text in card is clear */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Active Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                      <span>✓</span>
                    </div>
                  )}

                  {/* Preset Badges */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-xs text-white/90">
                      {preset.category === "color" ? "Màu sắc" : preset.category === "gradient" ? "Dải màu" : "Hình nền 4K"}
                    </span>
                    {preset.recommendedSound && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        {preset.recommendedSound === "rain" ? "🌧️" : preset.recommendedSound === "waves" ? "🌊" : "🧘"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title & Desc */}
                <div className="px-1.5 pt-2 pb-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {preset.name}
                  </div>
                  {preset.description && (
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {preset.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Fine-Tuning Controls: Overlay Opacity & Blur Sliders */}
      {bgType !== "default" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-base">🎛️</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t("bg.adjust_title", "Tinh chỉnh độ hiển thị & Đọc chữ tối ưu")}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t("bg.adjust_subtitle", "Đảm bảo nội dung trò chuyện luôn có độ tương phản cao, êm mắt khi làm việc")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Overlay Opacity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>🌑</span>
                  <span>{t("bg.dimming", "Độ phủ tối (Dimming Overlay)")}</span>
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
                  {Math.round(overlayOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.95"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Sáng rõ ảnh)</span>
                <span>50% (Cân bằng)</span>
                <span>95% (Tối sâu)</span>
              </div>
            </div>

            {/* Blur Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>💧</span>
                  <span>{t("bg.blur", "Độ làm mờ nền (Backdrop Blur)")}</span>
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
                  {bgBlur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={bgBlur}
                onChange={(e) => setBgBlur(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0px (Sắc nét)</span>
                <span>10px (Mờ dịu mắt)</span>
                <span>24px (Mờ sâu)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
