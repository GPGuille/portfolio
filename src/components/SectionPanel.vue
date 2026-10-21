<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "../composables/useI18n";
import { useSection } from "../composables/useSection";
import { contactLinks } from "../content/contact";

const { t } = useI18n();
const { activeSection, closeSection } = useSection();

const closeRef = ref<HTMLButtonElement | null>(null);

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") closeSection();
};

// Al abrir una sección, el foco va al botón de cerrar (útil con teclado)
watch(activeSection, async (id) => {
  if (!id || id === "skills") return;
  await nextTick();
  closeRef.value?.focus();
});

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Transition name="panel">
    <section v-if="activeSection && activeSection !== 'skills'" :key="activeSection" class="panel" aria-labelledby="panel-title">
      <div class="panel-header">
        <h2 id="panel-title" class="panel-title">{{ t.sections[activeSection] }}</h2>
        <button ref="closeRef" type="button" class="panel-close" :aria-label="t.panel.close" @click="closeSection">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <ul v-if="activeSection === 'contact' && contactLinks.length" class="panel-links">
        <li v-for="link in contactLinks" :key="link.id">
          <a class="panel-link" :href="link.href" :target="link.id === 'email' ? undefined : '_blank'" rel="noopener">
            <span class="panel-link-label">{{ link.label }}</span>
            <span class="panel-link-text">{{ link.text }}</span>
          </a>
        </li>
      </ul>
      <p v-else class="panel-body">{{ t.panel.comingSoon }}</p>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
.panel {
  position: fixed;
  z-index: var(--z-panel);
  right: var(--gutter);
  bottom: var(--gutter);
  left: var(--gutter);
  padding: var(--space-5);
  background: var(--color-background);
  outline: 4px solid var(--color-text);

  @include mixins.mq("md") {
    left: auto;
    width: 420px;
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-3);
  }

  &-title {
    font-weight: 900;
    font-size: 32px;
  }

  &-close {
    width: var(--tap-size);
    height: var(--tap-size);
    border: 0;
    background: var(--color-banner);
    color: var(--color-white);
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }

  &-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &-link {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: inherit;
    text-decoration: none;

    &:hover .panel-link-text {
      text-decoration: underline;
    }
  }

  &-link-label {
    font-family: var(--font-pixel);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-banner);
  }

  &-link-text {
    font-size: var(--font-size-nav);
    font-weight: 600;
  }

  &-body {
    color: var(--color-text-soft);
    font-size: var(--font-size-nav);
  }
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.3s var(--ease-smooth), transform 0.3s var(--ease-smooth);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(var(--space-4));
}

@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }
}
</style>
