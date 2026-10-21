<script setup lang="ts">
import Avatar from "../../../components/Avatar.vue";
import Banner from "../../../components/Banner.vue";
import { useI18n } from "../../../composables/useI18n";

const nameLines = ["Guillermo", "González"];
const { t } = useI18n();
</script>

<template>
  <section class="hero" id="hero">
    <div class="hero-copy" data-stage="side">
      <h1 class="hero-title">
        <span v-for="line in nameLines" :key="line" class="hero-title-line">{{ line }}</span>
      </h1>
      <Banner class="hero-banner" data-stage="side" :copy="t.hero.jobTitle" />
    </div>
    <Avatar class="hero-avatar" />
  </section>
</template>

<style scoped lang="scss">
.hero {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  // Mismo margen arriba y a la izquierda. En móvil el nombre baja bajo la fila del menú
  padding: var(--gutter);
  padding-top: calc(var(--gutter) + var(--tap-size) + var(--space-4));

  @include mixins.mq("md") {
    padding-top: var(--gutter);
  }

  &-copy {
    position: relative;
    width: fit-content;
  }

  // Abajo del todo, con los pies a la altura del margen inferior: "a pie de suelo" sea cual sea el
  // alto de la ventana (pantalla completa o no, Mac o Windows con la barra de tareas)
  &-avatar {
    margin-top: auto;
  }

  &-title {
    font-weight: 900;
    letter-spacing: 0.02em;
    font-size: var(--font-size-title);
    line-height: 1.05;
    // Recorta el aire que la fuente deja sobre las mayúsculas y bajo la línea base:
    // el borde superior de la G queda justo en el margen, alineado con el menú
    text-box: trim-both cap alphabetic;
    // La G trae ~0,045em de espacio propio a la izquierda: se compensa para que
    // su borde visible caiga exactamente en el margen (alineación óptica)
    margin-left: -0.045em;

    // Navegadores sin text-box (Firefox): aproximación del mismo recorte
    @supports not (text-box: trim-both cap alphabetic) {
      margin-top: -0.17em;
    }
  }

  &-title-line {
    display: block;
  }

  // La etiqueta se coloca en proporción al nombre, para caer siempre en el mismo punto
  &-banner {
    position: absolute;
    right: calc(var(--font-size-title) * -0.27);
    bottom: calc(var(--font-size-title) * -0.2);
    transform: rotate(-5deg) translateY(75%);
  }
}
</style>
