import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameResult } from "@/utils/gameLogic";

const RESULT_CONFIG = {
  win:  { label: "You Win! 🎉", color: "#5ff2ff", bg: "from-cyan-500/20 to-cyan-900/10" },
  lose: { label: "You Lose 😤", color: "#ff7a5c", bg: "from-orange-500/20 to-orange-900/10" },
  draw: { label: "Draw! 🤝",    color: "#a0a0ff", bg: "from-purple-500/20 to-purple-900/10" },
};

type Particle = {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; rotation: number; rotSpeed: number;
};

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  // Sync canvas size to window on mount and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Stop any previous animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!active) {
      particlesRef.current = [];
      return;
    }

    const colors = ["#5ff2ff", "#ff7a5c", "#a0a0ff", "#ffcf4d", "#4fd67a"];
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ display: active ? "block" : "none" }}
    />
  );
}

interface ResultDisplayProps {
  result: GameResult | null;
  visible: boolean;
}

export default function ResultDisplay({ result, visible }: ResultDisplayProps) {
  const cfg = result ? RESULT_CONFIG[result] : null;

  return (
    <>
      <Confetti active={visible && result === "win"} />
      <AnimatePresence>
        {visible && cfg && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className={`rounded-3xl border px-10 py-6 text-center backdrop-blur-xl bg-gradient-to-b ${cfg.bg}`}
              style={{ borderColor: cfg.color + "55" }}
            >
              <motion.div
                className="text-5xl font-bold font-display"
                style={{ color: cfg.color, textShadow: `0 0 30px ${cfg.color}` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {cfg.label}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
