<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { createAvatarExperience } from "../three/avatar";
import { useI18n } from "../composables/useI18n";
import { useSection } from "../composables/useSection";

const { t } = useI18n();
const { openSection } = useSection();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let avatar: ReturnType<typeof createAvatarExperience> | null = null;
let isUnmounted = false;
// Aparece con un fundido cuando el modelo ha cargado
const isReady = ref(false);

// El avatar solo se muestra junto al nombre (pantallas anchas y apaisadas): en el resto
// está oculto por CSS y no se carga
onMounted(async () => {
  if (!canvasRef.value?.offsetParent) return;
  const { createAvatarExperience } = await import("../three/avatar");
  if (isUnmounted || !canvasRef.value) return;
  avatar = createAvatarExperience(canvasRef.value, () => (isReady.value = true));
});

onBeforeUnmount(() => {
  isUnmounted = true;
  avatar?.dispose();
});
</script>

<template>
  <button
    type="button"
    class="avatar"
    data-stage="side"
    :aria-label="t.avatar.label"
    @click="openSection('about')"
    @mouseenter="avatar?.greet()"
    @focus="avatar?.greet()"
  >
    <canvas ref="canvasRef" class="avatar-canvas" :class="{ 'is-ready': isReady }" aria-hidden="true"></canvas>
  </button>
</template>

<style scoped lang="scss">
.avatar {
  display: none;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;

  // Mismas condiciones que la escena al lado del nombre
  @media (min-width: 840px) and (orientation: landscape) {
    display: block;
  }

  &-canvas {
    display: block;
    // El avatar a la derecha y los bloques de contacto a su izquierda. Ocupa todo el alto libre
    // bajo el nombre (así es lo más grande posible sin que la página tenga scroll), con tope
    height: clamp(320px, calc(100svh - 19rem), 680px);
    aspect-ratio: 9 / 10;
    opacity: 0;
    transition: opacity 0.8s var(--ease-smooth);

    &.is-ready {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
}
</style>
