import { ref } from "vue";

export type SectionId = "about" | "skills" | "projects" | "certifications" | "contact";

export const sectionIds: SectionId[] = ["about", "skills", "projects", "certifications", "contact"];

// Sección abierta ahora mismo. La comparten el menú y, más adelante, los objetos 3D
const activeSection = ref<SectionId | null>(null);

const openSection = (id: SectionId) => {
  activeSection.value = id;
};

const closeSection = () => {
  activeSection.value = null;
};

export const useSection = () => ({ activeSection, openSection, closeSection });
