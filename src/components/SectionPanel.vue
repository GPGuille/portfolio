<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "../composables/useI18n";
import { useSection } from "../composables/useSection";

const { t } = useI18n();
const { activeSection, closeSection } = useSection();

const closeRef = ref<HTMLButtonElement | null>(null);

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") closeSection();
};

// Al abrir una sección, el foco va al botón de cerrar (útil con teclado)
watch(activeSection, async (id) => {
  if (!id) return;
  await nextTick();
  closeRef.value?.focus();
});

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Transition name="panel">
    <section v-if="activeSection" :key="activeSection" class="panel" aria-labelledby="panel-title">
      <div class="panel-header">
        <h2 id="panel-title" class="panel-title">{{ t.sections[activeSection] }}</h2>
        <button ref="closeRef" type="button" class="panel-close" :aria-label="t.panel.close" @click="closeSection">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p class="panel-body">{{ t.panel.comingSoon }}</p>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
.panel {
  position: fixed;
  z-index: var(--z-panel);
  right: max(3vw, 16px);
  bottom: max(3vw, 16px);
  left: max(3vw, 16px);
  padding: 24px;
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
    gap: 16px;
    margin-bottom: 12px;
  }

  &-title {
    font-weight: 900;
    font-size: 32px;
  }

  &-close {
    width: 44px;
    height: 44px;
    border: 0;
    background: var(--color-banner);
    color: var(--color-white);
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }

  &-body {
    color: var(--color-text-soft);
    font-size: 18px;
  }
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.3s var(--ease-smooth), transform 0.3s var(--ease-smooth);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }
}
</style>
