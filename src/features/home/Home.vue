<script setup lang="ts">
import Hero from "./components/Hero.vue";
</script>

<template>
  <main class="home">
    <Hero />
  </main>
</template>

<style scoped lang="scss">
.home {
  position: relative;
  z-index: var(--z-content);
}
</style>
