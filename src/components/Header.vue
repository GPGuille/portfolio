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
  <header class="header">
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
            {{ t.sections[id] }}
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
  align-items: center;
  gap: 12px;
  // Mismo margen que la portada, para que todo quede alineado
  padding: max(3vw, 16px);

  @include mixins.mq("md") {
    gap: 28px;
  }

  &-nav {
    position: relative;
  }

  // Botón de menú: solo en pantallas pequeñas
  &-toggle {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;

    @include mixins.mq("md") {
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
      top: calc(100% + 8px);
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 200px;
      padding: 12px;
      background: var(--color-background);
      outline: 3px solid var(--color-text);
    }

    @include mixins.mq("md") {
      display: flex;
      gap: 28px;

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
    width: 100%;
    padding: 8px 4px;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: inherit;
    text-align: left;
    cursor: pointer;

    @include mixins.mq("md") {
      padding: 4px 0;
    }

    // Subrayado que crece al pasar el ratón o al estar activa
    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 3px;
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
    padding: 6px 10px;
    border: 0;
    background: var(--color-banner);
    color: var(--color-white);
    font-family: var(--font-pixel);
    font-weight: 700;
    font-size: 16px;
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
