import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker, type HandLandmarkerResult } from "@mediapipe/tasks-vision";
import type { HandState, TrackingStatus } from "@/types";
import { palmCenter, countExtendedFingers } from "@/systems/GestureRecognition";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const EMPTY_HAND: HandState = {
  present: false,
  landmarks: [],
  palmCenter: null,
  fingerCount: 0,
  handedness: null,
};

interface UseHandTrackingResult {
  hand: HandState;
  status: TrackingStatus;
  error: string | null;
}

/**
 * Runs MediaPipe's HandLandmarker against a live <video> element on every
 * animation frame and exposes the single most confident hand as simple
 * state. Detection runs in VIDEO mode (not IMAGE), which lets MediaPipe use
 * temporal smoothing internally for lower jitter.
 */
export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  active: boolean
): UseHandTrackingResult {
  const [hand, setHand] = useState<HandState>(EMPTY_HAND);
  const [status, setStatus] = useState<TrackingStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);

  // Load the model once.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to initialize hand tracking:", err);
        setStatus("error");
        setError("Couldn't load the hand-tracking model. Check your connection and try again.");
      }
    }

    init();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  // Detection loop.
  useEffect(() => {
    if (!active || status !== "ready") return;

    const loop = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const result: HandLandmarkerResult = landmarker.detectForVideo(video, performance.now());

        if (result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          const handednessLabel = result.handedness[0]?.[0]?.categoryName as "Left" | "Right" | undefined;
          setHand({
            present: true,
            landmarks,
            palmCenter: palmCenter(landmarks),
            fingerCount: countExtendedFingers(landmarks),
            handedness: handednessLabel ?? null,
          });
        } else {
          setHand((prev) => (prev.present ? EMPTY_HAND : prev));
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, status, videoRef]);

  return { hand, status, error };
}
