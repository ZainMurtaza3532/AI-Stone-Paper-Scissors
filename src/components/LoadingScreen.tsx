import { motion } from "framer-motion";

interface LoadingScreenProps {
  label: string;
}

export default function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-void no-select"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-glow/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-glow"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-3 rounded-full bg-cyan-glow/10 animate-pulse-glow" />
      </div>
      <motion.p
        key={label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-sm tracking-[0.2em] uppercase text-cyan-glow/80"
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
