<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";
import Banner from "./Banner.vue";

const firstName = "Guillermo";
const lastName = "González";
const jobTitle = "Full Stack Developer";

// Tamaño de las letras de "onzález" cuando cuelgan en vertical de la G
const VERTICAL_SCALE = 0.5;

const titleRef = ref<HTMLHeadingElement | null>(null);
const firstRefs = ref<HTMLSpanElement[]>([]);
const lastRefs = ref<HTMLSpanElement[]>([]);
const bannerRef = ref<InstanceType<typeof Banner> | null>(null);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const introDone = ref(reduceMotion);
const isCrossword = ref(false);

// Calcula dónde va cada letra de "onzález" para formar una columna bajo la G de "Guillermo".
// Se mide en pantalla y se descuenta el desplazamiento que la letra ya tenga por una animación a medias.
const crosswordTargets = () => {
  const title = titleRef.value;
  const g = firstRefs.value[0];
  if (!title || !g) return [];
  const fontSize = parseFloat(getComputedStyle(title).fontSize);
  const step = fontSize * 0.88 * VERTICAL_SCALE;
  const gRect = g.getBoundingClientRect();
  const startY = gRect.top + fontSize * 0.98;

  return lastRefs.value.map((letter, i) => {
    const rect = letter.getBoundingClientRect();
    const restLeft = rect.left - Number(gsap.getProperty(letter, "x"));
    const restTop = rect.top - Number(gsap.getProperty(letter, "y"));
    if (i === 0) return { x: gRect.left - restLeft, y: gRect.top - restTop, scale: 1, opacity: 0 };
    const width = letter.offsetWidth * VERTICAL_SCALE;
    const x = gRect.left + (gRect.width - width) / 2 - restLeft;
    const y = startY + (i - 1) * step - restTop;
    return { x, y, scale: VERTICAL_SCALE, opacity: 1 };
  });
};

const toCrossword = () => {
  if (!introDone.value || reduceMotion || isCrossword.value) return;
  isCrossword.value = true;
  const letters = lastRefs.value;
  crosswordTargets().forEach((target, i) => {
    const letter = letters[i];
    if (!letter) return;
    gsap.to(letter, { ...target, duration: 0.6, ease: "back.out(1.6)", delay: i * 0.04, overwrite: true });
  });
  gsap.to(bannerRef.value?.$el, { opacity: 0, duration: 0.2, overwrite: true });
};

const toName = () => {
  if (!isCrossword.value) return;
  isCrossword.value = false;
  lastRefs.value.forEach((letter, i) => {
    gsap.to(letter, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out", delay: (lastRefs.value.length - i) * 0.03, overwrite: true });
  });
  gsap.to(bannerRef.value?.$el, { opacity: 1, duration: 0.3, delay: 0.3, overwrite: true });
};

// En móvil no hay ratón: el crucigrama se activa tocando el nombre
const toggle = () => {
  if (window.matchMedia("(hover: hover)").matches) return;
  if (isCrossword.value) toName();
  else toCrossword();
};

onMounted(() => {
  if (!titleRef.value || reduceMotion) return;
  gsap.from(titleRef.value.querySelectorAll(".hero-title-line"), {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    onComplete: () => {
      introDone.value = true;
    },
  });
});
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <h1
        ref="titleRef"
        :class="['hero-title', { 'hero-title-ready': introDone }]"
        :aria-label="`${firstName} ${lastName}`"
        @pointerenter="(e: PointerEvent) => e.pointerType === 'mouse' && toCrossword()"
        @pointerleave="(e: PointerEvent) => e.pointerType === 'mouse' && toName()"
        @click="toggle"
      >
        <span class="hero-title-mask" aria-hidden="true">
          <span class="hero-title-line">
            <span v-for="(char, i) in firstName" :key="i" ref="firstRefs" class="hero-title-char">{{ char }}</span>
          </span>
        </span>
        <span class="hero-title-mask" aria-hidden="true">
          <span class="hero-title-line">
            <span v-for="(char, i) in lastName" :key="i" ref="lastRefs" class="hero-title-char">{{ char }}</span>
          </span>
        </span>
      </h1>
      <Banner ref="bannerRef" class="hero-banner" :copy="jobTitle" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 0 max(24px, 8vw);

  &-copy {
    position: relative;
    width: fit-content;
  }

  &-title {
    position: relative;
    display: flex;
    flex-direction: column;
    font-weight: 900;
    font-size: var(--font-size-title);
    line-height: 1.05;
    letter-spacing: 0.02em;
    cursor: default;
    user-select: none;
  }

  &-title-mask {
    display: block;
    overflow: hidden;
    padding-bottom: 0.06em;
  }

  // Tras la animación de entrada, las letras pueden salir de su línea para el crucigrama
  &-title-ready &-title-mask {
    overflow: visible;
  }

  &-title-line {
    display: block;
  }

  &-title-char {
    display: inline-block;
    transform-origin: left top;
  }

  &-banner {
    position: absolute;
    right: -24px;
    bottom: 0;
    transform: rotate(-5deg) translateY(75%);
  }
}

@media (max-width: 640px) {
  .hero {
    justify-content: center;

    &-banner {
      right: -8px;
    }
  }
}
</style>
