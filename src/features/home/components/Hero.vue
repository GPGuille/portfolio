<script setup lang="ts">
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
  </section>
</template>

<style scoped lang="scss">
.hero {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  // Mismo margen arriba y a la izquierda; nunca menos de 16px en pantallas pequeñas.
  // En móvil el nombre baja bajo la fila del menú (botón de 44px) para no chocar con él
  padding: max(3vw, 16px);
  padding-top: calc(max(3vw, 16px) + 44px + 16px);

  @include mixins.mq("md") {
    padding-top: max(3vw, 16px);
  }

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
    // Sube el texto lo que la fuente deja de aire sobre las letras,
    // para que el hueco visible arriba sea igual que el de la izquierda
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
