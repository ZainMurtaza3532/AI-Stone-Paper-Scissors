import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraStatus } from "@/types";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: string | null;
  retry: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        setError("This browser doesn't support camera access.");
        return;
      }

      setStatus("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("granted");
      } catch (err) {
        if (cancelled) return;
        const domError = err as DOMException;
        if (domError.name === "NotAllowedError" || domError.name === "PermissionDeniedError") {
          setStatus("denied");
          setError("Camera access was denied.");
        } else if (domError.name === "NotFoundError" || domError.name === "DevicesNotFoundError") {
          setStatus("unavailable");
          setError("No camera was found on this device.");
        } else {
          setStatus("error");
          setError(domError.message || "Something went wrong starting the camera.");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => {
    stopStream();
    setAttempt((a) => a + 1);
  }, [stopStream]);

  return { videoRef, status, error, retry };
}
