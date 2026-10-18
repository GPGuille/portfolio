<script setup lang="ts">
import Banner from "../../../components/Banner.vue";

const nameLines = ["Guillermo", "González"];
const jobTitle = "Full Stack Developer";
</script>

<template>
  <section class="hero" id="hero">
    <div class="hero-copy">
      <h1 class="hero-title">
        <span v-for="line in nameLines" :key="line" class="hero-title-line">{{ line }}</span>
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
  align-items: flex-start;
  justify-content: flex-start;
  // Same gap above and to the left; never tighter than 16px on small screens.
  padding: max(3vw, 16px);

  &-copy {
    position: relative;
    width: fit-content;
  }

  &-title {
    display: flex;
    flex-direction: column;
    font-weight: 900;
    letter-spacing: 0.02em;
    font-size: var(--font-size-title);
    line-height: 1.05;
    // Pull the text up by the font's built-in space above the letters,
    // so the visible gap on top matches the one on the left.
    margin-top: -0.17em;

    @include mixins.mq("sm") {
      font-size: var(--font-size-title-md);
    }

    @include mixins.mq("xl") {
      font-size: var(--font-size-title-lg);
    }
  }

  &-title-line {
    display: block;
  }

  &-banner {
    position: absolute;
    right: -8px;
    bottom: 0;
    transform: rotate(-5deg) translateY(75%);

    @include mixins.mq("md") {
      right: -24px;
    }
  }
}
</style>
