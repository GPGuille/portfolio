<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createExperience } from "../three";
import { SIDE_BY_SIDE_MIN_WIDTH, type Stage } from "../three/framing";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let experience: ReturnType<typeof createExperience> | null = null;

const bottoms = (rects: DOMRect[]) => Math.max(0, ...rects.map((rect) => rect.bottom));
const rights = (rects: DOMRect[]) => Math.max(0, ...rects.map((rect) => rect.right));
const rectsOf = (zone: "side" | "top") =>
  [...document.querySelectorAll(`[data-stage="${zone}"]`)].map((element) => element.getBoundingClientRect());

// Hueco libre para la habitación, con el mismo margen que el texto.
// Los elementos marcados con data-stage="side" (nombre y etiqueta) y data-stage="top" (menú)
// son los que la habitación no puede pisar
const getStage = (width: number, height: number): Stage => {
  // El mismo margen que usa el CSS (--gutter), ya resuelto a píxeles por el navegador
  const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) || 16;
  const side = rectsOf("side");
  const top = rectsOf("top");

  if (width >= SIDE_BY_SIDE_MIN_WIDTH) {
    return { left: rights(side) + gutter, top: bottoms(top), right: width - gutter, bottom: height - gutter };
  }
  return { left: gutter, top: bottoms([...side, ...top]) + gutter, right: width - gutter, bottom: height - gutter };
};

onMounted(() => {
  if (canvasRef.value) experience = createExperience(canvasRef.value, getStage);
});

onBeforeUnmount(() => experience?.dispose());
</script>

<template>
  <canvas ref="canvasRef" class="experience" aria-hidden="true"></canvas>
</template>

<style scoped lang="scss">
.experience {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: var(--z-experience);
  pointer-events: none;
}
</style>
