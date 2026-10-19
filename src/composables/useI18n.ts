import { computed, ref, watchEffect } from "vue";
import { messages, type Locale } from "../i18n/messages";

const STORAGE_KEY = "locale";

// Español por defecto; se recuerda el idioma que elija el visitante
const readStoredLocale = (): Locale => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
};

const locale = ref<Locale>(readStoredLocale());

// Idioma, título de la pestaña y descripción siguen al idioma elegido
watchEffect(() => {
  const { meta } = messages[locale.value];
  document.documentElement.lang = locale.value;
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  try {
    localStorage.setItem(STORAGE_KEY, locale.value);
  } catch {
    // Sin almacenamiento (modo privado): el idioma solo dura esta visita
  }
});

const t = computed(() => messages[locale.value]);

const toggleLocale = () => {
  locale.value = locale.value === "es" ? "en" : "es";
};

export const useI18n = () => ({ locale, t, toggleLocale });
