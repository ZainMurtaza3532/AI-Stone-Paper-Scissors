import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import HologramFrame from "./HologramFrame";
import PetModel from "./PetModel";
import ParticleSystem from "./ParticleSystem";
import { PET_LIST, type HandState, type PetId, type PetPhase } from "@/types";
import { landmarkToWorld, handSpanToScale } from "@/utils/coordinateMapping";
import { handSpan } from "@/systems/GestureRecognition";
import { damp, damp3, DISSOLVE_DURATION_S, ASSEMBLE_DURATION_S } from "@/systems/AnimationSystem";

interface HologramSceneProps {
  activePetId: PetId;
  hand: HandState;
}

export default function HologramScene({ activePetId, hand }: HologramSceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0.2, 3.2], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#b9e4ff", "#1a0a00", 0.5]} />
      <directionalLight position={[3, 5, 3]} intensity={2.5} />
      <pointLight position={[2, 3, 2]} intensity={30} color="#5ff2ff" distance={12} decay={2} />
      <pointLight position={[-2, -1, 2]} intensity={12} color="#ff7a5c" distance={10} decay={2} />

      <Suspense fallback={null}>
        <HandFollowRig hand={hand}>
          <PetStage activePetId={activePetId} />
        </HandFollowRig>
      </Suspense>
    </Canvas>
  );
}

/**
 * Positions and scales the whole hologram group based on the tracked hand's
 * palm position and apparent size. Falls back to a gentle centered float
 * when no hand is present, so the hologram never just vanishes.
 */
function HandFollowRig({ hand, children }: { hand: HandState; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef({ x: 0, y: -0.1, z: 0 });
  const currentPos = useRef({ x: 0, y: -0.1, z: 0 });
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;

    if (hand.present && hand.palmCenter) {
      const world = landmarkToWorld(hand.palmCenter, { rangeX: 2.6, rangeY: 1.6, depthScale: 2 });
      targetPos.current.x = world.x;
      targetPos.current.y = world.y;
      targetPos.current.z = THREE.MathUtils.clamp(world.z, -1.2, 1.2);
      targetScale.current = handSpanToScale(handSpan(hand.landmarks));
    } else {
      // Gentle idle float when no hand is tracked.
      targetPos.current.x = 0;
      targetPos.current.y = -0.1 + Math.sin(t * 0.6) * 0.05;
      targetPos.current.z = 0;
      targetScale.current = 1;
    }

    damp3(currentPos.current, targetPos.current, 0.18, dt);
    currentScale.current = damp(currentScale.current, targetScale.current, 0.22, dt);

    if (groupRef.current) {
      groupRef.current.position.set(currentPos.current.x, currentPos.current.y, currentPos.current.z);
      groupRef.current.scale.setScalar(currentScale.current);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * Owns the dissolve -> assemble state machine for pet switching, and renders
 * the hologram frame + active pet + particle burst together so they all sit
 * inside the same hand-follow group.
 */
function PetStage({ activePetId }: { activePetId: PetId }) {
  const [displayedPetId, setDisplayedPetId] = useState<PetId>(activePetId);
  const [phase, setPhase] = useState<PetPhase>("idle");
  const [progress, setProgress] = useState(0);

  const phaseStartRef = useRef(0);
  const phaseRef = useRef<PetPhase>("idle");
  const displayedRef = useRef<PetId>(activePetId);

  useEffect(() => {
    if (activePetId !== displayedRef.current && phaseRef.current === "idle") {
      phaseRef.current = "dissolving";
      setPhase("dissolving");
      phaseStartRef.current = performance.now() / 1000;
    }
  }, [activePetId]);

  useFrame(() => {
    if (phaseRef.current === "idle") return;

    const now = performance.now() / 1000;
    const elapsed = now - phaseStartRef.current;
    const duration = phaseRef.current === "dissolving" ? DISSOLVE_DURATION_S : ASSEMBLE_DURATION_S;
    const p = Math.min(1, elapsed / duration);
    setProgress(p);

    if (p >= 1) {
      if (phaseRef.current === "dissolving") {
        displayedRef.current = activePetId;
        setDisplayedPetId(activePetId);
        phaseRef.current = "assembling";
        setPhase("assembling");
        phaseStartRef.current = now;
      } else {
        phaseRef.current = "idle";
        setPhase("idle");
        setProgress(0);
      }
    }
  });

  const pet = PET_LIST.find((p) => p.id === displayedPetId) ?? PET_LIST[0];

  return (
    <group position={[0, -0.1, 0]}>
      <HologramFrame color="#5ff2ff" />
      <group position={[0, -0.15, 0]}>
        <PetModel pet={pet} phase={phase} progress={progress} />
        <ParticleSystem phase={phase} progress={progress} color={pet.accentColor} radius={0.5} />
      </group>
    </group>
  );
}
