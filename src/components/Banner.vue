<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";

const props = defineProps<{ copy: string; delay?: number }>();

const backgroundRef = ref<HTMLDivElement | null>(null);
const copyRef = ref<HTMLParagraphElement | null>(null);

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const tl = gsap.timeline({ delay: props.delay ?? 0 });
  tl.fromTo(backgroundRef.value, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" });
  // Efecto máquina de escribir: las letras aparecen una a una, a juego con la fuente retro
  tl.from(copyRef.value!.querySelectorAll(".banner-char"), { opacity: 0, duration: 0.01, stagger: 0.04 }, 0.3);
});
</script>

<template>
  <div class="banner">
    <div ref="backgroundRef" class="banner-background"></div>
    <p ref="copyRef" class="banner-copy" :aria-label="props.copy">
      <span v-for="(char, index) in props.copy" :key="index" class="banner-char" aria-hidden="true">{{ char }}</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
.banner {
  position: relative;
  width: fit-content;
  // El relleno va en proporción al texto, así crece con él en cada salto de tamaño
  font-size: var(--font-size-banner);
  padding: 0.3em 0.6em;

  &-background {
    position: absolute;
    inset: 0;
    background: var(--color-banner);
    outline: 4px solid var(--color-background);
    transform-origin: left center;
  }

  &-copy {
    position: relative;
    color: var(--color-white);
    font-family: var(--font-pixel);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
}
</style>
