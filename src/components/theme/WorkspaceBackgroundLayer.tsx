"use client";

import React from "react";
import { useWorkspaceBackground } from "@/context/WorkspaceBackgroundContext";
import { useTheme } from "@/context/ThemeContext";
import AmbientParticlesCanvas from "./AmbientParticlesCanvas";

export default function WorkspaceBackgroundLayer() {
  const { bgType, bgValue, overlayOpacity, bgBlur, accentGlow } = useWorkspaceBackground();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const overlayBgColor = isDark
    ? `rgba(7, 8, 13, ${overlayOpacity})`
    : `rgba(248, 250, 252, ${overlayOpacity})`;

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ pointerEvents: "none", zIndex: 0 }}
      >
        {bgType === "default" ? (
          <>
            {/* Cyber-Aurora ambient glow mesh in default theme */}
            <div
              className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/15 to-cyan-400/15 rounded-full blur-[160px] pointer-events-none"
              style={{ pointerEvents: "none" }}
            />
            <div
              className="fixed top-96 left-1/3 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"
              style={{ pointerEvents: "none" }}
            />
          </>
        ) : (
          <>
            {/* 1. Underlying Base Background Layer (Image, Gradient or Color) */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out pointer-events-none"
              style={{
                pointerEvents: "none",
                backgroundColor: bgType === "color" ? bgValue : undefined,
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

            {/* Dynamic Accent Color Glow Mesh */}
            <div
              className="absolute top-0 right-1/4 w-[600px] h-[450px] rounded-full blur-[170px] pointer-events-none opacity-25 transition-all duration-1000"
              style={{
                pointerEvents: "none",
                backgroundColor: accentGlow || "#6366f1",
              }}
            />

            {/* 2. Tunable Overlay Dimming Layer for optimal text legibility */}
            <div
              className="absolute inset-0 transition-all duration-500 pointer-events-none"
              style={{
                pointerEvents: "none",
                backgroundColor: overlayBgColor,
              }}
            />
          </>
        )}
      </div>

      {/* 3. Live Interactive Stardust / Cyber Rain Canvas */}
      <AmbientParticlesCanvas />
    </>
  );
}
