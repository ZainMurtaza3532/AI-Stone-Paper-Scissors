import { motion } from "framer-motion";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  ready: boolean;
}

/**
 * Full-bleed webcam background. Mirrored (selfie view) since that's the
 * natural expectation for hand-gesture control. A blur + dark gradient sits
 * on top so the hologram and pets read clearly against it.
 */
export default function CameraView({ videoRef, ready }: CameraViewProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-void">
      <motion.video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full object-cover"
        style={{ transform: "scaleX(-1)", filter: "blur(6px) saturate(1.1) brightness(0.55)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      {/* Cinematic overlay: vignette + cool color grade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/70 via-void/40 to-void/85" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(5,7,10,0.75)_100%)]" />
      <div className="pointer-events-none absolute inset-0 grain" />
    </div>
  );
}
