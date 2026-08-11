import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PetDefinition, PetPhase } from "@/types";
import { easeInCubic, easeOutCubic } from "@/systems/AnimationSystem";

interface PetModelProps {
  pet: PetDefinition;
  phase: PetPhase;
  progress: number; // 0..1 linear progress through current phase
}

/**
 * All five pets are built from simple primitives (spheres, cones, tori,
 * tubes) rather than imported meshes — see utils/modelLoader.ts for how to
 * swap in real .glb assets later. Each pet is its own small builder
 * component so idle-animation logic stays readable per-creature.
 */
export default function PetModel({ pet, phase, progress }: PetModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    let visibleScale = 1;
    let opacity = 1;

    if (phase === "dissolving") {
      const eased = easeInCubic(progress);
      visibleScale = 1 - eased;
      opacity = 1 - eased;
    } else if (phase === "assembling") {
      const eased = easeOutCubic(progress);
      visibleScale = eased;
      opacity = eased;
    }

    groupRef.current.visible = visibleScale > 0.001;
    groupRef.current.scale.setScalar(Math.max(visibleScale, 0.001));
    setGroupOpacity(groupRef.current, opacity);
  });

  const Body = useMemo(() => {
    switch (pet.id) {
      case "puppy":
        return Puppy;
      case "parrot":
        return Parrot;
      case "rabbit":
        return Rabbit;
      case "snake":
        return Snake;
      case "fish":
        return Fish;
      default:
        return Puppy;
    }
  }, [pet.id]);

  return (
    <group ref={groupRef} scale={0.62}>
      <Body pet={pet} />
    </group>
  );
}

function setGroupOpacity(group: THREE.Group, opacity: number) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      const mat = mesh.material as THREE.Material & { opacity?: number; transparent?: boolean };
      if (mat) {
        mat.transparent = true;
        mat.opacity = opacity;
      }
    }
  });
}

interface CreatureProps {
  pet: PetDefinition;
}

/* ---------------------------------- Puppy ---------------------------------- */
function Puppy({ pet }: CreatureProps) {
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(t * 6) * 0.5 + 0.3;
    if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.2) * 0.15;
  });

  return (
    <group rotation={[0, Math.PI, 0]}>
      {/* body */}
      <mesh position={[0, -0.05, 0]} scale={[0.85, 0.7, 1]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.55} />
      </mesh>
      {/* head */}
      <group ref={headRef} position={[0, 0.42, 0.32]}>
        <mesh>
          <sphereGeometry args={[0.36, 24, 24]} />
          <meshStandardMaterial color={pet.primaryColor} roughness={0.55} />
        </mesh>
        {/* snout */}
        <mesh position={[0, -0.08, 0.32]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.08, 0.46]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={pet.accentColor} />
        </mesh>
        {/* eyes */}
        <mesh position={[0.14, 0.06, 0.3]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#241a12" />
        </mesh>
        <mesh position={[-0.14, 0.06, 0.3]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#241a12" />
        </mesh>
        {/* ears */}
        <mesh position={[0.32, 0.18, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.14, 0.34, 12]} />
          <meshStandardMaterial color={pet.accentColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.32, 0.18, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.14, 0.34, 12]} />
          <meshStandardMaterial color={pet.accentColor} roughness={0.6} />
        </mesh>
      </group>
      {/* legs */}
      {[
        [0.28, -0.5, 0.28],
        [-0.28, -0.5, 0.28],
        [0.28, -0.5, -0.28],
        [-0.28, -0.5, -0.28],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.09, 0.09, 0.28, 10]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.6} />
        </mesh>
      ))}
      {/* tail */}
      <group ref={tailRef} position={[0, 0.05, -0.5]}>
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.07, 0.32, 6, 10]} />
          <meshStandardMaterial color={pet.primaryColor} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------- Parrot ---------------------------------- */
function Parrot({ pet }: CreatureProps) {
  const wingLRef = useRef<THREE.Group>(null);
  const wingRRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flap = Math.sin(t * 5) * 0.25;
    if (wingLRef.current) wingLRef.current.rotation.z = 0.3 + flap;
    if (wingRRef.current) wingRRef.current.rotation.z = -0.3 - flap;
  });

  return (
    <group>
      {/* body */}
      <mesh scale={[0.6, 0.85, 0.6]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.5} />
      </mesh>
      {/* belly */}
      <mesh position={[0, -0.1, 0.22]} scale={[0.45, 0.6, 0.4]}>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color={pet.secondaryColor} roughness={0.5} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.46, 0.05]}>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.5} />
      </mesh>
      {/* beak */}
      <mesh position={[0, 0.4, 0.32]} rotation={[Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 12]} />
        <meshStandardMaterial color={pet.accentColor} roughness={0.4} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.14, 0.5, 0.2]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>
      <mesh position={[-0.14, 0.5, 0.2]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>
      {/* crest */}
      <mesh position={[0, 0.72, -0.02]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.07, 0.24, 10]} />
        <meshStandardMaterial color={pet.accentColor} roughness={0.5} />
      </mesh>
      {/* wings */}
      <group ref={wingLRef} position={[0.32, 0.05, 0]}>
        <mesh position={[0.15, -0.1, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.16, 0.5, 4]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.55} flatShading />
        </mesh>
      </group>
      <group ref={wingRRef} position={[-0.32, 0.05, 0]}>
        <mesh position={[-0.15, -0.1, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.16, 0.5, 4]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.55} flatShading />
        </mesh>
      </group>
      {/* tail feathers */}
      <mesh position={[0, -0.35, -0.3]} rotation={[0.9, 0, 0]}>
        <coneGeometry args={[0.14, 0.55, 6]} />
        <meshStandardMaterial color={pet.accentColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Rabbit ---------------------------------- */
function Rabbit({ pet }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Group>(null);
  const earRRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // hop
    if (groupRef.current) groupRef.current.position.y = Math.abs(Math.sin(t * 3)) * 0.14;
    const wiggle = Math.sin(t * 4) * 0.06;
    if (earLRef.current) earLRef.current.rotation.z = 0.15 + wiggle;
    if (earRRef.current) earRRef.current.rotation.z = -0.15 - wiggle;
  });

  return (
    <group ref={groupRef}>
      {/* body */}
      <mesh position={[0, -0.08, 0]} scale={[0.8, 0.75, 0.95]}>
        <sphereGeometry args={[0.44, 24, 24]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.36, 0.28]}>
        <sphereGeometry args={[0.32, 22, 22]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.7} />
      </mesh>
      {/* cheeks / muzzle */}
      <mesh position={[0, 0.28, 0.52]} scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={pet.secondaryColor} roughness={0.7} />
      </mesh>
      {/* nose */}
      <mesh position={[0, 0.3, 0.62]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color={pet.accentColor} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.13, 0.42, 0.48]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#2b2233" />
      </mesh>
      <mesh position={[-0.13, 0.42, 0.48]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#2b2233" />
      </mesh>
      {/* ears */}
      <group ref={earLRef} position={[0.14, 0.6, 0.22]}>
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.08, 0.5, 6, 10]} />
          <meshStandardMaterial color={pet.primaryColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.28, 0.05]} scale={[0.5, 0.85, 0.3]}>
          <capsuleGeometry args={[0.08, 0.5, 6, 10]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.7} />
        </mesh>
      </group>
      <group ref={earRRef} position={[-0.14, 0.6, 0.22]}>
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.08, 0.5, 6, 10]} />
          <meshStandardMaterial color={pet.primaryColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.28, 0.05]} scale={[0.5, 0.85, 0.3]}>
          <capsuleGeometry args={[0.08, 0.5, 6, 10]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.7} />
        </mesh>
      </group>
      {/* cotton tail */}
      <mesh position={[0, -0.05, -0.44]}>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* feet */}
      <mesh position={[0.2, -0.42, 0.1]} scale={[0.7, 0.5, 1.2]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.7} />
      </mesh>
      <mesh position={[-0.2, -0.42, 0.1]} scale={[0.7, 0.5, 1.2]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Snake ---------------------------------- */
function Snake({ pet }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const segmentsRef = useRef<THREE.Mesh[]>([]);

  const segmentCount = 9;
  const segments = useMemo(
    () =>
      new Array(segmentCount).fill(0).map((_, i) => {
        const t = i / (segmentCount - 1);
        const scale = 0.32 - t * 0.16; // taper toward the tail
        return { t, scale };
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    segmentsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = i * 0.6;
      mesh.position.x = Math.sin(t * 2.4 - phase) * 0.16 * (1 - i / segmentCount);
    });
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
  });

  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
      {segments.map(({ t, scale }, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) segmentsRef.current[i] = el;
          }}
          position={[0, 0.3 - t * 0.75, 0.5 - t * 0.9]}
        >
          <sphereGeometry args={[scale, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? pet.primaryColor : pet.secondaryColor}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
      ))}
      {/* head accents on the first (largest) segment */}
      <mesh position={[0.12, 0.34, 0.56]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#151510" />
      </mesh>
      <mesh position={[-0.12, 0.34, 0.56]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#151510" />
      </mesh>
      <mesh position={[0, 0.28, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.03, 0.14, 8]} />
        <meshStandardMaterial color={pet.accentColor} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Fish ---------------------------------- */
function Fish({ pet }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.8) * 0.08;
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    }
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 5) * 0.6;
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        const b = bubble as THREE.Mesh;
        b.position.y = ((t * 0.4 + i * 0.3) % 1) * 0.9 - 0.1;
        b.position.x = Math.sin(t * 1.5 + i) * 0.1;
      });
    }
  });

  return (
    <group ref={groupRef} rotation={[0, Math.PI / 2, 0]}>
      {/* body */}
      <mesh scale={[1, 0.7, 0.55]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color={pet.primaryColor} roughness={0.3} metalness={0.15} />
      </mesh>
      {/* belly stripe */}
      <mesh position={[0, -0.12, 0]} scale={[0.9, 0.35, 0.5]}>
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshStandardMaterial color={pet.secondaryColor} roughness={0.3} />
      </mesh>
      {/* eye */}
      <mesh position={[0.3, 0.12, 0.18]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.34, 0.12, 0.19]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color="#151515" />
      </mesh>
      {/* top fin */}
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.16, 0.28, 4]} />
        <meshStandardMaterial color={pet.accentColor} roughness={0.4} flatShading />
      </mesh>
      {/* side fins */}
      <mesh position={[0, -0.02, 0.32]} rotation={[0.3, 0.5, 0]}>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshStandardMaterial color={pet.accentColor} roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0, -0.02, -0.32]} rotation={[-0.3, -0.5, 0]}>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshStandardMaterial color={pet.accentColor} roughness={0.4} flatShading />
      </mesh>
      {/* tail */}
      <group ref={tailRef} position={[-0.4, 0, 0]}>
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.3, 4]} />
          <meshStandardMaterial color={pet.secondaryColor} roughness={0.4} flatShading />
        </mesh>
      </group>
      {/* bubbles */}
      <group ref={bubblesRef} position={[0.3, 0.2, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.2, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#bfe9ff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
