<script setup lang="ts">
import { computed } from "vue";
import { useHoverLabel } from "../composables/useHoverLabel";
import { useI18n } from "../composables/useI18n";

const { hoverTarget } = useHoverLabel();
const { t } = useI18n();

// Texto de cada objeto clicable: las secciones usan el nombre del menú
const label = computed(() => {
  const id = hoverTarget.value?.id;
  if (!id) return "";
  if (id in t.value.sections) return t.value.sections[id as keyof typeof t.value.sections];
  return t.value.hover[id as keyof typeof t.value.hover] ?? "";
});
</script>

<template>
  <div
    v-if="hoverTarget && label"
    class="hover-label"
    :style="{ transform: `translate(${hoverTarget.x + 18}px, ${hoverTarget.y + 18}px) rotate(-3deg)` }"
    aria-hidden="true"
  >
    {{ label }}
  </div>
</template>

<style scoped lang="scss">
// Cartel con el estilo de la etiqueta "Full Stack Developer", siguiendo al cursor
.hover-label {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-header);
  padding: var(--space-1) var(--space-3);
  background: var(--color-banner);
  color: var(--color-white);
  font-family: var(--font-pixel);
  font-weight: 700;
  font-size: var(--font-size-small);
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
}
</style>
