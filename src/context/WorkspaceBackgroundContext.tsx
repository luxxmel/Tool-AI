"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ambientSoundEngine, AmbientSoundType } from "@/utils/ambientSound";

export type BackgroundType = "default" | "color" | "gradient" | "image" | "custom";
export type ParticleEffectType = "none" | "stardust" | "cyber_rain" | "fireflies" | "aurora_waves";
export type GlassStyle = "frosted" | "ultra_clear" | "deep_solid";
export type FontFamilyType = "default" | "inter" | "vietnam" | "mono" | "serif";

export interface FontOption {
  id: FontFamilyType;
  name: string;
  desc: string;
  css: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "default",
    name: "Mặc định (Geist Sans)",
    desc: "Phông chữ chuẩn mực, hiện đại của Biết Tuốt AI",
    css: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: "inter",
    name: "Hiện đại (Inter)",
    desc: "Tối giản, chuẩn quốc tế cho công nghệ",
    css: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: "vietnam",
    name: "Tinh tế (Be Vietnam Pro)",
    desc: "Tối ưu hóa hiển thị dấu tiếng Việt sắc nét",
    css: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: "mono",
    name: "Lập trình (Geist Mono)",
    desc: "Phong cách coder, công nghệ và dữ liệu",
    css: "var(--font-geist-mono), 'Fira Code', monospace",
  },
  {
    id: "serif",
    name: "Cổ điển (Merriweather)",
    desc: "Sang trọng, trang nhã như trang sách",
    css: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
];

export interface BackgroundPreset {
  id: string;
  name: string;
  nameEn?: string;
  type: BackgroundType;
  value: string;
  previewGradient?: string;
  category: "color" | "gradient" | "wallpaper";
  description?: string;
  descriptionEn?: string;
  recommendedSound?: AmbientSoundType;
  recommendedParticles?: ParticleEffectType;
  accentGlow?: string;
}

export const WORKSPACE_BACKGROUND_PRESETS: BackgroundPreset[] = [
  // --- DEFAULT ---
  {
    id: "default",
    name: "Mặc định Biết Tuốt AI",
    nameEn: "Biết Tuốt AI Default",
    type: "default",
    value: "#07080d",
    previewGradient: "linear-gradient(135deg, #07080d 0%, #0d101d 100%)",
    category: "color",
    description: "Nền đen huyền bí tiêu chuẩn của Biết Tuốt AI",
    recommendedSound: null,
    recommendedParticles: "stardust",
    accentGlow: "#6366f1",
  },

  // --- SOLID COLORS ---
  {
    id: "color_slate",
    name: "Đá phiến Slate",
    nameEn: "Modern Slate",
    type: "color",
    value: "#0f172a",
    previewGradient: "#0f172a",
    category: "color",
    description: "Xanh xám đá trầm ấm, phong cách developer hiện đại",
    recommendedSound: "waves",
    recommendedParticles: "stardust",
    accentGlow: "#38bdf8",
  },
  {
    id: "color_navy",
    name: "Biển đêm Midnight Navy",
    nameEn: "Midnight Navy",
    type: "color",
    value: "#0a1128",
    previewGradient: "#0a1128",
    category: "color",
    description: "Xanh đại dương sâu thẳm, dịu mắt khi làm việc đêm",
    recommendedSound: "waves",
    recommendedParticles: "aurora_waves",
    accentGlow: "#0284c7",
  },
  {
    id: "color_charcoal",
    name: "Than chì Charcoal",
    nameEn: "Minimal Charcoal",
    type: "color",
    value: "#121316",
    previewGradient: "#121316",
    category: "color",
    description: "Xám than chì tối giản, sang trọng và thanh lịch",
    recommendedSound: "alpha",
    recommendedParticles: "stardust",
    accentGlow: "#a855f7",
  },
  {
    id: "color_forest",
    name: "Rừng đêm Deep Forest",
    nameEn: "Deep Forest",
    type: "color",
    value: "#051610",
    previewGradient: "#051610",
    category: "color",
    description: "Xanh ngọc lục bảo thẫm, thư thái và giảm căng thẳng",
    recommendedSound: "rain",
    recommendedParticles: "fireflies",
    accentGlow: "#10b981",
  },
  {
    id: "color_plum",
    name: "Rượu vang Midnight Plum",
    nameEn: "Midnight Plum",
    type: "color",
    value: "#180816",
    previewGradient: "#180816",
    category: "color",
    description: "Màu mận chín bí ẩn, khơi gợi cảm hứng sáng tạo",
    recommendedSound: "alpha",
    recommendedParticles: "aurora_waves",
    accentGlow: "#ec4899",
  },
  {
    id: "color_light",
    name: "Trắng tối giản Pure Light",
    nameEn: "Pure Light Minimal",
    type: "color",
    value: "#f8fafc",
    previewGradient: "#f8fafc",
    category: "color",
    description: "Tông màu sáng sạch sẽ, tinh gọn",
    recommendedSound: "rain",
    recommendedParticles: "none",
    accentGlow: "#6366f1",
  },

  // --- MESH GRADIENTS ---
  {
    id: "grad_aurora",
    name: "Cực quang Aurora",
    nameEn: "Aurora Borealis",
    type: "gradient",
    value: "linear-gradient(135deg, #070b14 0%, #0d1e3a 35%, #064e3b 70%, #082f49 100%)",
    previewGradient: "linear-gradient(135deg, #070b14 0%, #0d1e3a 35%, #064e3b 70%, #082f49 100%)",
    category: "gradient",
    description: "Ánh sáng phương Bắc kỳ ảo hòa quyện xanh ngọc & lam thẫm",
    recommendedSound: "waves",
    recommendedParticles: "aurora_waves",
    accentGlow: "#2dd4bf",
  },
  {
    id: "grad_cyberpunk",
    name: "Cyberpunk Neon",
    nameEn: "Cyberpunk Neon",
    type: "gradient",
    value: "linear-gradient(135deg, #090a10 0%, #2b0938 45%, #052935 100%)",
    previewGradient: "linear-gradient(135deg, #090a10 0%, #2b0938 45%, #052935 100%)",
    category: "gradient",
    description: "Phong cách tương lai Tokyo với sắc tím neon và xanh ngọc",
    recommendedSound: "rain",
    recommendedParticles: "cyber_rain",
    accentGlow: "#06b6d4",
  },
  {
    id: "grad_sunset",
    name: "Hoàng hôn Sunset Ember",
    nameEn: "Sunset Ember",
    type: "gradient",
    value: "linear-gradient(135deg, #0d0a0b 0%, #3e1215 45%, #1f140a 100%)",
    previewGradient: "linear-gradient(135deg, #0d0a0b 0%, #3e1215 45%, #1f140a 100%)",
    category: "gradient",
    description: "Tia nắng ấm hoàng hôn buông xuống chân trời ấm áp",
    recommendedSound: "campfire",
    recommendedParticles: "fireflies",
    accentGlow: "#f59e0b",
  },
  {
    id: "grad_cosmos",
    name: "Vũ trụ Deep Cosmos",
    nameEn: "Deep Cosmos",
    type: "gradient",
    value: "linear-gradient(135deg, #05050d 0%, #1a0b36 45%, #0d1f3d 100%)",
    previewGradient: "linear-gradient(135deg, #05050d 0%, #1a0b36 45%, #0d1f3d 100%)",
    category: "gradient",
    description: "Tinh vân sâu trong vũ trụ với sắc tím thạch anh huyền diệu",
    recommendedSound: "alpha",
    recommendedParticles: "stardust",
    accentGlow: "#8b5cf6",
  },
  {
    id: "grad_rose",
    name: "Thạch anh Rose Quartz",
    nameEn: "Rose Quartz",
    type: "gradient",
    value: "linear-gradient(135deg, #160e15 0%, #2e1223 50%, #130e1c 100%)",
    previewGradient: "linear-gradient(135deg, #160e15 0%, #2e1223 50%, #130e1c 100%)",
    category: "gradient",
    description: "Sắc hồng tím mờ ảo sang trọng, nhẹ nhàng tinh tế",
    recommendedSound: "alpha",
    recommendedParticles: "aurora_waves",
    accentGlow: "#f43f5e",
  },
  {
    id: "grad_emerald",
    name: "Ngọc bích Emerald Matrix",
    nameEn: "Emerald Matrix",
    type: "gradient",
    value: "linear-gradient(135deg, #05110d 0%, #0a3327 50%, #061e22 100%)",
    previewGradient: "linear-gradient(135deg, #05110d 0%, #0a3327 50%, #061e22 100%)",
    category: "gradient",
    description: "Sắc ngọc bích ma trận công nghệ đẳng cấp",
    recommendedSound: "rain",
    recommendedParticles: "cyber_rain",
    accentGlow: "#10b981",
  },
  {
    id: "grad_azure",
    name: "Lam ngọc Royal Azure",
    nameEn: "Royal Azure",
    type: "gradient",
    value: "linear-gradient(135deg, #060b19 0%, #0c2b57 50%, #08162e 100%)",
    previewGradient: "linear-gradient(135deg, #060b19 0%, #0c2b57 50%, #08162e 100%)",
    category: "gradient",
    description: "Xanh hoàng gia sâu thẳm, quyền lực và tập trung cao độ",
    recommendedSound: "waves",
    recommendedParticles: "stardust",
    accentGlow: "#3b82f6",
  },

  // --- CURATED 4K WALLPAPERS ---
  {
    id: "wall_digital_flow",
    name: "Sóng lụa 3D Flow",
    type: "image",
    value: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Những dải lụa kỹ thuật số 3D trừu tượng đầy nghệ thuật",
    recommendedSound: "alpha",
    recommendedParticles: "aurora_waves",
    accentGlow: "#a855f7",
  },
  {
    id: "wall_cyberpunk_city",
    name: "Tokyo Cyberpunk",
    type: "image",
    value: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Thành phố Tokyo rực rỡ ánh đèn neon về đêm",
    recommendedSound: "rain",
    recommendedParticles: "cyber_rain",
    accentGlow: "#06b6d4",
  },
  {
    id: "wall_nebula",
    name: "Dải ngân hà Vũ trụ",
    type: "image",
    value: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Ngàn vì tinh tú và mây vũ trụ sâu thẳm trong không gian",
    recommendedSound: "alpha",
    recommendedParticles: "stardust",
    accentGlow: "#c084fc",
  },
  {
    id: "wall_nordic_forest",
    name: "Rừng sương Bắc Âu",
    type: "image",
    value: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Khu rừng thông mù sương tĩnh mịch, thanh bình tuyệt đối",
    recommendedSound: "rain",
    recommendedParticles: "fireflies",
    accentGlow: "#34d399",
  },
  {
    id: "wall_minimal_arch",
    name: "Kiến trúc Tối giản",
    type: "image",
    value: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Đường cong kiến trúc ánh sáng hiện đại và tinh khiết",
    recommendedSound: "alpha",
    recommendedParticles: "none",
    accentGlow: "#cbd5e1",
  },
  {
    id: "wall_sunset_peaks",
    name: "Đỉnh núi Hoàng hôn",
    type: "image",
    value: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Dãy núi hùng vĩ trong ánh chiều tà rực rỡ",
    recommendedSound: "campfire",
    recommendedParticles: "fireflies",
    accentGlow: "#fb923c",
  },
  {
    id: "wall_rainy_city",
    name: "Đêm mưa Đô thị",
    type: "image",
    value: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Ánh đèn phản chiếu trên mặt đường ướt mưa lãng mạn",
    recommendedSound: "rain",
    recommendedParticles: "cyber_rain",
    accentGlow: "#38bdf8",
  },
  {
    id: "wall_cozy_loft",
    name: "Góc học tập Cozy Loft",
    type: "image",
    value: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=2000&q=80",
    previewGradient: "url(https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=400&q=70)",
    category: "wallpaper",
    description: "Không gian làm việc ấm cúng bên khung cửa sổ",
    recommendedSound: "campfire",
    recommendedParticles: "fireflies",
    accentGlow: "#fbbf24",
  },
];

interface WorkspaceBackgroundContextType {
  bgType: BackgroundType;
  bgValue: string;
  bgName: string;
  bgPresetId: string;
  overlayOpacity: number; // 0 to 0.95
  bgBlur: number; // 0 to 24px
  accentGlow: string;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  particlesEnabled: boolean;
  particleEffect: ParticleEffectType;
  glassStyle: GlassStyle;
  fontFamily: FontFamilyType;
  fontOptions: FontOption[];
  setFontFamily: (font: FontFamilyType) => void;
  setPreset: (preset: BackgroundPreset) => void;
  setCustomImage: (url: string, name?: string) => void;
  setOverlayOpacity: (opacity: number) => void;
  setBgBlur: (blur: number) => void;
  setAmbientSound: (sound: AmbientSoundType) => void;
  setAmbientVolume: (vol: number) => void;
  setParticlesEnabled: (enabled: boolean) => void;
  setParticleEffect: (effect: ParticleEffectType) => void;
  setGlassStyle: (style: GlassStyle) => void;
  randomPreset: () => void;
  nextPreset: () => void;
  resetToDefault: () => void;
  presets: BackgroundPreset[];
}

const WorkspaceBackgroundContext = createContext<WorkspaceBackgroundContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TYPE: "omni_ws_bg_type",
  VALUE: "omni_ws_bg_value",
  NAME: "omni_ws_bg_name",
  PRESET_ID: "omni_ws_bg_preset_id",
  OPACITY: "omni_ws_bg_opacity",
  BLUR: "omni_ws_bg_blur",
  PARTICLES_ENABLED: "omni_ws_particles_enabled",
  PARTICLE_EFFECT: "omni_ws_particle_effect",
  GLASS_STYLE: "omni_ws_glass_style",
  AMBIENT_VOLUME: "omni_ws_ambient_volume",
  FONT_FAMILY: "omni_ws_font_family",
};

export function WorkspaceBackgroundProvider({ children }: { children: React.ReactNode }) {
  const [bgType, setBgType] = useState<BackgroundType>("default");
  const [bgValue, setBgValue] = useState<string>("#07080d");
  const [bgName, setBgName] = useState<string>("Mặc định Biết Tuốt AI");
  const [bgPresetId, setBgPresetId] = useState<string>("default");
  const [overlayOpacity, setOverlayOpacityState] = useState<number>(0.65);
  const [bgBlur, setBgBlurState] = useState<number>(0);
  const [accentGlow, setAccentGlow] = useState<string>("#6366f1");

  // Premium Features
  const [ambientSound, setAmbientSoundState] = useState<AmbientSoundType>(null);
  const [ambientVolume, setAmbientVolumeState] = useState<number>(0.35);
  const [particlesEnabled, setParticlesEnabledState] = useState<boolean>(true);
  const [particleEffect, setParticleEffectState] = useState<ParticleEffectType>("stardust");
  const [glassStyle, setGlassStyleState] = useState<GlassStyle>("frosted");
  const [fontFamily, setFontFamilyState] = useState<FontFamilyType>("default");

  const applyFontFamily = (font: FontFamilyType) => {
    if (typeof document === "undefined") return;
    const opt = FONT_OPTIONS.find((f) => f.id === font) || FONT_OPTIONS[0];
    document.documentElement.style.setProperty("--app-font-family", opt.css);
  };

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedType = localStorage.getItem(STORAGE_KEYS.TYPE) as BackgroundType | null;
      const savedValue = localStorage.getItem(STORAGE_KEYS.VALUE);
      const savedName = localStorage.getItem(STORAGE_KEYS.NAME);
      const savedPresetId = localStorage.getItem(STORAGE_KEYS.PRESET_ID);
      const savedOpacity = localStorage.getItem(STORAGE_KEYS.OPACITY);
      const savedBlur = localStorage.getItem(STORAGE_KEYS.BLUR);
      const savedParticles = localStorage.getItem(STORAGE_KEYS.PARTICLES_ENABLED);
      const savedEffect = localStorage.getItem(STORAGE_KEYS.PARTICLE_EFFECT) as ParticleEffectType | null;
      const savedGlass = localStorage.getItem(STORAGE_KEYS.GLASS_STYLE) as GlassStyle | null;
      const savedVol = localStorage.getItem(STORAGE_KEYS.AMBIENT_VOLUME);
      const savedFont = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY) as FontFamilyType | null;

      if (savedType) setBgType(savedType);
      if (savedValue) setBgValue(savedValue);
      if (savedName) setBgName(savedName);
      if (savedPresetId) {
        setBgPresetId(savedPresetId);
        const matched = WORKSPACE_BACKGROUND_PRESETS.find((p) => p.id === savedPresetId);
        if (matched?.accentGlow) setAccentGlow(matched.accentGlow);
      }
      if (savedOpacity !== null) setOverlayOpacityState(parseFloat(savedOpacity));
      if (savedBlur !== null) setBgBlurState(parseInt(savedBlur, 10));
      if (savedParticles !== null) setParticlesEnabledState(savedParticles !== "false");
      if (savedEffect) setParticleEffectState(savedEffect);
      if (savedGlass) setGlassStyleState(savedGlass);
      if (savedVol !== null) setAmbientVolumeState(parseFloat(savedVol));
      if (savedFont) {
        setFontFamilyState(savedFont);
        applyFontFamily(savedFont);
      }
    } catch (e) {
      console.error("Lỗi khi tải cấu hình không gian làm việc từ localStorage:", e);
    }
  }, []);

  const setPreset = (preset: BackgroundPreset) => {
    setBgType(preset.type);
    setBgValue(preset.value);
    setBgName(preset.name);
    setBgPresetId(preset.id);
    if (preset.accentGlow) setAccentGlow(preset.accentGlow);

    // Auto adjust overlay opacity depending on type
    let defaultOpacity = 0.65;
    if (preset.type === "default") defaultOpacity = 0;
    else if (preset.type === "color") defaultOpacity = 0;
    else if (preset.type === "gradient") defaultOpacity = 0.2;
    else if (preset.type === "image") defaultOpacity = 0.65;

    setOverlayOpacityState(defaultOpacity);

    // Auto switch particles to match preset vibe if stardust
    if (preset.recommendedParticles && particlesEnabled) {
      setParticleEffectState(preset.recommendedParticles);
      try {
        localStorage.setItem(STORAGE_KEYS.PARTICLE_EFFECT, preset.recommendedParticles);
      } catch {}
    }

    try {
      localStorage.setItem(STORAGE_KEYS.TYPE, preset.type);
      localStorage.setItem(STORAGE_KEYS.VALUE, preset.value);
      localStorage.setItem(STORAGE_KEYS.NAME, preset.name);
      localStorage.setItem(STORAGE_KEYS.PRESET_ID, preset.id);
      localStorage.setItem(STORAGE_KEYS.OPACITY, defaultOpacity.toString());
    } catch (e) {
      console.error("Lỗi khi lưu hình nền vào localStorage:", e);
    }
  };

  const setCustomImage = (url: string, name = "Hình nền tùy chỉnh") => {
    setBgType("custom");
    setBgValue(url);
    setBgName(name);
    setBgPresetId("custom");
    setOverlayOpacityState(0.65);
    setAccentGlow("#6366f1");

    try {
      localStorage.setItem(STORAGE_KEYS.TYPE, "custom");
      localStorage.setItem(STORAGE_KEYS.VALUE, url);
      localStorage.setItem(STORAGE_KEYS.NAME, name);
      localStorage.setItem(STORAGE_KEYS.PRESET_ID, "custom");
      localStorage.setItem(STORAGE_KEYS.OPACITY, "0.65");
    } catch (e) {
      console.error("Lỗi khi lưu hình nền tùy chỉnh vào localStorage:", e);
    }
  };

  const setOverlayOpacity = (opacity: number) => {
    const clamped = Math.max(0, Math.min(0.95, opacity));
    setOverlayOpacityState(clamped);
    try {
      localStorage.setItem(STORAGE_KEYS.OPACITY, clamped.toString());
    } catch (e) {
      console.error("Lỗi khi lưu độ mờ overlay:", e);
    }
  };

  const setBgBlur = (blur: number) => {
    const clamped = Math.max(0, Math.min(25, blur));
    setBgBlurState(clamped);
    try {
      localStorage.setItem(STORAGE_KEYS.BLUR, clamped.toString());
    } catch (e) {
      console.error("Lỗi khi lưu độ mờ blur:", e);
    }
  };

  const setAmbientSound = (sound: AmbientSoundType) => {
    setAmbientSoundState(sound);
    if (!sound) {
      ambientSoundEngine.stop();
    } else {
      ambientSoundEngine.play(sound, ambientVolume);
    }
  };

  const setAmbientVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setAmbientVolumeState(clamped);
    ambientSoundEngine.setVolume(clamped);
    try {
      localStorage.setItem(STORAGE_KEYS.AMBIENT_VOLUME, clamped.toString());
    } catch {}
  };

  const setParticlesEnabled = (enabled: boolean) => {
    setParticlesEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.PARTICLES_ENABLED, enabled ? "true" : "false");
    } catch {}
  };

  const setParticleEffect = (effect: ParticleEffectType) => {
    setParticleEffectState(effect);
    try {
      localStorage.setItem(STORAGE_KEYS.PARTICLE_EFFECT, effect);
    } catch {}
  };

  const setGlassStyle = (style: GlassStyle) => {
    setGlassStyleState(style);
    try {
      localStorage.setItem(STORAGE_KEYS.GLASS_STYLE, style);
    } catch {}
  };

  const randomPreset = () => {
    const available = WORKSPACE_BACKGROUND_PRESETS.filter((p) => p.id !== bgPresetId);
    if (available.length === 0) return;
    const randomIndex = Math.floor(Math.random() * available.length);
    setPreset(available[randomIndex]);
  };

  const nextPreset = () => {
    const currentIndex = WORKSPACE_BACKGROUND_PRESETS.findIndex((p) => p.id === bgPresetId);
    const nextIndex = (currentIndex + 1) % WORKSPACE_BACKGROUND_PRESETS.length;
    setPreset(WORKSPACE_BACKGROUND_PRESETS[nextIndex]);
  };

  const setFontFamily = (font: FontFamilyType) => {
    setFontFamilyState(font);
    applyFontFamily(font);
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_FAMILY, font);
    } catch {}
  };

  const resetToDefault = () => {
    setBgType("default");
    setBgValue("#07080d");
    setBgName("Mặc định Biết Tuốt AI");
    setBgPresetId("default");
    setOverlayOpacityState(0);
    setBgBlurState(0);
    setAccentGlow("#6366f1");
    setParticlesEnabledState(false);
    setParticleEffectState("none");
    setGlassStyleState("frosted");
    setAmbientSound(null);
    setFontFamilyState("default");
    applyFontFamily("default");

    try {
      localStorage.removeItem(STORAGE_KEYS.TYPE);
      localStorage.removeItem(STORAGE_KEYS.VALUE);
      localStorage.removeItem(STORAGE_KEYS.NAME);
      localStorage.removeItem(STORAGE_KEYS.PRESET_ID);
      localStorage.removeItem(STORAGE_KEYS.OPACITY);
      localStorage.removeItem(STORAGE_KEYS.BLUR);
      localStorage.removeItem(STORAGE_KEYS.PARTICLES_ENABLED);
      localStorage.removeItem(STORAGE_KEYS.PARTICLE_EFFECT);
      localStorage.removeItem(STORAGE_KEYS.GLASS_STYLE);
      localStorage.removeItem(STORAGE_KEYS.FONT_FAMILY);
      localStorage.removeItem(STORAGE_KEYS.AMBIENT_VOLUME);
    } catch (e) {
      console.error("Lỗi khi khôi phục nền mặc định:", e);
    }
  };

  return (
    <WorkspaceBackgroundContext.Provider
      value={{
        bgType,
        bgValue,
        bgName,
        bgPresetId,
        overlayOpacity,
        bgBlur,
        accentGlow,
        ambientSound,
        ambientVolume,
        particlesEnabled,
        particleEffect,
        glassStyle,
        fontFamily,
        fontOptions: FONT_OPTIONS,
        setFontFamily,
        setPreset,
        setCustomImage,
        setOverlayOpacity,
        setBgBlur,
        setAmbientSound,
        setAmbientVolume,
        setParticlesEnabled,
        setParticleEffect,
        setGlassStyle,
        randomPreset,
        nextPreset,
        resetToDefault,
        presets: WORKSPACE_BACKGROUND_PRESETS,
      }}
    >
      {children}
    </WorkspaceBackgroundContext.Provider>
  );
}

export function useWorkspaceBackground(): WorkspaceBackgroundContextType {
  const context = useContext(WorkspaceBackgroundContext);
  if (!context) {
    throw new Error("useWorkspaceBackground phải được dùng bên trong WorkspaceBackgroundProvider");
  }
  return context;
}
