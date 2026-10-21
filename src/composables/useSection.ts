import { ref } from "vue";

export type SectionId = "about" | "skills" | "projects" | "certifications" | "contact";

export const sectionIds: SectionId[] = ["about", "skills", "projects", "certifications", "contact"];

const isSectionId = (value: unknown): value is SectionId => sectionIds.includes(value as SectionId);

// Sección abierta ahora mismo. La comparten el menú y los objetos 3D.
// Va en el historial del navegador: abrir una sección añade `#skills` (o la que sea) a la dirección,
// así el botón o gesto de "atrás" (sobre todo en móvil) la cierra en vez de salir de la web, y el
// enlace con `#skills` abre la página con esa sección. Cambiar de una sección a otra no añade más
// pasos: "atrás" siempre vuelve a la habitación
const initial = window.location.hash.slice(1);
const activeSection = ref<SectionId | null>(isSectionId(initial) ? initial : null);
// `entry`: se entró a la web ya con la sección abierta; al cerrarla no hay paso atrás que deshacer
if (activeSection.value) window.history.replaceState({ section: activeSection.value, entry: true }, "");

const openSection = (id: SectionId) => {
  if (activeSection.value === id) return;
  const current = window.history.state as { section?: SectionId; entry?: boolean } | null;
  if (current?.section) window.history.replaceState({ section: id, entry: current.entry }, "", `#${id}`);
  else window.history.pushState({ section: id }, "", `#${id}`);
  activeSection.value = id;
};

const closeSection = () => {
  if (!activeSection.value) return;
  // Si la abrimos nosotros, se deshace ese paso; si se entró con el enlace, se quita el #
  if (window.history.state?.section && !window.history.state.entry) {
    window.history.back();
    return;
  }
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  activeSection.value = null;
};

window.addEventListener("popstate", (event) => {
  const section = (event.state as { section?: unknown } | null)?.section;
  activeSection.value = isSectionId(section) ? section : null;
});

export const useSection = () => ({ activeSection, openSection, closeSection });
