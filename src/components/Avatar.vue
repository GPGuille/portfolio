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

// Con ratón solo cuenta el clic sobre el avatar (los cubos tendrán su propia acción); con teclado
// (sin ratón encima) el botón abre "Sobre mí"
const onClick = (event: MouseEvent) => {
  const hovered = avatar?.getHovered();
  if (event.detail === 0 || hovered === "avatar") openSection("about");
};

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
    @click="onClick"
    @focus="avatar?.greet()"
  >
    <canvas ref="canvasRef" class="avatar-canvas" :class="{ 'is-ready': isReady }" aria-hidden="true"></canvas>
  </button>
</template>

<style scoped lang="scss">
.avatar {
  // Alto del lienzo: todo el alto libre bajo el nombre (lo más grande posible sin scroll), con tope
  --avatar-height: clamp(320px, calc(100svh - 19rem), 680px);
  display: none;
  // El borde izquierdo de los cubos está al 20,4 % del ancho del lienzo (que es 0,9 × su alto): se
  // retrasa para que quede alineado con el borde de la G del nombre (el margen de la página)
  margin-left: calc(var(--avatar-height) * 0.9 * -0.204);
  padding: 0;
  border: 0;
  background: none;
  // El cursor de mano solo aparece sobre lo clicable (lo pone el lienzo)
  cursor: default;

  // Mismas condiciones que la escena al lado del nombre
  @media (min-width: 840px) and (orientation: landscape) {
    display: block;
  }

  &-canvas {
    display: block;
    // El avatar a la derecha y los bloques de contacto a su izquierda
    height: var(--avatar-height);
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
