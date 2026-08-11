import { motion } from "framer-motion";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-void px-8 text-center no-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-ember/30" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-2xl text-ember">
          !
        </div>
      </div>
      <h1 className="font-display text-xl text-white/90">{title}</h1>
      <p className="max-w-sm text-sm leading-relaxed text-white/50">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-6 py-2.5 text-sm font-medium text-cyan-glow transition hover:bg-cyan-glow/20 active:scale-95"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
}
