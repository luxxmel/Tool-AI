// Utility for playing high-quality, soothing Vietnamese Neural TTS audio across the app

let globalAudio: HTMLAudioElement | null = null;
let currentPlayingId: string | null = null;

export function stopVietnameseTTS() {
  if (globalAudio) {
    try {
      globalAudio.pause();
      globalAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    globalAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
  currentPlayingId = null;
}

export function isAudioPlaying(id: string): boolean {
  return currentPlayingId === id;
}

export interface PlayTTSOptions {
  voice?: "female" | "male" | "tong_tai" | "female_sweet" | string; // female: Hoài My, male: Nam Minh, tong_tai: Nam thần phim lồng tiếng
  rate?: number; // browser playbackRate multiplier (mặc định 1.0 để giữ nguyên chất giọng truyền cảm tự nhiên)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export async function playVietnameseTTS(
  id: string,
  text: string,
  options?: PlayTTSOptions
): Promise<boolean> {
  // If the same message is currently playing, toggle it off
  if (currentPlayingId === id) {
    stopVietnameseTTS();
    options?.onEnd?.();
    return false;
  }

  // Stop any other playing audio
  stopVietnameseTTS();
  currentPlayingId = id;

  if (typeof window === "undefined") return false;

  const voice = options?.voice || "female";
  options?.onStart?.();

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      throw new Error(`TTS server status: ${res.status}`);
    }

    if (currentPlayingId !== id) return false;

    const blob = await res.blob();
    if (currentPlayingId !== id) return false;

    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    globalAudio = audio;
    audio.playbackRate = options?.rate ?? 1.0;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (currentPlayingId === id) {
        currentPlayingId = null;
        globalAudio = null;
      }
      options?.onEnd?.();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      if (currentPlayingId === id) {
        currentPlayingId = null;
        globalAudio = null;
      }
      options?.onEnd?.();
    };

    await audio.play();
    return true;
  } catch (err) {
    console.warn("TTS fetch/play error:", err);
    // Chỉ fallback sang SpeechSynthesis nếu máy tính của người dùng có cài giọng tiếng Việt chuẩn
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const voices = window.speechSynthesis.getVoices();
        const hasViVoice = voices.some((v) => v.lang.startsWith("vi"));
        if (hasViVoice) {
          const cleanText = text.replace(/[*#`_~\[\]|]/g, "").trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = "vi-VN";
          utterance.rate = 0.95;
          utterance.onend = () => {
            if (currentPlayingId === id) currentPlayingId = null;
            options?.onEnd?.();
          };
          utterance.onerror = () => {
            if (currentPlayingId === id) currentPlayingId = null;
            options?.onEnd?.();
          };
          window.speechSynthesis.speak(utterance);
          return true;
        }
      } catch (e) {
        // ignore
      }
    }
    if (currentPlayingId === id) {
      currentPlayingId = null;
      globalAudio = null;
    }
    options?.onEnd?.();
    return false;
  }
}

export async function downloadVietnameseTTS(
  text: string,
  voice: string = "tong_tai",
  filename: string = "omni-ai-voice.mp3"
): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });
    if (!res.ok) throw new Error("TTS fetch failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error("Error downloading TTS audio:", e);
    return false;
  }
}
