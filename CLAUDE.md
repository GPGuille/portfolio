# Portfolio de Guillermo González

Contexto para cualquier asistente que trabaje en este repositorio. Léelo entero antes de tocar nada.

## Quién y qué

- **Autor:** Guillermo González Piqueras, Full Stack Developer. Escribe en español: responde siempre en español.
- **Objetivo:** su primer portfolio web. Quiere algo muy cuidado, divertido e interactivo en 3D, pero fácil de navegar.
- **Secciones previstas:** portada (nombre y título), sobre mí (quién es y dónde trabaja), habilidades (Docker, Java, Python, Vue y más), proyectos y contacto.
- **Cómo le gusta trabajar:** ir por partes y retocar sobre la marcha, viendo el resultado en cada paso. No le sirven maquetas planas ni wireframes: quiere ver la web real. Explícale cada paso con claridad, es su primer proyecto de este tipo.

## Referencia visual

La referencia principal es **david-hckh.com** (David Heckhoff): fondo crema, nombre enorme en Urbanist negrita, una etiqueta azul inclinada con el título en letra pixelada, y una habitación 3D de estilo suave y "mono" con un muñeco del autor programando en su escritorio. Al hacer scroll la cámara recorre distintas escenas.

Otras referencias que le gustan:
- **nareshkhatri.dev**: teclado 3D donde cada tecla es una tecnología (idea para la sección de habilidades).
- **robbowen.digital** (Robb Owen): autorretrato ilustrado que gira la cabeza siguiendo el ratón (idea para su avatar).

## Regla importante: nada de código de David

Guillermo **no quiere que aparezca nada de David** en su web. La licencia de David solo permite reutilizar su código manteniendo su crédito visible, así que **no se copia ni se adapta código, modelos, texturas ni textos de su repositorio** (github.com/davidhckh/portfolio-2025). Se usan las mismas herramientas y se escribe todo desde cero. Inspirarse en el aspecto está bien; copiar no.

## Tecnologías (las mismas que usa David)

| Herramienta | Para qué |
| --- | --- |
| Vue 3 + TypeScript (`<script setup>`) | La web y sus secciones |
| Vite | Desarrollo y compilación (`base: "./"`) |
| SCSS | Estilos; `mixins.scss` se inyecta en todos los `<style lang="scss">` |
| Three.js | Escena 3D en un canvas fijo detrás del contenido |
| vite-plugin-glsl | Importar shaders `.glsl` |
| GSAP | Animaciones; su `ticker` es el reloj común (render 3D y scroll) |
| Lenis | Scroll suave |
| Howler | Sonidos (aún sin usar) |
| @fontsource | Fuentes locales: Urbanist (400/700/900) |
| ProFont | Fuente de la etiqueta (negrita), en `src/assets/fonts/profont/` con su licencia MIT; descargada de tobiasjung.name/profont |

Los modelos 3D se harán en Blender y se exportarán a `.glb` (Vite ya los acepta como assets).

## Estructura

```
src/
  main.ts                    arranque y fuentes
  App.vue                    canvas 3D + página + scroll suave
  assets/styles/
    variables.scss           colores, fuentes, tamaños, capas (z-index)
    mixins.scss              breakpoints: @include mixins.mq("md") { ... }
    reset.scss, index.scss   base
  components/
    Experience.vue           canvas fijo de Three.js
    Banner.vue               etiqueta azul inclinada con animación
  composables/useScroll.ts   Lenis movido por el ticker de GSAP
  features/home/
    Home.vue                 página principal
    components/Hero.vue      portada: "Guillermo / González" + "Full Stack Developer"
  three/
    index.ts                 renderer, escena y cámara (escena vacía por ahora)
    shaders/                 shaders GLSL
```

## Decisiones de diseño ya tomadas

- Fondo `#f5efe6`, texto `#2d2a24`, etiqueta `#263c70` con texto blanco.
- Portada: "Guillermo" y "González" en dos líneas (sin "Piqueras"), Urbanist 900, y debajo la etiqueta inclinada -5° "Full Stack Developer" en ProFont (antes Pixelify Sans). El nombre va quieto, sin animación ni efectos, con los tamaños de David: 56px, 72px desde 480px de ancho y 88px desde 1280px. Mismo margen arriba y a la izquierda: `max(3vw, 16px)`.
- Animación de entrada: las líneas del nombre suben desde una máscara; la etiqueta se despliega de izquierda a derecha.
- Se probó un efecto "crucigrama" en la G y **se descartó** por lioso.
- Debe funcionar en móvil y respetar `prefers-reduced-motion`.
- **Sin scroll:** toda la web es una pantalla. La habitación 3D es el menú: cada objeto abre su sección (pantalla del ordenador → Proyectos con un "navegador" falso; tablón de corcho → Skills; estantería con títulos → Certificaciones; avatar → Sobre mí; teléfono o sobre → Contacto).
- **Menú superior** con las mismas secciones (Sobre mí, Skills, Proyectos, Certificaciones, Contacto). Es obligatorio, no un extra: es la navegación en móvil y para teclado o lector de pantalla. En móvil se pliega en un botón de menú.
- El menú y los objetos 3D comparten el estado `activeSection` de `src/composables/useSection.ts`; la sección abierta se muestra en `SectionPanel.vue`.
- **Dos idiomas** (español por defecto, botón ES/EN). Todos los textos van en `src/i18n/messages.ts`; nada de textos sueltos en los componentes.
- La habitación se empieza con formas básicas hechas en código; los modelos de Blender sustituirán los objetos uno a uno más adelante.
- Los comentarios del código van en español.

## Próximos pasos

1. ~~Subir el proyecto a GitHub~~ → github.com/GPGuille/portfolio (público).
2. ~~Barra de menú superior~~ (hecha, con panel "Próximamente" por sección).
3. Escena 3D: su habitación con escritorio, ordenador y su avatar, con formas básicas en código y objetos clicables.
4. Secciones: sobre mí, habilidades, proyectos y contacto.
5. Publicar en Vercel con dominio propio.

## Comandos

- `npm install` instala dependencias.
- `npm run dev` arranca en http://localhost:3000.
- `npm run build` comprueba tipos con `vue-tsc` y compila a `dist/`. Debe pasar sin errores antes de dar algo por terminado.
