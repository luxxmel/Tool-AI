"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function WorkspaceBackgroundLayer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-colors duration-300 overflow-hidden"
      style={{
        pointerEvents: "none",
        zIndex: 0,
        backgroundColor: isDark ? "#090a0f" : "#f8fafc",
      }}
    >
      {isDark && (
        <>
          {/* Subtle Cyber Deep Slate Glow Orbs */}
          <div
            className="absolute -top-[25%] -left-[10%] w-[55vw] h-[55vw] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, #06b6d4 0%, #4f46e5 60%, transparent 100%)",
            }}
          />
          <div
            className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full opacity-[0.05] blur-[140px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, #6366f1 0%, #3b82f6 60%, transparent 100%)",
            }}
          />
          <div
            className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[40vw] rounded-full opacity-[0.04] blur-[130px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
            }}
          />
        </>
      )}
    </div>
  );
}
