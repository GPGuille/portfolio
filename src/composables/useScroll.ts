import Lenis from "lenis";
import gsap from "gsap";

// Scroll suave con Lenis, movido por el mismo reloj que las animaciones de GSAP
let lenis: Lenis | null = null;

const raf = (time: number) => lenis?.raf(time * 1000);

export const startScroll = () => {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({ lerp: 0.1 });
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
};

export const stopScroll = () => {
  gsap.ticker.remove(raf);
  lenis?.destroy();
  lenis = null;
};

export const scrollTo = (target: string | number) => {
  if (lenis) lenis.scrollTo(target);
  else if (typeof target === "number") window.scrollTo({ top: target });
  else document.querySelector(target)?.scrollIntoView();
};
