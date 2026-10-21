<script setup lang="ts">
import Experience from "./components/Experience.vue";
import Header from "./components/Header.vue";
import HoverLabel from "./components/HoverLabel.vue";
import SectionPanel from "./components/SectionPanel.vue";
import SkillsBoard from "./components/SkillsBoard.vue";
import { useSection } from "./composables/useSection";
import Home from "./features/home/Home.vue";

// Con la ventana de Skills abierta el resto de la página se aparta (el tablón vuela por encima)
const { activeSection } = useSection();
</script>

<template>
  <Experience />
  <!-- inert: con la ventana abierta, ni el teclado ni los lectores de pantalla llegan a lo de detrás -->
  <div class="page" :class="{ 'is-covered': activeSection === 'skills' }" :inert="activeSection === 'skills'">
    <Header />
    <Home />
  </div>
  <SectionPanel />
  <SkillsBoard />
  <HoverLabel />
</template>

<style scoped lang="scss">
// Al cerrar, la página vuelve cuando el tablón empieza a volver a la pared (después de que los
// post-its se recojan), no antes: si no, el nombre y el avatar se le pondrían encima
.page {
  transition: opacity 0.4s var(--ease-smooth) 0.5s;

  &.is-covered {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s var(--ease-smooth);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
