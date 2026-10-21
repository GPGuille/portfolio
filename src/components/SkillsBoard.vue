<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import woodUrl from "../assets/textures/frame-wood.webp";
import { useI18n } from "../composables/useI18n";
import { useSection } from "../composables/useSection";
import { useSectionWindow } from "../composables/useSectionWindow";
import { skillGroups, type SkillIcon } from "../content/skills";
import { palette } from "../three/palette";
import { createCorkPattern } from "../three/textures/createCorkPattern";
import { drawSkillIcon, fitTitleSize, TITLE_FONT_SIZE } from "../three/textures/drawSkillIcon";

const { t, locale } = useI18n();
const { activeSection, closeSection } = useSection();
const { flyable, arrived, notes } = useSectionWindow();

const isOpen = computed(() => activeSection.value === "skills");
// Con vuelo, la ventana espera a que el tablón 3D llegue a su sitio y aparece encima de él
const isVisible = computed(() => isOpen.value && (!flyable.value.includes("skills") || arrived.value === "skills"));

// Con la escena (tablón 3D en la ventana, solo en pantallas anchas y apaisadas) la ventana es
// transparente: marco y corcho son los del propio tablón 3D. Sus post-its HTML aparecen encima de
// los 3D, con su misma medida, sitio, giro y aspecto (icono grande y título); después crecen en su
// sitio y aparece la lista (`isExpanded`). Al cerrar se recogen antes de que el tablón vuelva
const hasScene = computed(() => flyable.value.includes("skills") && notes.value.length === skillGroups.length);

// La ventana sigue montada mientras se cierra (un elemento que sale con <Transition> deja de
// actualizarse y sus post-its no podrían recogerse): se desmonta al terminar su fundido
const CLOSE_TIME = { scene: 550, plain: 350 };
const isMounted = ref(isOpen.value);
let unmountTimer = 0;
watch(isOpen, (open) => {
  window.clearTimeout(unmountTimer);
  if (open) isMounted.value = true;
  else
    unmountTimer = window.setTimeout(
      () => (isMounted.value = false),
      hasScene.value ? CLOSE_TIME.scene : CLOSE_TIME.plain,
    );
});
const isExpanded = ref(false);
let expandTimer = 0;
watch(isVisible, (visible) => {
  window.clearTimeout(expandTimer);
  if (visible) expandTimer = window.setTimeout(() => (isExpanded.value = true), 280);
  else isExpanded.value = false;
});

// Sin escena, el mismo giro que en el tablón 3D (`createPostIts`)
const ROTATIONS = [-2.9, 3.4, 2.3, -4];
// Proporción del tablón (alto / ancho): la de la ventana apaisada
const BOARD_ASPECT = 0.68;
// Las unidades cqw de los post-its miden el interior del tablón, sin el marco (5,8 % a cada lado)
const INNER_WIDTH = 1 - 2 * 0.058;
// Ancho del post-it abierto (cqw); debe coincidir con `--w` del CSS
const NOTE_WIDTH = 26;
// Color del papel tal y como se ve en el tablón 3D bajo la luz cálida de la habitación (medido en
// capturas): así el post-it HTML no cambia de color al sustituir al 3D
const LIT_PAPERS = ["#f8cc7e", "#acbcd0", "#b8d089", "#e9d4b6"];

// Un título largo se estrecha como en el post-it 3D (misma medida)
const measureContext = document.createElement("canvas").getContext("2d");
const titleFit = (text: string) =>
  measureContext ? fitTitleSize(measureContext, text.toUpperCase()) / TITLE_FONT_SIZE : 1;

const noteStyle = (index: number) => {
  const note = notes.value[index];
  const style: Record<string, string | number> = {
    "--paper": LIT_PAPERS[index % LIT_PAPERS.length]!,
    "--pin": palette.postItPins[index % palette.postItPins.length]!,
    "--turn": `${note ? (-note.rotation * 180) / Math.PI : ROTATIONS[index % ROTATIONS.length]}deg`,
  };
  if (!note) return style;
  return {
    ...style,
    "--x": note.x,
    "--y": note.y,
    // Escala del post-it recogido: el ancho del papel 3D respecto al del post-it HTML abierto
    "--collapsed": (note.width * 100) / (NOTE_WIDTH * INNER_WIDTH),
    "--aspect": (note.height / note.width) * BOARD_ASPECT,
    "--title-fit": titleFit(skillGroups[index]!.title[locale.value]),
    "--pin-x": note.pinX,
    "--pin-y": note.pinY,
  };
};

// Texturas: la madera es la misma imagen que el marco del tablón 3D (vetas horizontales); para los
// lados se gira 90° una vez, en un lienzo. El corcho se genera en código. Se preparan en un rato
// libre del navegador después de cargar la página, para que abrir la ventana no dé tirones
const textures = ref<Record<string, string>>({});
const prepareTextures = () => {
  if (textures.value["--cork"]) return;
  textures.value = {
    "--wood": `url(${woodUrl})`,
    "--wood-side": `url(${woodUrl})`,
    "--cork": `url(${createCorkPattern()})`,
  };
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.height;
    canvas.height = image.width;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.translate(canvas.width, 0);
    context.rotate(Math.PI / 2);
    context.drawImage(image, 0, 0);
    textures.value = { ...textures.value, "--wood-side": `url(${canvas.toDataURL("image/webp", 0.9)})` };
  };
  image.src = woodUrl;
};
watch(isOpen, (open) => open && prepareTextures());
onMounted(() => {
  if ("requestIdleCallback" in window) window.requestIdleCallback(prepareTextures, { timeout: 4000 });
  else setTimeout(prepareTextures, 2000);
});

// Al aparecer, el foco va a la ventana (con Tab se llega a "Volver"; Escape también cierra)
const boardRef = ref<HTMLElement | null>(null);
watch(isVisible, async (visible) => {
  if (!visible) return;
  await nextTick();
  boardRef.value?.focus({ preventScroll: true });
});

// Grafito: todo lo escrito en los post-its (icono, título y lista) va a lápiz
const PENCIL = palette.postItInk;

// Icono de la categoría: el mismo dibujo que en el post-it del tablón 3D
const drawIcon = (canvas: Element | null, icon: SkillIcon) => {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.dataset.drawn) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.dataset.drawn = "true";
  context.strokeStyle = PENCIL;
  context.fillStyle = PENCIL;
  context.translate(canvas.width / 2, canvas.height / 2);
  context.scale(canvas.width / 250, canvas.height / 250);
  drawSkillIcon(context, icon);
};
</script>

<template>
  <div
    v-if="isMounted"
    class="board-layer"
    :class="{ 'is-visible': isVisible, 'has-scene': hasScene }"
    @click.self="closeSection"
  >
    <section
      ref="boardRef"
      class="board"
      :class="{ 'has-scene': hasScene, 'is-expanded': isExpanded || !hasScene }"
      data-fly-target="skills"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-title"
      :style="textures"
    >
      <div class="board-side is-left" aria-hidden="true"></div>
      <div class="board-side is-right" aria-hidden="true"></div>
      <div class="board-cork">
        <button type="button" class="board-back" @click="closeSection">
          <span aria-hidden="true">←</span> {{ t.panel.back }}
        </button>
        <h2 id="board-title" class="board-title">{{ t.sections.skills }}</h2>
        <ul class="board-notes">
          <li v-for="(group, index) in skillGroups" :key="group.icon" class="note" :style="noteStyle(index)">
            <canvas
              :ref="(element) => drawIcon(element as Element | null, group.icon)"
              class="note-icon pencil"
              width="160"
              height="160"
              aria-hidden="true"
            ></canvas>
            <h3 class="note-title pencil">{{ group.title[locale] }}</h3>
            <ul class="note-items">
              <li v-for="item in group.items" :key="item.name" class="note-item pencil">
                <svg class="note-item-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-if="item.icon" :d="item.icon.path" />
                  <!-- Sin logo propio (SQL): base de datos genérica de línea -->
                  <g v-else fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                    <ellipse cx="12" cy="5.5" rx="8" ry="3" />
                    <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
                  </g>
                </svg>
                {{ item.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="board-bevel" aria-hidden="true"></div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// Ventana de Skills con forma de tablón: marco de madera clara, corcho y un post-it por categoría.
// En pantallas anchas y apaisadas tiene la proporción del tablón 3D (1 × 0,68 m), que vuela hasta
// este mismo rectángulo; en vertical ocupa toda la pantalla y los post-its se apilan
.board-layer {
  position: fixed;
  inset: 0;
  z-index: var(--z-window);
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  place-items: center;
  padding: var(--gutter);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s var(--ease-smooth);

  &.is-visible {
    opacity: 1;
    pointer-events: auto;
  }
}

.board {
  --frame: 18px;
  // La textura de la madera se ve algo más clara que en la escena (allí la tiñe la luz cálida)
  --wood-tint: linear-gradient(rgb(185 105 30 / 0.3), rgb(185 105 30 / 0.3));
  position: relative;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: min(100%, 640px);
  max-height: 100%;
  padding: var(--frame);
  overflow: hidden;
  outline: none;
  border-radius: calc(var(--frame) * 0.45);
  // Madera clara del marco del tablón: la misma textura que el modelo 3D. Arriba y abajo con la
  // veta horizontal; los lados (abajo) la llevan vertical, cortados en inglete como un marco real
  background:
    var(--wood-tint),
    var(--wood, none) center / 600px auto,
    #d9a35c;
  box-shadow: 0 24px 60px rgb(45 42 36 / 0.25);

  @media (min-width: 840px) and (orientation: landscape) {
    // Las unidades cqw se refieren al contenedor de fuera, no a la propia ventana: su ancho se
    // calcula aparte para que el marco guarde la proporción del tablón
    --board-width: min(100vw - 2 * var(--gutter), (100svh - 2 * var(--gutter)) / 0.68, 1180px);
    --frame: calc(var(--board-width) * 0.058);
    width: var(--board-width);
    max-height: none;
    aspect-ratio: 1 / 0.68;
  }
}

.board-side {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--frame);
  background:
    var(--wood-tint),
    var(--wood-side, none) center / auto 600px,
    #d9a35c;

  &.is-left {
    left: 0;
    clip-path: polygon(0 0, 100% var(--frame), 100% calc(100% - var(--frame)), 0 100%);
  }

  &.is-right {
    right: 0;
    clip-path: polygon(0 var(--frame), 100% 0, 100% 100%, 0 calc(100% - var(--frame)));
  }
}

// Canto redondeado del marco: más oscuro hacia los bordes, con un brillo arriba
.board-bevel {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow:
    inset 0 2px 1px rgb(255 240 210 / 0.55),
    inset 0 -3px 4px rgb(110 60 20 / 0.3),
    inset 0 0 calc(var(--frame) * 0.4) rgb(120 65 20 / 0.35);
  pointer-events: none;
}

.board-cork {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-4) var(--space-4) var(--space-6);
  border-radius: calc(var(--frame) * 0.25);
  // Corcho aglomerado generado en código (`createCorkPattern`)
  background:
    var(--cork, none) 0 0 / 256px,
    #a2633a;
  // Ranura más oscura entre el marco y el corcho, como en el modelo, y la sombra del marco
  box-shadow:
    0 0 0 calc(var(--frame) * 0.1) rgb(150 90 40 / 0.55),
    0 0 calc(var(--frame) * 0.3) calc(var(--frame) * 0.1) rgb(90 50 15 / 0.3),
    inset 0 3px 10px rgb(60 30 10 / 0.5),
    inset 0 0 4px rgb(60 30 10 / 0.35);

  @media (min-width: 840px) and (orientation: landscape) {
    display: grid;
    place-content: center;
    overflow: hidden;
    padding: 2cqw 0 0;
  }
}

// En vertical va arriba, antes de los post-its; en el tablón apaisado, en la esquina
.board-back {
  display: inline-flex;
  margin-bottom: var(--space-6);
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-size);
  padding: 0 var(--space-4);
  border: 0;
  background: var(--color-banner);
  color: var(--color-white);
  font-family: var(--font-pixel);
  font-weight: 700;
  font-size: var(--font-size-small);
  text-transform: uppercase;
  transform: rotate(-3deg);
  cursor: pointer;
  transition: transform 0.2s var(--ease-smooth);

  &:hover,
  &:focus-visible {
    transform: rotate(-3deg) scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(--color-white);
    outline-offset: 3px;
  }

  @media (min-width: 840px) and (orientation: landscape) {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    margin: 0;
  }
}

// Solo para lectores de pantalla: el tablón ya dice qué es
.board-title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.board-notes {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6) var(--space-5);
  margin: 0;
  padding: 0;
  list-style: none;

  @include mixins.mq("sm") {
    grid-template-columns: repeat(2, 1fr);
  }

  // En el mismo sitio que los post-its del tablón 3D: centros a ±20 % del ancho y ±18,5 % del alto
  @media (min-width: 840px) and (orientation: landscape) {
    grid-template-columns: repeat(2, 24cqw);
    grid-auto-rows: 23cqw;
    gap: 5cqw 16cqw;
  }
}

.note {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6) var(--space-4) var(--space-5);
  // Papel: fibras finas y manchado suave (ruido SVG), la franja de pegamento de arriba algo más
  // satinada y la esquina de abajo un poco levantada (más oscura y con más sombra)
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75 0.35' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.16 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23f)'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23m)'/%3E%3C/svg%3E"),
    linear-gradient(180deg, rgb(255 255 255 / 0.08) 0 15%, transparent 19%),
    linear-gradient(150deg, transparent 62%, rgb(70 45 10 / 0.1)), var(--paper);
  color: #24221f;
  box-shadow:
    0 1px 1px rgb(0 0 0 / 0.18),
    3px 12px 14px -8px rgb(40 20 5 / 0.55),
    10px 16px 16px -12px rgb(40 20 5 / 0.45);
  transform: rotate(var(--turn));

  // Chincheta como la del tablón 3D: cabeza redonda grande y, detrás y abajo, el cuello más
  // pequeño abajo a la izquierda (dos bolas brillantes del color de la chincheta) con su sombra sobre el papel
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 34% 30%, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0) 28%),
      radial-gradient(circle at 65% 70%, rgb(0 0 0 / 0.3), rgb(0 0 0 / 0) 65%), var(--pin);
  }

  &::after {
    --pin-size: 22px;
    top: calc(var(--space-1) - var(--pin-size) * 0.35);
    width: var(--pin-size);
    height: var(--pin-size);
    box-shadow: 1px 3px 4px rgb(0 0 0 / 0.3);
    transform: translateX(-85%);
  }

  &::before {
    --pin-size: 32px;
    top: calc(var(--space-1) - var(--pin-size) * 0.75);
    z-index: 1;
    width: var(--pin-size);
    height: var(--pin-size);
    box-shadow: 2px 5px 6px rgb(0 0 0 / 0.35);
    transform: translateX(-35%);
  }

  @media (min-width: 840px) and (orientation: landscape) {
    padding: 3cqw 2cqw 1.6cqw;

    &::after {
      --pin-size: 2.3cqw;
    }

    &::before {
      --pin-size: 3.3cqw;
    }
  }
}

.note-icon {
  width: 72px;
  height: 72px;

  @media (min-width: 840px) and (orientation: landscape) {
    width: 4.8cqw;
    height: 4.8cqw;
  }
}

// Escrito a lápiz: la letra de programación de la web (ProFont, la misma que en el tablón 3D) en
// gris grafito, con el grano irregular del lápiz sobre el papel (máscara de ruido) y el título
// subrayado a mano
.pencil {
  color: #3a3a3d;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1 0.6' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.75'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23g)'/%3E%3C/svg%3E");
  mask-size: 120px;
}

.note-title,
.note-item {
  font-family: var(--font-pixel);
}

.note-title {
  margin: 0 0 var(--space-3);
  padding: 0 var(--space-2) var(--space-1);
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  text-transform: uppercase;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 8' preserveAspectRatio='none'%3E%3Cpath d='M2 5c18-3 34 1 52-1s38-2 64 0' fill='none' stroke='%233a3a3d' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")
    bottom / 100% 0.3em no-repeat;

  @media (min-width: 840px) and (orientation: landscape) {
    margin: 0 0 0.8cqw;
    font-size: 1.9cqw;
  }
}

.note-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-self: stretch;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 840px) and (orientation: landscape) {
    gap: 0.6cqw;
  }
}

.note-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 700;
  font-size: var(--font-size-small);
  line-height: 1.2;

  @media (min-width: 840px) and (orientation: landscape) {
    gap: 0.9cqw;
    font-size: 1.5cqw;
  }
}

.note-item-icon {
  flex: none;
  width: 22px;
  height: 22px;
  fill: currentColor;

  @media (min-width: 840px) and (orientation: landscape) {
    width: 2cqw;
    height: 2cqw;
  }
}

// Con la escena: la ventana es transparente (se ve el tablón 3D, que está justo detrás) y cada
// post-it se coloca sobre el suyo 3D. Recogido imita al 3D: misma medida (escala), icono grande y
// título abajo, sin lista. Al crecer: icono pequeño, subrayado que se dibuja y la lista
// Medidas del post-it en su tamaño final: 24 % del ancho del tablón, con la proporción del papel 3D
@media (min-width: 840px) and (orientation: landscape) {
  .board-layer.has-scene {
    // Al cerrar viaja con el tablón (ver createFlyToWindow) y se desvanece cuando sus post-its ya
    // se han recogido y son iguales que los 3D de debajo
    transition: opacity 0.15s var(--ease-smooth) 0.35s;

    &.is-visible {
      transition: opacity 0.25s var(--ease-smooth);
    }

    &:not(.is-visible) .board-back {
      opacity: 0;
      transition: opacity 0.12s;
    }
  }

  .board.has-scene {
    overflow: visible;
    background: none;
    box-shadow: none;

    .board-side,
    .board-bevel {
      display: none;
    }

    .board-cork {
      position: static;
      overflow: visible;
      background: none;
      box-shadow: none;
    }

    .board-back {
      top: calc(var(--frame) + var(--space-3));
      left: calc(var(--frame) + var(--space-3));
    }

    .board-notes {
      display: block;
    }

    .note {
      --w: 26cqw;
      --h: calc(var(--w) * var(--aspect));
      position: absolute;
      top: calc(var(--y) * 100%);
      left: calc(var(--x) * 100%);
      width: var(--w);
      height: var(--h);
      padding: 0 2cqw;
      transform: translate(-50%, -50%) rotate(var(--turn)) scale(var(--collapsed));
      transition: transform 0.35s var(--ease-smooth);

      // Chincheta como la 3D, medida en capturas respecto al centro de la chincheta 3D y en
      // proporción al ancho del papel: dos bolas ovaladas, la de arriba a la derecha por delante
      &::before,
      &::after {
        top: calc(50% - var(--pin-y) * 100%);
        left: calc(50% + var(--pin-x) * 100%);
      }

      // Medidas del modelo original por la escala de la chincheta del tablón (PIN_SCALE en createPostIts)
      --pin-scale: 0.8;

      &::before {
        width: calc(0.232 * var(--pin-scale) * var(--w));
        height: calc(0.2 * var(--pin-scale) * var(--w));
        transform: translate(
          calc(-50% + 0.032 * var(--pin-scale) * var(--w)),
          calc(-50% - 0.065 * var(--pin-scale) * var(--w))
        );
      }

      &::after {
        width: calc(0.264 * var(--pin-scale) * var(--w));
        height: calc(0.22 * var(--pin-scale) * var(--w));
        transform: translate(
          calc(-50% - 0.017 * var(--pin-scale) * var(--w)),
          calc(-50% + 0.055 * var(--pin-scale) * var(--w))
        );
      }
    }

    // Recogido: como el post-it 3D (icono centrado algo por encima de la mitad, título abajo), en
    // proporción al ancho del papel: icono de 0,567 × ancho (con su margen) y título de 0,155 × ancho
    .note-icon {
      width: calc(0.567 * var(--w));
      height: calc(0.567 * var(--w));
      margin-top: calc(var(--h) - 0.515 * var(--w) - 0.2835 * var(--w));
      transition:
        width 0.35s var(--ease-smooth),
        height 0.35s var(--ease-smooth),
        margin 0.35s var(--ease-smooth);
    }

    .note-title {
      margin: 0.3cqw 0 0;
      font-size: calc(0.155 * var(--w) * var(--title-fit, 1));
      background-size: 0% 0.3em;
      transition:
        font-size 0.35s var(--ease-smooth),
        margin 0.35s var(--ease-smooth),
        background-size 0.2s;
    }

    // Nunca por debajo de 14 px (ventanas bajas, donde el tablón queda pequeño)
    .note-item {
      gap: max(var(--space-2), 1cqw);
      font-size: max(14px, 1.65cqw);
    }

    .note-item-icon {
      width: max(18px, 2.2cqw);
      height: max(18px, 2.2cqw);
    }

    .note-items {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition:
        max-height 0.35s var(--ease-smooth),
        opacity 0.15s;
    }

    &.is-expanded {
      .note {
        transform: translate(-50%, -50%) rotate(var(--turn)) scale(1);
        transition: transform 0.5s var(--ease-smooth);
      }

      .note-icon {
        width: 5.2cqw;
        height: 5.2cqw;
        // La chincheta está arriba a la izquierda: el icono puede ir arriba y deja sitio a la lista
        margin-top: 2.4cqw;
        transition:
          width 0.5s var(--ease-smooth),
          height 0.5s var(--ease-smooth),
          margin 0.5s var(--ease-smooth);
      }

      .note-title {
        margin: 0.4cqw 0 0.9cqw;
        font-size: max(16px, 2.05cqw);
        background-size: 100% 0.3em;
        transition:
          font-size 0.5s var(--ease-smooth),
          margin 0.5s var(--ease-smooth),
          background-size 0.35s ease-out 0.4s;
      }

      .note-items {
        max-height: 22cqw;
        opacity: 1;
        transition:
          max-height 0.5s var(--ease-smooth) 0.1s,
          opacity 0.35s 0.3s;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .board-layer {
    transition: none;
  }
}
</style>
