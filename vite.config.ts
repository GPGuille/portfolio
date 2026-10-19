import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  base: "./",
  plugins: [vue(), glsl()],
  server: { port: 3000 },
  // three.js va en su propio archivo (~525 KB) y se carga después del texto:
  // es el tamaño esperado de la librería, no un problema
  build: { chunkSizeWarningLimit: 600 },
  assetsInclude: ["**/*.glb", "**/*.gltf"],
  css: {
    preprocessorOptions: {
      // Los mixins (breakpoints) están disponibles en todos los <style lang="scss">
      scss: { additionalData: `@use "/src/assets/styles/mixins.scss";` },
    },
  },
});
