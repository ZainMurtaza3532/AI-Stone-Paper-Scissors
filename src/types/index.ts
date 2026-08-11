export type PetId = "puppy" | "parrot" | "rabbit" | "snake" | "fish";

export interface PetDefinition {
  id: PetId;
  label: string;
  gestureLabel: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const PET_LIST: PetDefinition[] = [
  {
    id: "puppy",
    label: "Puppy",
    gestureLabel: "Open hand · 5 fingers",
    primaryColor: "#e8a865",
    secondaryColor: "#f5d9b0",
    accentColor: "#7a4a2b",
  },
  {
    id: "parrot",
    label: "Parrot",
    gestureLabel: "2 fingers",
    primaryColor: "#4fd67a",
    secondaryColor: "#ffcf4d",
    accentColor: "#ff5c5c",
  },
  {
    id: "rabbit",
    label: "Rabbit",
    gestureLabel: "3 fingers",
    primaryColor: "#f2f2f7",
    secondaryColor: "#ffc2d6",
    accentColor: "#9b8bc4",
  },
  {
    id: "snake",
    label: "Snake",
    gestureLabel: "4 fingers",
    primaryColor: "#4dd6c0",
    secondaryColor: "#2a8f7f",
    accentColor: "#ffe14d",
  },
  {
    id: "fish",
    label: "Fish",
    gestureLabel: "Closed fist",
    primaryColor: "#5cb8ff",
    secondaryColor: "#ff8ac2",
    accentColor: "#ffe14d",
  },
];

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandState {
  present: boolean;
  landmarks: NormalizedLandmark[];
  palmCenter: NormalizedLandmark | null;
  fingerCount: number;
  handedness: "Left" | "Right" | null;
}

export type GestureName =
  | "open_five"
  | "two_fingers"
  | "three_fingers"
  | "four_fingers"
  | "closed_fist"
  | "none";

export interface GestureResult {
  gesture: GestureName;
  fingerCount: number;
  confidence: number;
}

export type PetPhase = "idle" | "dissolving" | "assembling";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export type TrackingStatus = "loading" | "ready" | "error";
