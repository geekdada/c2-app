import { builtinModules } from "node:module";

import { defineConfig } from "vite";

const external = ["electron", ...builtinModules, ...builtinModules.map((m) => `node:${m}`)];

export default defineConfig({
  build: {
    lib: {
      entry: "./electron/preload.ts",
      formats: ["cjs"],
      fileName: () => "preload.cjs",
    },
    outDir: ".vite/build",
    rollupOptions: {
      external,
      output: {
        codeSplitting: false,
      },
    },
  },
});
