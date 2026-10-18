<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createExperience } from "../three";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let experience: ReturnType<typeof createExperience> | null = null;

onMounted(() => {
  if (canvasRef.value) experience = createExperience(canvasRef.value);
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
