import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createBurst, writeParticlePositions, type ParticleBurst } from "@/systems/ParticleEngine";
import { easeInCubic, easeOutCubic } from "@/systems/AnimationSystem";
import type { PetPhase } from "@/types";

interface ParticleSystemProps {
  phase: PetPhase;
  /** 0..1 raw linear progress through the current phase, supplied by parent. */
  progress: number;
  color: string;
  radius?: number;
  count?: number;
}

export default function ParticleSystem({ phase, progress, color, radius = 0.55, count = 420 }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const burstRef = useRef<ParticleBurst>(createBurst(count, radius));
  const positionsRef = useRef<Float32Array>(new Float32Array(count * 3));

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positionsRef.current, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const visible = phase !== "idle";
    pointsRef.current.visible = visible;
    if (!visible) return;

    const eased = phase === "dissolving" ? easeInCubic(progress) : easeOutCubic(progress);
    writeParticlePositions(positionsRef.current, burstRef.current, phase, eased);

    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;

    // Fade particles in/out at the tail ends of each phase for a softer feel.
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = phase === "dissolving" ? 1 - eased * 0.15 : Math.min(1, eased * 1.4);
  });

  return (
    <points ref={pointsRef} geometry={geometry} visible={false}>
      <pointsMaterial
        color={color}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
