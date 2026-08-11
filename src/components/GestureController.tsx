import { AnimatePresence, motion } from "framer-motion";
import type { HandState, PetDefinition } from "@/types";

interface GestureControllerProps {
  hand: HandState;
  activePet: PetDefinition;
}

/**
 * Intentionally minimal: a single small indicator, not a dashboard. It
 * tells the user (a) whether their hand is being seen, and (b) which pet is
 * currently active — nothing else. It fades to near-invisible after a beat
 * so it never competes with the hologram itself.
 */
export default function GestureController({ hand, activePet }: GestureControllerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-3 no-select">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePet.id}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md"
        >
          <span className="font-display text-xs tracking-[0.3em] uppercase text-white/70">
            {activePet.label}
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2 opacity-60">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
            hand.present ? "bg-cyan-glow" : "bg-white/25"
          }`}
        />
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
          {hand.present ? "Hand detected" : "Show your hand"}
        </span>
      </div>
    </div>
  );
}
