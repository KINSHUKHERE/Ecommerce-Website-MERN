import React, { useEffect, useRef } from "react";

const SnowEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const numFlakes = 100;
    const flakes = Array.from({ length: numFlakes }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.5 + 0.8, // flake size
      vy: Math.random() * 1.2 + 0.4, // vertical speed
      vx: Math.random() * 0.6 - 0.3, // horizontal speed
      amplitude: Math.random() * 1.5 + 0.5,
      frequency: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();

      for (let i = 0; i < numFlakes; i++) {
        const f = flakes[i];
        
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);

        // Update positions
        f.y += f.vy;
        f.x += f.vx + Math.sin(f.y * f.frequency) * f.amplitude * 0.2;

        // Reset if off bottom
        if (f.y > canvas.height) {
          flakes[i] = {
            x: Math.random() * canvas.width,
            y: -10,
            r: f.r,
            vy: f.vy,
            vx: f.vx,
            amplitude: f.amplitude,
            frequency: f.frequency,
          };
        }
        // Wrap around horizontally
        if (f.x > canvas.width) {
          f.x = 0;
        } else if (f.x < 0) {
          f.x = canvas.width;
        }
      }

      ctx.fill();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full mix-blend-screen opacity-90"
    />
  );
};

export default SnowEffect;
