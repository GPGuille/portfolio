<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "../composables/useI18n";
import { sectionIds, useSection, type SectionId } from "../composables/useSection";

const { locale, t, toggleLocale } = useI18n();
const { activeSection, openSection } = useSection();

const isMenuOpen = ref(false);

const select = (id: SectionId) => {
  openSection(id);
  isMenuOpen.value = false;
};
</script>

<template>
  <header class="header" data-stage="top">
    <nav class="header-nav" :aria-label="t.nav.label">
      <button
        class="header-toggle"
        :class="{ 'is-open': isMenuOpen }"
        type="button"
        aria-controls="header-menu"
        :aria-expanded="isMenuOpen"
        :aria-label="isMenuOpen ? t.nav.close : t.nav.open"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="header-toggle-icon" aria-hidden="true"></span>
      </button>
      <ul id="header-menu" class="header-menu" :class="{ 'is-open': isMenuOpen }">
        <li v-for="id in sectionIds" :key="id">
          <button
            type="button"
            class="header-link"
            :class="{ 'is-active': activeSection === id }"
            :aria-current="activeSection === id ? 'true' : undefined"
            @click="select(id)"
          >
            <span class="header-link-label">{{ t.sections[id] }}</span>
          </button>
        </li>
      </ul>
    </nav>
    <button type="button" class="header-locale" :aria-label="t.nav.switchLanguage" @click="toggleLocale">
      {{ locale === "es" ? "EN" : "ES" }}
    </button>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: var(--z-header);
  display: flex;
  // Todo alineado arriba: el borde superior del texto del menú coincide con el de la G del nombre
  align-items: flex-start;
  gap: var(--space-3);
  // Mismo margen que la portada
  padding: var(--gutter);

  @include mixins.mq("xl") {
    gap: var(--space-6);
  }

  &-nav {
    position: relative;
  }

  // Botón de menú hasta pantallas anchas: por debajo de 1280px el menú completo choca con el nombre
  &-toggle {
    display: grid;
    place-items: center;
    width: var(--tap-size);
    height: var(--tap-size);
    // Sube el botón para que las rayas del icono (19px de alto) empiecen justo en el margen;
    // la zona pulsable sigue siendo de 44px
    margin-top: calc((var(--tap-size) - 19px) / -2);
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;

    @include mixins.mq("xl") {
      display: none;
    }

    &-icon,
    &-icon::before,
    &-icon::after {
      display: block;
      width: 24px;
      height: 3px;
      background: currentColor;
      transition: transform 0.3s var(--ease-smooth), background-color 0.3s;
    }

    &-icon {
      position: relative;

      &::before,
      &::after {
        content: "";
        position: absolute;
        left: 0;
      }

      &::before {
        top: -8px;
      }

      &::after {
        top: 8px;
      }
    }

    &.is-open &-icon {
      background-color: transparent;

      &::before {
        transform: translateY(8px) rotate(45deg);
      }

      &::after {
        transform: translateY(-8px) rotate(-45deg);
      }
    }
  }

  &-menu {
    display: none;
    margin: 0;
    padding: 0;
    list-style: none;

    // Móvil: lista desplegable bajo el botón
    &.is-open {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-width: 200px;
      padding: var(--space-3);
      background: var(--color-background);
      outline: 3px solid var(--color-text);
    }

    @include mixins.mq("xl") {
      display: flex;
      gap: var(--space-6);

      &.is-open {
        position: static;
        flex-direction: row;
        min-width: 0;
        padding: 0;
        outline: 0;
        background: none;
      }
    }
  }

  &-link {
    position: relative;
    // En bloque: si no, la línea de texto del <li> añade aire por encima y lo desalinea
    display: block;
    width: 100%;
    padding: var(--space-2) var(--space-1);
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: 700;
    font-size: var(--font-size-nav);
    letter-spacing: inherit;
    text-align: left;
    cursor: pointer;

    @include mixins.mq("xl") {
      padding: 0;
    }

    // En la barra, el texto se recorta a la altura de las mayúsculas para alinearlo con el nombre.
    // Va en un bloque propio porque dentro de un <button> el recorte no se aplica
    &-label {
      display: block;

      @include mixins.mq("xl") {
        text-box: trim-both cap alphabetic;
      }
    }

    // Subrayado que crece al pasar el ratón o al estar activa
    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 3px;

      @include mixins.mq("xl") {
        bottom: calc(var(--space-2) * -1);
      }
      background: var(--color-banner);
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.3s var(--ease-smooth);
    }

    &:hover::after,
    &.is-active::after {
      transform: scaleX(1);
    }

    &.is-active {
      color: var(--color-banner);
    }
  }

  &-locale {
    padding: 0.35em 0.6em;
    border: 0;
    background: var(--color-banner);
    color: var(--color-white);
    font-family: var(--font-pixel);
    font-weight: 700;
    font-size: var(--font-size-small);
    transform: rotate(-5deg);
    cursor: pointer;
    transition: transform 0.3s var(--ease-smooth);

    &:hover {
      transform: rotate(0deg) scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none;
    }
  }
}
</style>
