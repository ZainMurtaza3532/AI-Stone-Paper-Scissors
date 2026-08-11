# AI Stone Paper Scissors

Real-time hand gesture Stone Paper Scissors game powered by MediaPipe HandLandmarker, React 19, Three.js, and Framer Motion.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and allow camera access.

## How to Play

1. Show your hand to the webcam
2. Hold a gesture steady for **0.5 seconds** to lock it in
3. A 3-2-1 countdown fires, then the computer reveals its move
4. Result and score update automatically

| Gesture | Hand shape |
|---------|-----------|
| ✊ Stone | Closed fist |
| ✋ Paper | All 5 fingers open |
| ✌️ Scissors | Index + middle fingers extended |

## Tech Stack

| Layer | Library |
|-------|---------|
| UI | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Computer Vision | MediaPipe HandLandmarker (GPU delegate) |
| 3D | Three.js + React Three Fiber + Drei |
| Animation | Framer Motion |

## Project Structure

```
src/
├── components/
│   ├── GameArena.tsx        # Main game layout
│   ├── MoveDisplay.tsx      # 3D Stone/Paper/Scissors models
│   ├── GestureIndicator.tsx # Live gesture + hold-progress ring
│   ├── ScoreBoard.tsx       # Player vs CPU score
│   ├── ResultDisplay.tsx    # Win/Lose/Draw banner + confetti
│   ├── CameraView.tsx       # Blurred webcam background
│   ├── LoadingScreen.tsx    # Spinner while model loads
│   └── ErrorState.tsx       # Camera/WebGL error UI
├── hooks/
│   ├── useCamera.ts         # Webcam stream management
│   ├── useHandTracking.ts   # MediaPipe detection loop
│   └── useGameState.ts      # Game state machine
├── utils/
│   ├── gestureRecognition.ts # Landmark → Stone/Paper/Scissors
│   └── gameLogic.ts          # Rules, random move, result
└── systems/
    └── GestureRecognition.ts # Low-level landmark math
```

## Performance Notes

- Detection runs in `requestAnimationFrame` using MediaPipe VIDEO mode (temporal smoothing built-in)
- React state updates are batched; camera frames use refs to avoid re-renders
- Three.js canvases are isolated per card — no shared renderer contention
- WebGL resources are cleaned up on unmount via R3F's lifecycle
