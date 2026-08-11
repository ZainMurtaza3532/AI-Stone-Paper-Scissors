import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * @mediapipe/tasks-vision has a `//# sourceMappingURL=vision_bundle_mjs.js.map`
 * comment in its bundle but never ships that .map file. Vite reads the comment,
 * tries to open the file, and throws ENOENT.
 *
 * The only reliable fix is to strip that comment before Vite processes the
 * file. We do it in `transform` (runs on every served module) rather than
 * `load` (which only runs for virtual modules).
 */
function mediapipeSourcemapFix(): Plugin {
  return {
    name: "mediapipe-sourcemap-fix",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("@mediapipe/tasks-vision")) {
        // Remove the sourceMappingURL comment so Vite never tries to read the
        // missing .map file.
        return {
          code: code.replace(/\/\/# sourceMappingURL=\S+/g, ""),
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), mediapipeSourcemapFix()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "SOURCEMAP_ERROR" ||
          warning.message?.includes("vision_bundle")
        ) return;
        warn(warning);
      },
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
          mediapipe: ["@mediapipe/tasks-vision"],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["@mediapipe/tasks-vision"],
  },
});
