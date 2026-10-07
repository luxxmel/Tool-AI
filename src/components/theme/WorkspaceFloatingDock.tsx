"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  useWorkspaceBackground,
  ParticleEffectType,
} from "@/context/WorkspaceBackgroundContext";
import { AmbientSoundType } from "@/utils/ambientSound";
import { useLanguage } from "@/context/LanguageContext";

interface WorkspaceFloatingDockProps {
  onOpenFullSettings: () => void;
}

export default function WorkspaceFloatingDock({ onOpenFullSettings }: WorkspaceFloatingDockProps) {
  const {
    bgName,
    bgPresetId,
    randomPreset,
    nextPreset,
    ambientSound,
    setAmbientSound,
    ambientVolume,
    setAmbientVolume,
    particlesEnabled,
    setParticlesEnabled,
    particleEffect,
    setParticleEffect,
    overlayOpacity,
    setOverlayOpacity,
    bgBlur,
    resetToDefault,
    fontFamily,
    presets,
    setPreset,
  } = useWorkspaceBackground();

  const { t, language } = useLanguage();

  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"none" | "sound" | "particles" | "theme" | "quick_tune">("none");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const currentPreset = presets.find((p) => p.id === bgPresetId);
  const displayBgName = language === "en" ? (currentPreset?.nameEn || currentPreset?.name || bgName) : bgName;

  const isCustomized =
    bgPresetId !== "default" ||
    ambientSound !== null ||
    (particlesEnabled && particleEffect !== "none") ||
    fontFamily !== "default" ||
    overlayOpacity > 0.05 ||
    bgBlur > 0;

  // Click outside to collapse sub-menus or collapse dock
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveMenu("none");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const soundOptions: { id: AmbientSoundType; name: string; icon: string; desc: string }[] = [
    {
      id: null,
      name: language === "en" ? "Mute sound" : "Tắt âm thanh",
      icon: "🔇",
      desc: language === "en" ? "Silent workspace" : "Không gian yên tĩnh",
    },
    {
      id: "rain",
      name: language === "en" ? "Gentle Rain" : "Mưa rơi êm dịu",
      icon: "🌧️",
      desc: language === "en" ? "Soothing rain sounds" : "Tiếng mưa rơi thư thái",
    },
    {
      id: "waves",
      name: language === "en" ? "Ocean Waves" : "Sóng biển vỗ",
      icon: "🌊",
      desc: language === "en" ? "Rhythmic ocean tide" : "Nhịp sóng biển dạt dào",
    },
    {
      id: "alpha",
      name: language === "en" ? "Alpha Waves 432Hz" : "Sóng não 432Hz",
      icon: "🧘",
      desc: language === "en" ? "Deep focus frequency" : "Tần số Alpha tập trung sâu",
    },
    {
      id: "campfire",
      name: language === "en" ? "Cozy Campfire" : "Lửa trại ấm cúng",
      icon: "🔥",
      desc: language === "en" ? "Warm crackling fire" : "Tiếng lửa tí tách ấm áp",
    },
  ];

  const particleOptions: { id: ParticleEffectType; name: string; icon: string }[] = [
    { id: "none", name: language === "en" ? "Default (Off)" : "Mặc định (Tắt hạt)", icon: "⚪" },
    { id: "stardust", name: language === "en" ? "Cosmic Stardust" : "Bụi sao tinh tú", icon: "✨" },
    { id: "cyber_rain", name: language === "en" ? "Neon Cyber Rain" : "Mưa neon Matrix", icon: "⚡" },
    { id: "fireflies", name: language === "en" ? "Warm Fireflies" : "Đom đóm ấm áp", icon: "🌟" },
    { id: "aurora_waves", name: language === "en" ? "Aurora Waves" : "Sóng cực quang", icon: "🌈" },
  ];

  return (
    <div ref={dockRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Toast Notification (Hiển thị phía trên Dock) */}
      {toastMsg && (
        <div className="mb-2 px-3.5 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 backdrop-blur-md flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Popups mở SỔ LÊN TRÊN (bottom-full mb-3) */}
      {/* Flyout 0: Theme Quick Switcher Menu */}
      {activeMenu === "theme" && (
        <div className="mb-3 w-72 p-3.5 rounded-2xl bg-white/95 dark:bg-[#0e101a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span>🎨</span>
              <span>{language === "en" ? "Quick Theme Switcher" : "Chọn nhanh Phông Nền"}</span>
            </div>
            <button
              type="button"
              onClick={randomPreset}
              className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🎲</span>
              <span>{language === "en" ? "Random" : "Đổi ngẫu nhiên"}</span>
            </button>
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {/* 1. Mặc định Bi?t Tu?t AI */}
            <button
              type="button"
              onClick={() => {
                resetToDefault();
                setActiveMenu("none");
                setToastMsg(language === "en" ? "Reset to default theme & effects!" : "Đã về Phông Nền & Hiệu ứng mặc định!");
                setTimeout(() => setToastMsg(null), 3000);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                bgPresetId === "default"
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#07080d] to-[#0d101d] border border-white/20 shrink-0" />
                <div>
                  <div className="text-xs font-bold">{language === "en" ? "✨ Bi?t Tu?t AI Default" : "✨ Mặc định Bi?t Tu?t AI"}</div>
                  <div className={`text-[10px] ${bgPresetId === "default" ? "text-white/80" : "text-slate-400"}`}>
                    {language === "en" ? "Original Cyber-Aurora dark theme" : "Nền đen Cyber-Aurora nguyên bản"}
                  </div>
                </div>
              </div>
              {bgPresetId === "default" && <span className="text-xs">✓</span>}
            </button>

            {/* Các theme phổ biến */}
            {presets.slice(1, 8).map((preset) => {
              const isSelected = bgPresetId === preset.id;
              const presetDisplayName = language === "en" ? (preset.nameEn || preset.name) : preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPreset(preset);
                    setActiveMenu("none");
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-lg border border-white/20 shrink-0 bg-cover bg-center"
                      style={{
                        background:
                          preset.type === "color"
                            ? preset.value
                            : preset.type === "gradient"
                            ? preset.value
                            : preset.previewGradient || `url(${preset.value})`,
                      }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate">{presetDisplayName}</div>
                      <div className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {preset.category === "color" ? (language === "en" ? "Color" : "Màu đơn") : preset.category === "gradient" ? (language === "en" ? "Gradient" : "Dải màu") : "4K"}
                      </div>
                    </div>
                  </div>
                  {isSelected && <span className="text-xs shrink-0">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Links */}
          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                resetToDefault();
                setActiveMenu("none");
                setToastMsg(language === "en" ? "Restored default theme & effects!" : "Đã khôi phục Font, Nền & Hiệu ứng mặc định!");
                setTimeout(() => setToastMsg(null), 3000);
              }}
              className="text-rose-500 hover:text-rose-600 text-[11px] font-bold cursor-pointer"
            >
              ↺ {language === "en" ? "Reset default" : "Khôi phục mặc định"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMenu("none");
                onOpenFullSettings();
              }}
              className="text-indigo-500 hover:text-indigo-400 text-[11px] font-bold cursor-pointer"
            >
              {language === "en" ? "View all →" : "Xem tất cả →"}
            </button>
          </div>
        </div>
      )}

      {/* Flyout 1: Soundscape Menu */}
      {activeMenu === "sound" && (
        <div className="mb-3 w-72 p-3.5 rounded-2xl bg-white/95 dark:bg-[#0e101a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span>🎧</span>
              <span>{language === "en" ? "Relaxing Ambient Sounds" : "Âm thanh thư giãn & tập trung"}</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-semibold">
              Web Audio 4D
            </span>
          </div>

          <div className="space-y-1">
            {soundOptions.map((opt) => {
              const isSelected = ambientSound === opt.id;
              return (
                <button
                  key={String(opt.id)}
                  type="button"
                  onClick={() => setAmbientSound(opt.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{opt.icon}</span>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{opt.name}</div>
                      <div className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {ambientSound && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span>{language === "en" ? "Sound volume:" : "Âm lượng âm thanh:"}</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Flyout 2: Particles Menu */}
      {activeMenu === "particles" && (
        <div className="mb-3 w-64 p-3.5 rounded-2xl bg-white/95 dark:bg-[#0e101a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span>✨</span>
              <span>{language === "en" ? "Interactive Mouse Particles" : "Hiệu ứng hạt tương tác chuột"}</span>
            </div>
          </div>

          <div className="space-y-1">
            {particleOptions.map((opt) => {
              const isSelected = particlesEnabled && particleEffect === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (opt.id === "none") {
                      setParticlesEnabled(false);
                      setParticleEffect("none");
                    } else {
                      setParticlesEnabled(true);
                      setParticleEffect(opt.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-semibold">{opt.name}</span>
                  </div>
                  {isSelected && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bar / Collapsed Floating Bubble */}
      {!isDockExpanded ? (
        /* Nút thu gọn tròn góc phải dưới màn hình */
        <button
          type="button"
          onClick={() => setIsDockExpanded(true)}
          className="group relative p-3 rounded-full bg-white/90 dark:bg-[#0c0e18]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/20 shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          title="Mở thanh hiệu ứng & Phông nền Workspace"
        >
          <div className="relative">
            <span className="text-lg">🎨</span>
            {ambientSound && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            )}
            {particlesEnabled && particleEffect !== "none" && (
              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 pr-1 hidden sm:inline group-hover:inline">
            Hiệu ứng & Nền
          </span>
          <span className="text-[10px] text-slate-400">▲</span>
        </button>
      ) : (
        /* Floating Menu khi mở rộng (SỔ LÊN TRÊN THEO CHIỀU DỌC) */
        <div className="flex flex-col gap-1.5 p-2 rounded-3xl bg-white/95 dark:bg-[#0c0e18]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/20 shadow-2xl shadow-black/30 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 min-w-[210px]">
          {/* Header với nút thu gọn */}
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200/80 dark:border-white/10 px-2 pt-1">
            <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>🎨</span>
              <span>Giao diện & Nền</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsDockExpanded(false);
                setActiveMenu("none");
              }}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold cursor-pointer transition-colors"
              title="Thu gọn"
            >
              <span>✕</span>
            </button>
          </div>

          {/* 1. Next / Shuffle / Menu Wallpaper Button */}
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === "theme" ? "none" : "theme")}
            className={`w-full p-2 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
              activeMenu === "theme"
                ? "bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-bold border border-indigo-500/30"
                : "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  randomPreset();
                }}
                className="group-hover:rotate-45 transition-transform duration-300 p-0.5 text-base"
                title="Đổi ngẫu nhiên"
              >
                🎲
              </span>
              <div className="truncate text-left">
                <div className="text-[10px] text-slate-400">Phông nền:</div>
                <div className="font-bold truncate text-xs">{displayBgName}</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeMenu === "theme" ? "▲" : "◀"}
            </span>
          </button>

          {/* 2. Ambient Soundscape Toggle Button */}
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === "sound" ? "none" : "sound")}
            className={`w-full p-2 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              ambientSound
                ? "bg-indigo-500/15 text-indigo-600 dark:text-cyan-400 font-bold border border-indigo-500/30"
                : "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-base ${ambientSound ? "animate-pulse" : ""}`}>
                {ambientSound === "rain"
                  ? "🌧️"
                  : ambientSound === "waves"
                  ? "🌊"
                  : ambientSound === "alpha"
                  ? "🧘"
                  : ambientSound === "campfire"
                  ? "🔥"
                  : "🎧"}
              </span>
              <div className="text-left">
                <div className="text-[10px] text-slate-400">Âm thanh 4D:</div>
                <div className="font-bold text-xs">
                  {ambientSound ? (language === "en" ? "Playing" : "Đang phát") : (language === "en" ? "Muted" : "Đang tắt")}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeMenu === "sound" ? "▲" : "◀"}
            </span>
          </button>

          {/* 3. Particle Canvas Toggle */}
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === "particles" ? "none" : "particles")}
            className={`w-full p-2 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              particlesEnabled && particleEffect !== "none"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold"
                : "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <div className="text-left">
                <div className="text-[10px] text-slate-400">Hiệu ứng bụi sao:</div>
                <div className="font-bold text-xs">
                  {particlesEnabled && particleEffect !== "none" ? "Bụi sao live" : "Đang tắt"}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeMenu === "particles" ? "▲" : "◀"}
            </span>
          </button>

          {/* 4. Open Full Studio Settings */}
          <button
            type="button"
            onClick={() => {
              setIsDockExpanded(false);
              onOpenFullSettings();
            }}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <span>🎨</span>
            <span>Mở Studio Toàn Diện</span>
          </button>

          {/* 5. Reset to Default */}
          <button
            type="button"
            onClick={() => {
              resetToDefault();
              setToastMsg(language === "en" ? "Restored default theme & effects!" : "Đã khôi phục Font, Nền & Hiệu ứng mặc định!");
              setTimeout(() => setToastMsg(null), 3000);
            }}
            className={`w-full p-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              isCustomized
                ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20 font-bold"
                : "border-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
            }`}
          >
            <span>↺</span>
            <span className="text-[11px]">{language === "en" ? "Reset Default" : "Khôi phục mặc định"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
