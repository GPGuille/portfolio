import type { SectionId } from "../composables/useSection";

export type Locale = "es" | "en";

type Messages = {
  meta: { title: string; description: string };
  sections: Record<SectionId, string>;
  hero: { jobTitle: string };
  nav: { label: string; open: string; close: string; switchLanguage: string };
  panel: { close: string; comingSoon: string };
};

// Todos los textos de la web, en los dos idiomas
export const messages: Record<Locale, Messages> = {
  es: {
    meta: {
      title: "Guillermo González · Full Stack Developer",
      description: "Portfolio de Guillermo González Piqueras, desarrollador full stack.",
    },
    sections: {
      about: "Sobre mí",
      skills: "Skills",
      projects: "Proyectos",
      certifications: "Certificaciones",
      contact: "Contacto",
    },
    hero: { jobTitle: "Full Stack Developer" },
    nav: {
      label: "Menú principal",
      open: "Abrir menú",
      close: "Cerrar menú",
      switchLanguage: "Switch to English",
    },
    panel: { close: "Cerrar", comingSoon: "Próximamente" },
  },
  en: {
    meta: {
      title: "Guillermo González · Full Stack Developer",
      description: "Portfolio of Guillermo González Piqueras, full stack developer.",
    },
    sections: {
      about: "About me",
      skills: "Skills",
      projects: "Projects",
      certifications: "Certifications",
      contact: "Contact",
    },
    hero: { jobTitle: "Full Stack Developer" },
    nav: {
      label: "Main menu",
      open: "Open menu",
      close: "Close menu",
      switchLanguage: "Cambiar a español",
    },
    panel: { close: "Close", comingSoon: "Coming soon" },
  },
};
