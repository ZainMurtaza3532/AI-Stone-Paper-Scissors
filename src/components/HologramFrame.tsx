import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CUBE_SIZE = 1.6;

/**
 * A transparent glowing cube frame with rotating inner rings and glowing
 * corner nodes. Stays visually consistent while the pet inside changes.
 */
export default function HologramFrame({ color = "#5ff2ff" }: { color?: string }) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const innerRingRef2 = useRef<THREE.Group>(null);

  const corners = useMemo(() => {
    const h = CUBE_SIZE / 2;
    const signs = [-1, 1];
    const pts: [number, number, number][] = [];
    for (const sx of signs) for (const sy of signs) for (const sz of signs) pts.push([sx * h, sy * h, sz * h]);
    return pts;
  }, []);

  const edges = useMemo(() => {
    const geo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    return new THREE.EdgesGeometry(geo);
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.position.y = Math.sin(t * 0.9) * 0.06;
      outerRef.current.rotation.y += dt * 0.12;
    }
    if (innerRingRef.current) innerRingRef.current.rotation.z += dt * 0.35;
    if (innerRingRef2.current) innerRingRef2.current.rotation.x += dt * -0.28;
  });

  return (
    <group ref={outerRef}>
      {/* Cube wireframe */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={0.55} />
      </lineSegments>

      {/* Faint glass panels for a "housed" hologram feel */}
      <mesh>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.035}
          roughness={0.1}
          metalness={0}
          transmission={0.9}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Corner energy nodes */}
      {corners.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}

      {/* Rotating inner accent rings */}
      <group ref={innerRingRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[CUBE_SIZE * 0.62, 0.006, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      </group>
      <group ref={innerRingRef2}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[CUBE_SIZE * 0.5, 0.005, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Ground glow disc */}
      <mesh position={[0, -CUBE_SIZE / 2 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[CUBE_SIZE * 0.55, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
