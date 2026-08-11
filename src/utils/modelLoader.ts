import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { Group } from "three";
import type { PetId } from "@/types";

/**
 * This project ships with procedurally-built pets (see PetModel.tsx) so it
 * runs with zero external binary assets. If you want to swap in real
 * hand-authored .glb models, drop them at `src/assets/models/<petId>.glb`
 * and this loader will pick them up automatically — PetModel already checks
 * `hasModelOverride` before falling back to the procedural geometry, so no
 * other code needs to change.
 */

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Vite's import.meta.glob lets us detect at build time whether a real model
// file has been placed in assets/models, without a runtime 404 round-trip.
const modelModules = import.meta.glob("../assets/models/*.glb", { eager: false });

export function hasModelOverride(petId: PetId): boolean {
  return Object.keys(modelModules).some((path) => path.endsWith(`${petId}.glb`));
}

const cache = new Map<string, Promise<Group>>();

export async function loadPetModel(petId: PetId): Promise<Group> {
  const path = `../assets/models/${petId}.glb`;
  const importer = modelModules[path] as (() => Promise<{ default: string }>) | undefined;
  if (!importer) {
    throw new Error(`No model override found for "${petId}". Falling back to procedural geometry.`);
  }

  if (!cache.has(petId)) {
    const promise = importer()
      .then((mod) => gltfLoader.loadAsync(mod.default))
      .then((gltf) => gltf.scene);
    cache.set(petId, promise);
  }

  return cache.get(petId)!;
}

export function disposeModelCache(): void {
  cache.clear();
}
