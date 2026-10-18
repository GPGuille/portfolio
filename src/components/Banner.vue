<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";

const props = defineProps<{ copy: string }>();

const backgroundRef = ref<HTMLDivElement | null>(null);
const copyRef = ref<HTMLParagraphElement | null>(null);

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const tl = gsap.timeline({ delay: 0.7 });
  tl.fromTo(backgroundRef.value, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" });
  tl.fromTo(copyRef.value, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "steps(2)" }, 0.1);
});
</script>

<template>
  <div class="banner">
    <div ref="backgroundRef" class="banner-background"></div>
    <p ref="copyRef" class="banner-copy">{{ props.copy }}</p>
  </div>
</template>

<style scoped lang="scss">
.banner {
  position: relative;
  width: fit-content;
  padding: 8px 16px;

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
    font-size: clamp(18px, 2.4vw, 32px);
    white-space: nowrap;
  }
}
</style>
