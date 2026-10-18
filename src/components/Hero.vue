<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";
import Banner from "./Banner.vue";

const name = ["Guillermo"];
const jobTitle = "Web Developer";

const titleRef = ref<HTMLHeadingElement | null>(null);

onMounted(() => {
  if (!titleRef.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.from(titleRef.value.querySelectorAll(".hero-title-line"), {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
  });
});
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <h1 ref="titleRef" class="hero-title">
        <span v-for="line in name" :key="line" class="hero-title-mask">
          <span class="hero-title-line">{{ line }}</span>
        </span>
      </h1>
      <Banner class="hero-banner" :copy="jobTitle" />
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
    display: flex;
    flex-direction: column;
    font-weight: 900;
    font-size: var(--font-size-title);
    line-height: 1.05;
    letter-spacing: 0.02em;
  }

  &-title-mask {
    display: block;
    overflow: hidden;
    padding-bottom: 0.06em;
  }

  &-title-line {
    display: block;
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
