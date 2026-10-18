import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  base: "./",
  plugins: [vue(), glsl()],
  server: { port: 3000 },
  assetsInclude: ["**/*.glb", "**/*.gltf"],
  css: {
    preprocessorOptions: {
      // Los mixins (breakpoints) están disponibles en todos los <style lang="scss">
      scss: { additionalData: `@use "/src/assets/styles/mixins.scss";` },
    },
  },
});
