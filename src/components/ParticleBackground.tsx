import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let parts: Particle[] = [];
    let raf = 0;
    let running = true;

    function resize() {
      w = canvas!.width = innerWidth;
      h = canvas!.height = innerHeight;
    }

    function init() {
      parts = [];
      for (let i = 0; i < 60; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
          c: Math.random() > 0.5 ? '168,85,247' : '34,211,238',
        });
      }
    }

    function tick() {
      if (!running) {
        raf = requestAnimationFrame(tick);
        return;
      }
      ctx!.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.c},.6)`;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = `rgba(${p.c},.8)`;
        ctx!.fill();
      });
      ctx!.shadowBlur = 0;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx!.beginPath();
            ctx!.moveTo(parts[i].x, parts[i].y);
            ctx!.lineTo(parts[j].x, parts[j].y);
            ctx!.strokeStyle = `rgba(168,85,247,${0.15 * (1 - d / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    init();
    tick();

    addEventListener('resize', resize);

    const handleVis = () => {
      running = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  return <canvas ref={canvasRef} id="particles" />;
}
