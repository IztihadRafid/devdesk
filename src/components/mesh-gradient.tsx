"use client";

import { useEffect, useRef } from "react";

export function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dark mode colors
    const darkColors = [
      { r: 108, g: 76, b: 241 }, // Purple
      { r: 79, g: 70, b: 229 },  // Indigo
      { r: 239, g: 93, b: 168 }, // Pink
      { r: 59, g: 130, b: 246 }, // Blue
    ];

    // Light mode colors
    const lightColors = [
      { r: 147, g: 112, b: 219 }, // Lighter Purple
      { r: 129, g: 140, b: 248 }, // Lighter Indigo
      { r: 244, g: 114, b: 182 }, // Lighter Pink
      { r: 96, g: 165, b: 250 },  // Lighter Blue
    ];

    // Initial orb positions and properties
    const createOrbs = (colors: typeof darkColors) => colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 200 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color,
      phase: (i / colors.length) * Math.PI * 2,
    }));

    let orbs = createOrbs(darkColors);

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check for dark mode
      const isDarkMode = document.documentElement.classList.contains('dark');
      const currentColors = isDarkMode ? darkColors : lightColors;

      // Update orb colors if theme changed
      orbs = orbs.map((orb, i) => ({
        ...orb,
        color: currentColors[i % currentColors.length]
      }));

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isDarkMode) {
        gradient.addColorStop(0, "rgba(10, 10, 15, 1)");
        gradient.addColorStop(1, "rgba(20, 20, 30, 1)");
      } else {
        gradient.addColorStop(0, "rgba(248, 250, 252, 1)");
        gradient.addColorStop(1, "rgba(241, 245, 249, 1)");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw orbs with blur effect
      orbs.forEach((orb, i) => {
        // Update position with smooth movement
        orb.x += orb.vx + Math.sin(time + orb.phase) * 0.3;
        orb.y += orb.vy + Math.cos(time + orb.phase) * 0.3;

        // Bounce off edges
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        // Pulsing size
        const pulseRadius = orb.radius + Math.sin(time * 2 + orb.phase) * 30;

        // Create radial gradient for orb
        const orbGradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          pulseRadius
        );

        const alpha = isDarkMode ? (0.15 + Math.sin(time + orb.phase) * 0.05) : (0.08 + Math.sin(time + orb.phase) * 0.03);
        orbGradient.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${alpha})`);
        orbGradient.addColorStop(0.5, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${alpha * 0.5})`);
        orbGradient.addColorStop(1, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0)`);

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full dark:block hidden"
      style={{ pointerEvents: "none" }}
    />
  );
}