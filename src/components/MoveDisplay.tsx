import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Box, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { Move } from "@/utils/gameLogic";

function StoneModel({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.8;
    ref.current.rotation.x += delta * 0.3;
  });
  return (
    <Sphere ref={ref} args={[0.7, 32, 32]}>
      <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.6} metalness={0.2} />
    </Sphere>
  );
}

function PaperModel({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
  });
  return (
    <Box ref={ref} args={[1.2, 1.5, 0.05]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} side={THREE.DoubleSide} />
    </Box>
  );
}

function ScissorsModel({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const blade1Ref = useRef<THREE.Mesh>(null);
  const blade2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.01;
    const angle = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    if (blade1Ref.current) blade1Ref.current.rotation.z = angle;
    if (blade2Ref.current) blade2Ref.current.rotation.z = -angle;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={blade1Ref} position={[-0.15, 0, 0]}>
        <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh ref={blade2Ref} position={[0.15, 0, 0]}>
        <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <Torus args={[0.2, 0.06, 8, 24]} position={[-0.15, -0.75, 0]}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </Torus>
      <Torus args={[0.2, 0.06, 8, 24]} position={[0.15, -0.75, 0]}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </Torus>
    </group>
  );
}

const MOVE_COLORS: Record<Move, { primary: string; glow: string }> = {
  stone:    { primary: "#a0a0b0", glow: "#6060ff" },
  paper:    { primary: "#f0e8d0", glow: "#00e5ff" },
  scissors: { primary: "#c0c8e0", glow: "#ff7a5c" },
};

interface MoveDisplayProps { move: Move; isPlayer?: boolean; }

function Scene({ move, isPlayer }: MoveDisplayProps) {
  const { primary, glow } = MOVE_COLORS[move];
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={1.5} color={glow} />
      <pointLight position={[-2, -1, -1]} intensity={0.8} color={isPlayer ? "#5ff2ff" : "#ff7a5c"} />
      {move === "stone"    && <StoneModel color={primary} />}
      {move === "paper"    && <PaperModel color={primary} />}
      {move === "scissors" && <ScissorsModel color={primary} />}
    </>
  );
}

export default function MoveDisplay({ move, isPlayer }: MoveDisplayProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene move={move} isPlayer={isPlayer} />
    </Canvas>
  );
}
