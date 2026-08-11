import { useEffect, useRef, useState } from "react";
import type { GestureName, HandState, PetId } from "@/types";
import { fingerCountToGesture } from "@/systems/GestureRecognition";
import { GESTURE_COOLDOWN_S, GESTURE_HOLD_S } from "@/systems/AnimationSystem";

const GESTURE_TO_PET: Partial<Record<GestureName, PetId>> = {
  open_five: "puppy",
  two_fingers: "parrot",
  three_fingers: "rabbit",
  four_fingers: "snake",
  closed_fist: "fish",
};

interface UseGesturesOptions {
  onPetChange: (pet: PetId) => void;
}

interface UseGesturesResult {
  activeGesture: GestureName;
  fingerCount: number;
}

/**
 * Consumes raw per-frame hand state and turns it into deliberate pet-switch
 * events. Two safeguards prevent flicker/accidental switching:
 *   1. HOLD: a gesture must stay stable for GESTURE_HOLD_S before it fires.
 *   2. COOLDOWN: after firing, new switches are ignored for GESTURE_COOLDOWN_S.
 */
export function useGestures(hand: HandState, { onPetChange }: UseGesturesOptions): UseGesturesResult {
  const [activeGesture, setActiveGesture] = useState<GestureName>("none");

  const candidateRef = useRef<GestureName>("none");
  const candidateSinceRef = useRef<number>(0);
  const lastFiredAtRef = useRef<number>(-Infinity);
  const lastFiredGestureRef = useRef<GestureName>("none");

  useEffect(() => {
    const now = performance.now() / 1000;
    const gesture = hand.present ? fingerCountToGesture(hand.fingerCount) : "none";

    setActiveGesture(gesture);

    if (gesture === "none") {
      candidateRef.current = "none";
      return;
    }

    if (gesture !== candidateRef.current) {
      candidateRef.current = gesture;
      candidateSinceRef.current = now;
      return;
    }

    const heldFor = now - candidateSinceRef.current;
    const cooledDown = now - lastFiredAtRef.current > GESTURE_COOLDOWN_S;
    const isNewGesture = gesture !== lastFiredGestureRef.current;

    if (heldFor >= GESTURE_HOLD_S && cooledDown && isNewGesture) {
      const pet = GESTURE_TO_PET[gesture];
      if (pet) {
        onPetChange(pet);
        lastFiredAtRef.current = now;
        lastFiredGestureRef.current = gesture;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hand.fingerCount, hand.present]);

  return { activeGesture, fingerCount: hand.fingerCount };
}
