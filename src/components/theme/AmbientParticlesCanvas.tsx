"use client";

import React, { useEffect, useRef } from "react";
import { useWorkspaceBackground, ParticleEffectType } from "@/context/WorkspaceBackgroundContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  color: string;
  twinkleSpeed: number;
}

export default function AmbientParticlesCanvas() {
  const { particlesEnabled, particleEffect } = useWorkspaceBackground();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    if (!particlesEnabled || particleEffect === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Color palettes by effect
    const colorPalettes: Record<ParticleEffectType, string[]> = {
      none: [],
      stardust: ["#ffffff", "#c7d2fe", "#a5f3fc", "#e0e7ff", "#fbcfe8"],
      cyber_rain: ["#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#00f2fe"],
      fireflies: ["#fef08a", "#fde047", "#f59e0b", "#fbbf24", "#fed7aa"],
      aurora_waves: ["#34d399", "#2dd4bf", "#38bdf8", "#818cf8", "#c084fc"],
    };

    const palette = colorPalettes[particleEffect] || colorPalettes.stardust;
    let particles: Particle[] = [];
    const count = particleEffect === "cyber_rain" ? 45 : 65;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const isRain = particleEffect === "cyber_rain";
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: isRain ? (Math.random() - 0.5) * 0.3 : (Math.random() - 0.5) * 0.5,
          vy: isRain ? Math.random() * 2 + 1.2 : (Math.random() - 0.5) * 0.5,
          size: isRain ? Math.random() * 1.8 + 0.8 : Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.7 + 0.1,
          targetAlpha: Math.random() * 0.7 + 0.2,
          color: palette[Math.floor(Math.random() * palette.length)],
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Mouse interaction (gentle displacement)
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 0.8;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
          }
        }

        // Alpha twinkle
        if (particleEffect !== "cyber_rain") {
          p.alpha += (p.targetAlpha - p.alpha) * p.twinkleSpeed;
          if (Math.abs(p.targetAlpha - p.alpha) < 0.03) {
            p.targetAlpha = Math.random() * 0.75 + 0.15;
          }
        }

        // Boundaries wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        if (particleEffect === "cyber_rain") {
          // Draw digital streak
          const streakLength = p.size * 9;
          ctx.rect(p.x, p.y, p.size * 0.8, streakLength);
        } else {
          // Glowing circle
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particlesEnabled, particleEffect]);

  if (!particlesEnabled || particleEffect === "none") {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
