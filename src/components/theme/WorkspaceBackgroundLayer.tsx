"use client";

import React from "react";
import { useWorkspaceBackground } from "@/context/WorkspaceBackgroundContext";
import { useTheme } from "@/context/ThemeContext";
import AmbientParticlesCanvas from "./AmbientParticlesCanvas";

export default function WorkspaceBackgroundLayer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-colors duration-300"
      style={{
        pointerEvents: "none",
        zIndex: 0,
        backgroundColor: isDark ? "#090a10" : "#ffffff",
      }}
    />
  );
}
