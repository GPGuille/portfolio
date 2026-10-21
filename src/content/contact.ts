// Datos de contacto: los usan los bloques de contacto del avatar y la sección Contacto (que en
// móvil, donde no se ve el avatar, es la forma de contactar). Un dato vacío no se muestra
export type ContactLink = { id: "email" | "linkedin" | "github"; label: string; href: string; text: string };

const EMAIL = "";
const LINKEDIN_URL = "";
const GITHUB_USER = "GPGuille";

export const contactLinks: ContactLink[] = [
  { id: "email", label: "Email", href: EMAIL ? `mailto:${EMAIL}` : "", text: EMAIL },
  { id: "linkedin", label: "LinkedIn", href: LINKEDIN_URL, text: LINKEDIN_URL.replace(/^https?:\/\/(www\.)?/, "") },
  { id: "github", label: "GitHub", href: `https://github.com/${GITHUB_USER}`, text: `github.com/${GITHUB_USER}` },
].filter((link): link is ContactLink => Boolean(link.href));
