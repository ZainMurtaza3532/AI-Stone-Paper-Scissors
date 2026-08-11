import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import CameraView from "@/components/CameraView";
import GameArena from "@/components/GameArena";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorState from "@/components/ErrorState";
import { useCamera } from "@/hooks/useCamera";
import { useHandTracking } from "@/hooks/useHandTracking";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function App() {
  const webglOk = useMemo(supportsWebGL, []);
  const { videoRef, status: cameraStatus, error: cameraError, retry: retryCamera } = useCamera();
  const cameraReady = cameraStatus === "granted";
  const { hand, status: trackingStatus, error: trackingError } = useHandTracking(videoRef, cameraReady);

  const isLoading =
    webglOk &&
    (cameraStatus === "idle" ||
      cameraStatus === "requesting" ||
      (cameraReady && trackingStatus === "loading"));

  const loadingLabel = cameraStatus !== "granted" ? "Requesting camera" : "Loading hand tracking";

  const errorInfo = !webglOk
    ? { title: "WebGL not supported", message: "This browser or device doesn't support WebGL." }
    : cameraStatus === "denied"
    ? { title: "Camera access needed", message: "Allow camera access in your browser settings, then try again." }
    : cameraStatus === "unavailable"
    ? { title: "No camera found", message: cameraError ?? "Connect a camera and try again." }
    : cameraStatus === "error"
    ? { title: "Camera trouble", message: cameraError ?? "Something went wrong starting your camera." }
    : trackingStatus === "error"
    ? { title: "Hand tracking failed", message: trackingError ?? "Check your connection and try again." }
    : null;

  return (
    <div className="dvh-screen relative overflow-hidden bg-void">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <CameraView videoRef={videoRef} ready={cameraReady} />

      {!errorInfo && (
        <GameArena hand={hand} />
      )}

      <AnimatePresence>
        {isLoading && !errorInfo && <LoadingScreen key="loading" label={loadingLabel} />}
      </AnimatePresence>

      <AnimatePresence>
        {errorInfo && (
          <ErrorState
            key="error"
            title={errorInfo.title}
            message={errorInfo.message}
            onRetry={cameraStatus === "denied" || cameraStatus === "error" ? retryCamera : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
