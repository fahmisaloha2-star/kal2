import { useState, useRef, useEffect, useMemo } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Menu, X, ArrowRight, Phone, Mail, MapPin,
  PenTool, Box, Palette, FileText, HardHat, Eye,
  Paintbrush, Layers, Hammer, ShoppingBag,
  ChevronDown, ChevronLeft, ChevronRight, Send, Check,
  Instagram, Facebook, Linkedin, ZoomIn,
  Home, Building2, Package, Briefcase, Store, Dumbbell,
  Sparkles, Utensils, Coffee, Tag, LayoutTemplate, Stethoscope,
} from "lucide-react";
import { useStore, useI18n, type Project } from "./store";
import { api } from "../api";
import { trackEvent } from "../analytics";

const FD = "'Playfair Display', Georgia, serif";
const FB = "'Inter', system-ui, sans-serif";
const GOLD = "#B89B5E";
const TAUPE = "#8B7D6B";

const ICON_MAP: Record<string, React.ElementType> = {
  PenTool, Box, Palette, FileText, HardHat, Eye,
  Paintbrush, Layers, Hammer, ShoppingBag,
};

function FadeIn({ children, delay = 0, className = "", direction = "up" }: {
  children: React.ReactNode; delay?: number; className?: string; direction?: "up" | "left" | "right";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: direction === "up" ? 24 : 0, x: direction === "left" ? -24 : direction === "right" ? 24 : 0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Count-up: animates the leading number from 0 → target once in view,
// re-appending any suffix ("+", "%", …). Falls back to the raw string.
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const { target, suffix, isValid } = useMemo(() => {
    const m = (value || "").match(/^(\d+)(.*)$/);
    return { 
      target: m ? parseInt(m[1], 10) : 0, 
      suffix: m ? m[2] : "",
      isValid: !!m
    };
  }, [value]);

  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || !isValid) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, isValid, target]);

  return <span ref={ref}>{isValid ? `${n}${suffix}` : value}</span>;
}

function GoldRule({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
      <span className="text-[9px] tracking-[0.45em] uppercase" style={{ fontFamily: FB, color: GOLD }}>{text}</span>
      <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
    </div>
  );
}

function PrimaryBtn({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick}
      className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-[10px] tracking-[0.22em] uppercase rounded-xl transition-all hover:shadow-lg hover:brightness-110 active:scale-95"
      style={{ fontFamily: FB, fontWeight: 600, backgroundColor: GOLD }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-2 px-7 py-3.5 text-[10px] tracking-[0.22em] uppercase rounded-xl border transition-all hover:shadow-md active:scale-95"
      style={{ fontFamily: FB, fontWeight: 500, borderColor: "#1F1F1F", color: "#1F1F1F", backgroundColor: "transparent" }}>
      {children}
    </button>
  );
}

function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

// ─── Before/After Slider ──────────────────────────────────────────────────────

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full h-72 md:h-96 overflow-hidden select-none rounded-2xl" style={{ cursor: "ew-resize" }}>
      <img src={after} alt="Après transformation" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Avant transformation" className="absolute inset-0 h-full object-cover" style={{ width: `${10000 / pos}%`, maxWidth: "none" }} />
      </div>
      {/* Divider line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center gap-0.5">
          <ChevronLeft size={11} className="text-[#1F1F1F]" />
          <ChevronRight size={11} className="text-[#1F1F1F]" />
        </div>
      </div>
      {/* Labels */}
      <span className="absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase bg-black/40 text-white px-2 py-1 rounded" style={{ fontFamily: FB }}>Avant</span>
      <span className="absolute top-3 right-3 text-[9px] tracking-[0.2em] uppercase bg-black/40 text-white px-2 py-1 rounded" style={{ fontFamily: FB }}>Après</span>
      <input type="range" min="5" max="95" value={pos} onChange={e => setPos(Number(e.target.value))}
        aria-label="Curseur avant / après"
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" />
    </div>
  );
}

// ─── Project Detail Modal ──────────────────────────────────────────────────────

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { lang, t } = useI18n();
  const [idx, setIdx] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const images = project.images.length ? project.images : [""];

  const navigate = useNavigate();
  const goContact = () => {
    onClose();
    setTimeout(() => navigate("/contact"), 60);
  };

  useEffect(() => {
    const node = dialogRef.current;
    const prevActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const selector = 'button, a[href], input, [tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      node ? Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(el => !el.hasAttribute("disabled")) : [];

    const focusTimer = setTimeout(() => { (focusables()[0] || node)?.focus(); }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft") setIdx(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx(i => Math.min(images.length - 1, i + 1));
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [onClose, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}>
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Détail du projet ${project.title}`}
        initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl outline-none"
        style={{ backgroundColor: "#F7F5F2" }}>

        {/* Close */}
        <button onClick={onClose} aria-label="Fermer"
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#1F1F1F]">
          <X size={18} />
        </button>

        {/* Gallery */}
        <div className="relative w-full h-[300px] sm:h-[400px] bg-[#1F1F1F]">
          <img src={images[idx]} alt={`${project.title} — image ${idx + 1}`} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              {idx > 0 && (
                <button onClick={() => setIdx(i => Math.max(0, i - 1))} aria-label="Image précédente"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-[#1F1F1F]">
                  <ChevronLeft size={20} />
                </button>
              )}
              {idx < images.length - 1 && (
                <button onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))} aria-label="Image suivante"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-[#1F1F1F]">
                  <ChevronRight size={20} />
                </button>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} aria-label={`Image ${i + 1}`}
                    className={`rounded-full transition-all ${i === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"}`}
                    style={{ backgroundColor: i === idx ? GOLD : "rgba(255,255,255,0.55)" }} />
                ))}
              </div>
            </>
          )}
          {project.featured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[8px] tracking-[0.18em] uppercase text-white"
              style={{ fontFamily: FB, fontWeight: 600, backgroundColor: GOLD }}>
              {lang === 'en' ? 'Featured' : 'À la une'}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-7 sm:p-10">
          <div className="text-[9px] mb-3 tracking-[0.28em] uppercase" style={{ fontFamily: FB, color: GOLD }}>
            {t(project.category as string, project.category_en)} · {t(project.location, project.location_en)} · {project.year}
          </div>
          <h3 className="text-4xl sm:text-5xl text-[#1F1F1F] mb-5" style={{ fontFamily: FD }}>{t(project.title, project.title_en)}</h3>
          <p className="text-sm text-[#4A4A4A] leading-loose mb-8 whitespace-pre-wrap" style={{ fontFamily: FB, fontWeight: 300 }}>{t(project.description, project.description_en)}</p>
          <PrimaryBtn onClick={goContact}>
            {lang === 'en' ? 'Contact us' : 'Nous contacter'} <ArrowRight size={14} />
          </PrimaryBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "hero", path: "/" },
  { id: "about", path: "/about" },
  { id: "services", path: "/services" },
  { id: "portfolio", path: "/portfolio" },
  { id: "contact", path: "/contact" }
] as const;

function Navbar() {
  const { state: { content } } = useStore();
  const { lang, t, setLanguage } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const labelFor = (id: string): string => {
    const map: Record<string, string> = {
      hero: t(content.navLabels.accueil, content.navLabels_en?.accueil),
      about: t(content.navLabels.about, content.navLabels_en?.about),
      services: t(content.navLabels.services, content.navLabels_en?.services),
      portfolio: t(content.navLabels.portfolio, content.navLabels_en?.portfolio),
      contact: t(content.navLabels.contact, content.navLabels_en?.contact),
    };
    return map[id] ?? id;
  };

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      {/* ── Desktop / tablet bar ─────────────────────────────────── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: "rgba(247, 245, 242, 0.92)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: scrolled ? "1px solid #DDD7D0" : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.07)" : "none",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between gap-6" style={{ height: 72 }}>

          {/* Logo */}
          <Link to="/" onClick={closeMenu} aria-label="Retour à l'accueil" className="flex items-center flex-shrink-0 group">
            <img src="/logo-new.png" alt="2M ARCHI" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          {/* Nav links – desktop */}
          <div className="hidden lg:flex items-center flex-1 justify-center gap-1">
            {NAV_ITEMS.map(({ id, path }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={id}
                  to={path}
                  className="relative group px-4 py-2 rounded-lg transition-colors hover:bg-[#EFEAE4]"
                  style={{
                    fontFamily: FB,
                    fontSize: 15,
                    fontWeight: 600,
                    color: active ? "#1F1F1F" : "#4A4A4A",
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    className="transition-colors duration-200"
                    style={{ color: active ? "#1F1F1F" : undefined }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = GOLD; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#4A4A4A"; }}
                  >
                    {labelFor(id)}
                  </span>
                  {/* Gold underline: persistent when active, animated on hover */}
                  <span
                    className="absolute bottom-0.5 left-4 right-4 rounded-full origin-left transition-transform duration-200"
                    style={{
                      height: 2,
                      backgroundColor: GOLD,
                      transform: active ? "scaleX(1)" : "scaleX(0)",
                      opacity: active ? 1 : 0,
                    }}
                  />
                  {!active && (
                    <span
                      className="absolute bottom-0.5 left-4 right-4 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                      style={{ height: 2, backgroundColor: GOLD }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setLanguage(lang === 'fr' ? 'en' : 'fr')}
              className="text-xs font-semibold tracking-widest uppercase hover:opacity-70 transition-opacity"
              style={{ fontFamily: FB, color: "#1F1F1F" }}
            >
              {lang === 'fr' ? 'FR' : 'EN'}
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className="lg:hidden p-2 rounded-lg hover:bg-[#EFEAE4] transition-colors -mr-1"
            style={{ color: "#1F1F1F" }}
          >
            <Menu size={22} />
          </button>
          
          <button
            onClick={() => setLanguage(lang === 'fr' ? 'en' : 'fr')}
            className="lg:hidden text-xs font-semibold tracking-widest uppercase hover:opacity-70 transition-opacity"
            style={{ fontFamily: FB, color: "#1F1F1F" }}
          >
            {lang === 'fr' ? 'FR' : 'EN'}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ backgroundColor: "#F7F5F2" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-[72px] border-b border-[#DDD7D0] flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src="/logo-new.png" alt="2M ARCHI" className="h-10 w-auto object-contain" />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
              className="p-2 rounded-xl hover:bg-[#EFEAE4] transition-colors"
              style={{ color: "#4A4A4A" }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, path }, i) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={id}
                  to={path}
                  onClick={closeMenu}
                  className="flex items-center justify-between px-4 py-4 rounded-xl text-left transition-colors hover:bg-[#EFEAE4]"
                  style={{
                    fontFamily: FB, fontSize: 17, fontWeight: 600,
                    color: active ? GOLD : "#1F1F1F",
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  >
                    {labelFor(id)}
                  </motion.span>
                  {active && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Contact footer */}
          <div className="px-6 pt-4 pb-10 border-t border-[#DDD7D0]">
            <p className="text-xs text-center" style={{ fontFamily: FB, color: "#6D6D6D" }}>
              {content.email}
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const { state: { content } } = useStore();
  const { lang, t } = useI18n();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);
  const navigate = useNavigate();

  const go = (path: string) => navigate(path);
  const cta = (label: string, path: string) => { trackEvent("cta_click", { cta_label: label }); go(path); };

  return (
    <section id="hero" ref={heroRef} className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Text panel */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 pt-28 pb-16 lg:pt-20 lg:pb-16 min-h-[60vh] lg:min-h-screen z-10 order-2 lg:order-1" style={{ backgroundColor: "#F7F5F2" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }}>
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/logo-new.png"
              alt="2M ARCHI — Architecture d'Intérieur et Design"
              className="w-72 md:w-80 lg:w-96 object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
            <span className="text-[9px] tracking-[0.45em] uppercase" style={{ fontFamily: FB, color: GOLD }}>{lang === 'en' ? 'Interior Design Studio' : 'Studio d\'Architecture d\'Intérieur'}</span>
          </div>
          <p className="text-lg md:text-xl mb-6 tracking-[0.1em]" style={{ fontFamily: FD, color: TAUPE, fontStyle: "italic" }}>
            {t(content.heroTagline, content.heroTagline_en)}
          </p>
          <p className="text-sm text-[#4A4A4A] leading-loose mb-10 max-w-md" style={{ fontFamily: FB, fontWeight: 300 }}>
            {t(content.heroDescription, content.heroDescription_en)}
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryBtn onClick={() => cta("Découvrir nos réalisations", "/portfolio")}>
              {lang === 'en' ? 'Discover our work' : 'Découvrir nos réalisations'} <ArrowRight size={14} />
            </PrimaryBtn>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }}
          className="flex gap-10 pt-12 mt-12 border-t border-[#DDD7D0]">
          {[
            { n: content.statsProjects, l: lang === 'en' ? "Completed Projects" : "Projets réalisés" },
            { n: content.statsYears, l: lang === 'en' ? "Years of experience" : "Années d'expérience" },
            { n: content.statsClients, l: lang === 'en' ? "Satisfied Clients" : "Clients satisfaits" },
          ].map(s => (
            <div key={s.l}>
              <div className="text-2xl text-[#1F1F1F]" style={{ fontFamily: FD, fontWeight: 700, color: GOLD }}><CountUp value={s.n} /></div>
              <div className="text-[9px] text-[#6D6D6D] tracking-[0.1em] uppercase mt-0.5" style={{ fontFamily: FB }}>{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Image panel */}
      <div className="relative order-1 lg:order-2 h-[55vw] sm:h-[45vw] lg:h-auto lg:min-h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: 1.12 }}>
          <motion.img
            src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&h=1600&fit=crop&auto=format"
            alt="Réalisation 2M ARCHI"
            className="w-full h-full object-cover object-center"
            initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F5F2]/20 to-transparent lg:from-transparent" />
        {/* Gold badge */}
        <div className="absolute bottom-8 right-8 hidden lg:block bg-white/90 backdrop-blur-sm px-5 py-4 shadow-lg">
          <div className="text-lg" style={{ fontFamily: FD, color: "#1F1F1F", fontWeight: 700 }}>Excellence</div>
          <div className="text-[8px] tracking-[0.32em] uppercase" style={{ fontFamily: FB, color: GOLD }}>&amp; Raffinement</div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-8 hidden lg:flex flex-col items-center gap-2">
        <span className="text-[8px] tracking-[0.32em] uppercase" style={{ fontFamily: FB, color: "#6D6D6D" }}>{lang === 'en' ? 'Scroll' : 'Défiler'}</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="w-px h-10" style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
      </motion.div>
    </section>
  );
}

// ─── Services Preview ─────────────────────────────────────────────────────────

function ServicesPreview() {
  const { state: { services } } = useStore();
  const { lang, t } = useI18n();
  const sorted = [...services].sort((a, b) => a.order - b.order).slice(0, 3);
  const navigate = useNavigate();
  const go = () => navigate("/services");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <GoldRule text={lang === 'en' ? "Our expertise" : "Nos expertises"} />
            <h2 className="text-5xl text-[#1F1F1F]" style={{ fontFamily: FD }}>{lang === 'en' ? "Our Services" : "Nos Services"}</h2>
          </div>
          <button onClick={go} className="flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase hover:gap-3 transition-all" style={{ fontFamily: FB, color: GOLD }}>
            {lang === 'en' ? "View all services" : "Voir tous les services"} <ArrowRight size={13} />
          </button>
        </FadeIn>
        <div className="grid sm:grid-cols-3 gap-6">
          {sorted.map((s, i) => {
            const Icon = ICON_MAP[s.iconName] || Eye;
            return (
              <FadeIn key={s.id} delay={i * 0.1}>
                <div className="p-7 rounded-2xl border border-[#DDD7D0] hover:border-[#B89B5E]/50 hover:shadow-md transition-all group bg-[#F7F5F2]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${GOLD}18`, border: `1px solid ${GOLD}35` }}>
                    <Icon size={17} style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-base text-[#1F1F1F] mb-2 leading-snug" style={{ fontFamily: FD }}>{t(s.title, s.title_en)}</h3>
                  <p className="text-xs text-[#6D6D6D] leading-loose line-clamp-3" style={{ fontFamily: FB, fontWeight: 300 }}>{t(s.description, s.description_en)}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Carousel ────────────────────────────────────────────────────────

function FeaturedCarousel() {
  const { state: { projects } } = useStore();
  const { lang, t } = useI18n();
  const featured = projects.filter(p => p.featured && p.published).sort((a, b) => a.order - b.order);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  const navigate = useNavigate();
  const go = (path: string) => navigate(path);

  return (
    <section style={{ backgroundColor: "#EFEAE4" }} className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <GoldRule text={lang === 'en' ? "Selection" : "Sélection"} />
            <h2 className="text-5xl text-[#1F1F1F]" style={{ fontFamily: FD }}>{lang === 'en' ? "Featured Projects" : "Réalisations à la une"}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => emblaApi?.scrollPrev()} aria-label="Précédent" className="w-10 h-10 rounded-full border border-[#DDD7D0] bg-white flex items-center justify-center text-[#4A4A4A] hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => emblaApi?.scrollNext()} aria-label="Suivant" className="w-10 h-10 rounded-full border border-[#DDD7D0] bg-white flex items-center justify-center text-[#4A4A4A] hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </FadeIn>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {featured.map(p => (
              <div key={p.id} className="flex-shrink-0 w-full sm:w-[48%] lg:w-[32%]">
                <div className="group cursor-pointer" onClick={() => go("/portfolio")}>
                  <div className="relative overflow-hidden rounded-2xl mb-4 h-64">
                    <img src={p.thumbnails?.[0] || p.images[0]} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[#1F1F1F]/0 group-hover:bg-[#1F1F1F]/20 transition-colors duration-500" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg text-[#1F1F1F] mb-1" style={{ fontFamily: FD }}>{t(p.title, p.title_en)}</h3>
                      <p className="text-xs text-[#6D6D6D]" style={{ fontFamily: FB }}>{t(p.category as string, p.category_en)} · {t(p.location, p.location_en)} · {p.year}</p>
                    </div>
                    <ArrowRight size={16} className="mt-1.5 group-hover:translate-x-1 transition-transform flex-shrink-0" style={{ color: GOLD }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {featured.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {featured.map((_, i) => (
              <button key={i} onClick={() => emblaApi?.scrollTo(i)} aria-label={`Aller à la diapositive ${i + 1}`}
                className={`rounded-full transition-all ${i === current ? "w-5 h-1.5" : "w-1.5 h-1.5"}`}
                style={{ backgroundColor: i === current ? GOLD : "#DDD7D0" }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection() {
  const { state: { content } } = useStore();
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  return (
    <section id="about" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          <FadeIn direction="right" className="relative">
            <div className="absolute -top-4 -right-4 w-full h-full rounded-2xl border border-[#DDD7D0]" />
            <img src="https://images.unsplash.com/photo-1598016677484-ad34c3fd766e?w=700&h=880&fit=crop&auto=format"
              alt="2M ARCHI studio workspace" loading="lazy" className="w-full h-[540px] object-cover rounded-2xl relative z-10" />
            <div className="absolute bottom-8 -left-6 z-20 bg-white rounded-xl p-5 shadow-lg border border-[#DDD7D0]">
              <div className="text-xl text-[#1F1F1F]" style={{ fontFamily: FD }}>2M ARCHI</div>
              <div className="text-[8px] uppercase tracking-[0.28em] mt-0.5" style={{ fontFamily: FB, color: GOLD }}>Architecture &amp; Design</div>
            </div>
          </FadeIn>

          <div>
            <FadeIn>
              <div className="flex items-center gap-3 mb-7">
                <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
                <span className="text-[9px] tracking-[0.42em] uppercase" style={{ fontFamily: FB, color: GOLD }}>{lang === 'en' ? 'Our Story' : 'Notre histoire'}</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-6xl md:text-7xl text-[#1F1F1F] mb-8 leading-snug" style={{ fontFamily: FD }}>{t(content.aboutTitle, content.aboutTitle_en)}</h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-sm text-[#4A4A4A] leading-loose mb-5" style={{ fontFamily: FB, fontWeight: 300 }}>{t(content.aboutBody1, content.aboutBody1_en)}</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-sm text-[#4A4A4A] leading-loose mb-5" style={{ fontFamily: FB, fontWeight: 300 }}>{t(content.aboutBody2, content.aboutBody2_en)}</p>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="text-sm text-[#4A4A4A] leading-loose mb-10" style={{ fontFamily: FB, fontWeight: 300 }}>{t(content.aboutBody3, content.aboutBody3_en)}</p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="grid grid-cols-3 gap-5 pt-8 border-t border-[#DDD7D0]">
                {[
                  { n: content.statsProjects, l: lang === 'en' ? "Projects" : "Projets" }, { n: content.statsYears, l: lang === 'en' ? "Years" : "Années" }, { n: content.statsClients, l: lang === 'en' ? "Satisfaction" : "Satisfaction" },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-3xl mb-1" style={{ fontFamily: FD, fontWeight: 700, color: GOLD }}><CountUp value={s.n} /></div>
                    <div className="text-[9px] uppercase tracking-[0.12em]" style={{ fontFamily: FB, color: "#6D6D6D" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.5} className="mt-8">
              <PrimaryBtn onClick={() => navigate("/contact")}>
                {lang === 'en' ? 'Contact Us' : 'Nous contacter'} <ArrowRight size={14} />
              </PrimaryBtn>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services (Detailed) ──────────────────────────────────────────────────────

const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1757262798620-c2cc40cfb440?w=700&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1614628079765-6c164f4bd970?w=700&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600488999806-8efb986d87b1?w=700&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1560184897-0e5d96d86acd?w=700&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1573167278390-0699fb12be46?w=700&h=500&fit=crop&auto=format",
];

function ServicesSection() {
  const { state: { services, content } } = useStore();
  const { lang, t } = useI18n();
  const sorted = [...services].sort((a, b) => a.order - b.order);
  const navigate = useNavigate();

  return (
    <section id="services" className="py-24 md:py-32" style={{ backgroundColor: "#EFEAE4" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-20">
          <GoldRule text="Expertise" />
          <h2 className="text-6xl md:text-7xl text-[#1F1F1F]" style={{ fontFamily: FD }}>{t(content.servicesTitle, content.servicesTitle_en)}</h2>
          <p className="text-sm text-[#6D6D6D] max-w-xl mx-auto mt-4" style={{ fontFamily: FB, fontWeight: 300 }}>{t(content.servicesSubtitle, content.servicesSubtitle_en)}</p>
        </FadeIn>
        <div className="space-y-20">
          {sorted.map((s, i) => {
            const Icon = ICON_MAP[s.iconName] || Eye;
            const even = i % 2 === 0;
            return (
              <FadeIn key={s.id} delay={0.1}>
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${even ? "" : "lg:[&>*:first-child]:order-2"}`}>
                  <div className="relative">
                    <img src={SERVICE_IMAGES[i % SERVICE_IMAGES.length]} alt={s.title} loading="lazy"
                      className="w-full h-72 object-cover rounded-2xl" />
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: GOLD }}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  <div className={even ? "lg:pl-6" : "lg:pr-6"}>
                    <div className="text-[9px] mb-4 tracking-[0.3em] uppercase" style={{ fontFamily: FB, color: GOLD }}>
                      {String(i + 1).padStart(2, "0")} / {String(sorted.length).padStart(2, "0")}
                    </div>
                    <h3 className="text-4xl md:text-5xl text-[#1F1F1F] mb-5 leading-snug" style={{ fontFamily: FD }}>{t(s.title, s.title_en)}</h3>
                    <p className="text-sm text-[#4A4A4A] leading-loose mb-7" style={{ fontFamily: FB, fontWeight: 300 }}>{t(s.description, s.description_en)}</p>
                    <button onClick={() => navigate("/contact")}
                      className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase group" style={{ fontFamily: FB, fontWeight: 600, color: GOLD }}>
                      {lang === 'en' ? 'Learn more' : 'En savoir plus'}
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Domaines d'Intervention ──────────────────────────────────────────────────

const DOMAINES = [
  { icon: Home,           label: "Maisons et Villas" },
  { icon: Building2,      label: "Appartements et Lofts" },
  { icon: Package,        label: "Espaces modulaires et conteneurs" },
  { icon: Briefcase,      label: "Bureaux et espaces professionnels" },
  { icon: Store,          label: "Locaux commerciaux" },
  { icon: Dumbbell,       label: "Salles de sport" },
  { icon: Sparkles,       label: "Centres esthétiques et spas" },
  { icon: Utensils,       label: "Hôtels et restaurants" },
  { icon: Coffee,         label: "Cafés et salons de thé" },
  { icon: Tag,            label: "Boutiques et showrooms" },
  { icon: LayoutTemplate, label: "Stands d'exposition" },
  { icon: Stethoscope,    label: "Cabinets médicaux et paramédicaux" },
];

function DomainesSection() {
  const { lang } = useI18n();
  return (
    <section id="domaines" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-16">
          <GoldRule text={lang === 'en' ? "Sectors" : "Secteurs d'intervention"} />
          <h2 className="text-6xl md:text-7xl text-[#1F1F1F] mb-4" style={{ fontFamily: FD }}>{lang === 'en' ? "Our Areas of Expertise" : "Nos Domaines d'Intervention"}</h2>
          <p className="text-sm text-[#6D6D6D] max-w-xl mx-auto" style={{ fontFamily: FB, fontWeight: 300 }}>
            {lang === 'en' ? "2M ARCHI intervenes in all sectors to design functional, aesthetic spaces adapted to each use." : "2M ARCHI intervient dans tous les secteurs pour concevoir des espaces fonctionnels, esthétiques et adaptés à chaque usage."}
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {DOMAINES.map(({ icon: Icon, label }, i) => (
            <FadeIn key={label} delay={i * 0.04}>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-[#DDD7D0] bg-[#F7F5F2] hover:border-[#B89B5E]/50 hover:shadow-md hover:bg-white transition-all group text-center">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${GOLD}18`, border: `1px solid ${GOLD}30` }}
                >
                  <Icon size={18} style={{ color: GOLD }} />
                </div>
                <span className="text-xs font-medium text-[#1F1F1F] leading-snug" style={{ fontFamily: FB }}>
                  {lang === 'en' ? (
                    label === "Maisons et Villas" ? "Houses & Villas" :
                    label === "Appartements et Lofts" ? "Apartments & Lofts" :
                    label === "Espaces modulaires et conteneurs" ? "Modular Spaces & Containers" :
                    label === "Bureaux et espaces professionnels" ? "Offices & Workspaces" :
                    label === "Locaux commerciaux" ? "Commercial Spaces" :
                    label === "Salles de sport" ? "Gyms & Fitness Centers" :
                    label === "Centres esthétiques et spas" ? "Beauty Centers & Spas" :
                    label === "Hôtels et restaurants" ? "Hotels & Restaurants" :
                    label === "Cafés et salons de thé" ? "Cafes & Tea Rooms" :
                    label === "Boutiques et showrooms" ? "Boutiques & Showrooms" :
                    label === "Stands d'exposition" ? "Exhibition Stands" :
                    label === "Cabinets médicaux et paramédicaux" ? "Medical Clinics" : label
                  ) : label}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

type Filter = "Tous" | "Résidentiel" | "Commercial" | "Bureaux" | "Hôtellerie & Restauration" | "Santé & Bien-être";
const FILTERS: Filter[] = ["Tous", "Résidentiel", "Commercial", "Bureaux", "Hôtellerie & Restauration", "Santé & Bien-être"];

function PortfolioSection() {
  const { state: { projects, content } } = useStore();
  const { lang, t } = useI18n();
  const [filter, setFilter] = useState<Filter>("Tous");
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const published = projects.filter(p => p.published);
  const filtered = filter === "Tous" ? published : published.filter(p => p.category === filter);
  const sorted = [...filtered].sort((a, b) => a.order - b.order);

  const onFilter = (f: Filter) => { setFilter(f); trackEvent("portfolio_filter", { category: f }); };
  const openProject = (p: Project) => { setModalProject(p); trackEvent("project_view", { project_title: p.title }); };

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-16">
          <GoldRule text={lang === 'en' ? 'Portfolio' : 'Réalisations'} />
          <h2 className="text-6xl md:text-7xl text-[#1F1F1F] mb-4" style={{ fontFamily: FD }}>{t(content.portfolioTitle, content.portfolioTitle_en)}</h2>
          <p className="text-sm text-[#6D6D6D] max-w-md mx-auto" style={{ fontFamily: FB, fontWeight: 300 }}>
            {t(content.portfolioSubtitle, content.portfolioSubtitle_en)}
          </p>
        </FadeIn>

        {/* Filters */}
        <FadeIn className="flex flex-wrap justify-center gap-2 mb-12">
          {FILTERS.map(f => {
            const translated = lang === 'en' ? (
              f === "Tous" ? "All" :
              f === "Résidentiel" ? "Residential" :
              f === "Commercial" ? "Commercial" :
              f === "Bureaux" ? "Offices" :
              f === "Hôtellerie & Restauration" ? "Hospitality" :
              f === "Santé & Bien-être" ? "Health & Wellness" : f
            ) : f;
            return (
              <button key={f} onClick={() => onFilter(f)}
                className={`px-5 py-2.5 text-[9px] tracking-[0.2em] uppercase rounded-full transition-all ${filter === f ? "text-white shadow-md" : "text-[#4A4A4A] border border-[#DDD7D0] hover:border-[#B89B5E] hover:text-[#B89B5E]"}`}
                style={{ fontFamily: FB, fontWeight: filter === f ? 600 : 400, backgroundColor: filter === f ? GOLD : "transparent" }}>
                {translated}
              </button>
            );
          })}
        </FadeIn>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {sorted.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.06} className="break-inside-avoid">
              <div className="group relative overflow-hidden rounded-2xl cursor-pointer bg-[#EFEAE4] transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                role="button" tabIndex={0}
                aria-label={`Voir le projet ${p.title}`}
                onClick={() => openProject(p)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(p); } }}>
                <img src={p.thumbnails?.[0] || p.images[0]} alt={p.title} loading="lazy" className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[#1F1F1F]/0 group-hover:bg-[#1F1F1F]/45 transition-colors duration-400 rounded-2xl flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <span className="text-[8px] tracking-[0.25em] uppercase" style={{ fontFamily: FB, color: GOLD }}>
                    {t(p.category as string, p.category_en)} · {t(p.location, p.location_en)} · {p.year}
                  </span>
                  <div className="text-white text-lg mt-0.5" style={{ fontFamily: FD }}>{t(p.title, p.title_en)}</div>
                </div>
                {p.featured && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[8px] tracking-[0.18em] uppercase text-white"
                    style={{ fontFamily: FB, fontWeight: 600, backgroundColor: GOLD }}>
                    À la une
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Before/After */}
        <div className="mt-24">
          <FadeIn className="text-center mb-10">
            <GoldRule text="Transformation" />
            <h3 className="text-5xl text-[#1F1F1F]" style={{ fontFamily: FD }}>Avant / Après</h3>
            <p className="text-sm text-[#6D6D6D] mt-3" style={{ fontFamily: FB, fontWeight: 300 }}>Glissez pour voir la transformation complète</p>
          </FadeIn>
          <FadeIn>
            <BeforeAfterSlider before={content.beforeAfterBefore} after={content.beforeAfterAfter} />
          </FadeIn>
        </div>
      </div>

      <AnimatePresence>
        {modalProject && <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />}
      </AnimatePresence>
    </section>
  );
}

// ─── Process (Timeline) ───────────────────────────────────────────────────────

const STEPS_FR = [
  { n: "01", title: "Analyse des besoins", desc: "Rencontre initiale pour comprendre vos attentes, contraintes et ambitions. Définition du budget, du calendrier et des orientations du projet." },
  { n: "02", title: "Conception et plans 2D", desc: "Création des plans d'aménagement détaillés avec optimisation des espaces et des flux selon les besoins spécifiques du projet." },
  { n: "03", title: "Modélisation 3D", desc: "Rendus réalistes permettant de visualiser précisément votre espace avant les travaux et de valider chaque choix esthétique." },
  { n: "04", title: "Élaboration du dossier technique", desc: "Préparation de l'ensemble des documents techniques nécessaires à l'exécution : plans d'exécution, cahiers des charges, sélection des entreprises." },
  { n: "05", title: "Coordination et suivi des travaux", desc: "Gestion et contrôle rigoureux du chantier à chaque étape : coordination des corps de métier, contrôle qualité et respect des délais." },
  { n: "06", title: "Livraison finale du projet", desc: "Remise d'un espace parfaitement réalisé conforme aux plans validés, accompagnée d'un bilan complet et d'une visite commentée." },
];

const STEPS_EN = [
  { n: "01", title: "Needs Analysis", desc: "Initial meeting to understand your expectations, constraints, and ambitions. Defining budget, timeline, and project direction." },
  { n: "02", title: "2D Plans & Design", desc: "Creation of detailed layout plans optimizing spaces and flows according to the project's specific needs." },
  { n: "03", title: "3D Modeling", desc: "Realistic renderings allowing you to precisely visualize your space before work begins and validate every aesthetic choice." },
  { n: "04", title: "Technical Documentation", desc: "Preparation of all technical documents necessary for execution: working drawings, specifications, and contractor selection." },
  { n: "05", title: "Coordination & Follow-up", desc: "Rigorous management and control of the site at each stage: coordinating trades, quality control, and meeting deadlines." },
  { n: "06", title: "Final Delivery", desc: "Handover of a perfectly realized space compliant with approved plans, accompanied by a full review and guided tour." },
];

function ProcessSection() {
  const { lang } = useI18n();
  const steps = lang === 'en' ? STEPS_EN : STEPS_FR;

  return (
    <section id="process" className="py-24 md:py-32" style={{ backgroundColor: "#EFEAE4" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-20">
          <GoldRule text={lang === 'en' ? 'Our Method' : 'Notre méthode'} />
          <h2 className="text-6xl md:text-7xl text-[#1F1F1F]" style={{ fontFamily: FD }}>{lang === 'en' ? 'Our Working Method' : 'Notre Méthode de Travail'}</h2>
        </FadeIn>
        <div className="relative">
          {/* Central vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block" style={{ backgroundColor: "#DDD7D0", transform: "translateX(-50%)" }} />

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, i) => {
              const even = i % 2 === 0;
              return (
                <FadeIn key={step.n} delay={i * 0.1} className="lg:grid lg:grid-cols-2 lg:gap-16 lg:mb-12">
                  {/* Left slot */}
                  <div className={`${even ? "lg:text-right" : "lg:order-2"}`}>
                    {even ? (
                      <div className="bg-white rounded-2xl p-7 border border-[#DDD7D0] hover:border-[#B89B5E]/40 hover:shadow-md transition-all">
                        <div className="text-[10px] mb-3 tracking-[0.35em] uppercase" style={{ fontFamily: FB, color: GOLD }}>{lang === 'en' ? 'Step' : 'Étape'} {step.n}</div>
                        <h3 className="text-3xl text-[#1F1F1F] mb-3" style={{ fontFamily: FD }}>{step.title}</h3>
                        <p className="text-sm text-[#4A4A4A] leading-loose" style={{ fontFamily: FB, fontWeight: 300 }}>{step.desc}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Centre dot */}
                  <div className="hidden lg:flex items-center justify-center relative">
                    <div className="absolute w-9 h-9 rounded-full border-2 flex items-center justify-center bg-white z-10"
                      style={{ borderColor: GOLD }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GOLD }} />
                    </div>
                  </div>

                  {/* Right slot */}
                  <div className={`${!even ? "" : "lg:order-2"} mt-4 lg:mt-0`}>
                    {!even ? (
                      <div className="bg-white rounded-2xl p-7 border border-[#DDD7D0] hover:border-[#B89B5E]/40 hover:shadow-md transition-all">
                        <div className="text-[10px] mb-3 tracking-[0.35em] uppercase" style={{ fontFamily: FB, color: GOLD }}>{lang === 'en' ? 'Step' : 'Étape'} {step.n}</div>
                        <h3 className="text-3xl text-[#1F1F1F] mb-3" style={{ fontFamily: FD }}>{step.title}</h3>
                        <p className="text-sm text-[#4A4A4A] leading-loose" style={{ fontFamily: FB, fontWeight: 300 }}>{step.desc}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden bg-white rounded-2xl p-6 border border-[#DDD7D0]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: GOLD }}>
                        <div className="text-[9px] font-bold" style={{ color: GOLD }}>{i + 1}</div>
                      </div>
                      <h3 className="text-lg text-[#1F1F1F]" style={{ fontFamily: FD }}>{step.title}</h3>
                    </div>
                    <p className="text-xs text-[#4A4A4A] leading-loose pl-11" style={{ fontFamily: FB, fontWeight: 300 }}>{step.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Instagram Preview ────────────────────────────────────────────────────────

const INSTA_IMGS = [
  "https://images.unsplash.com/photo-1776673687936-65e63a5a3e05?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1614628079765-6c164f4bd970?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1628745423010-bfb4df95f3eb?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1771888703723-01d85da1dae1?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1573167278390-0699fb12be46?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1757262798620-c2cc40cfb440?w=400&h=400&fit=crop&auto=format",
];

function InstagramSection() {
  const { state: { content } } = useStore();
  const { lang } = useI18n();
  return (
    <section className="py-24" style={{ backgroundColor: "#EFEAE4" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-12">
          <GoldRule text="Instagram" />
          <h2 className="text-5xl text-[#1F1F1F] mb-2" style={{ fontFamily: FD }}>{lang === 'en' ? 'Follow 2M ARCHI on Instagram' : 'Suivez 2M ARCHI sur Instagram'}</h2>
          <p className="text-xs text-[#6D6D6D]" style={{ fontFamily: FB }}>@2m.archi</p>
        </FadeIn>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8">
          {INSTA_IMGS.map((src, i) => (
            <FadeIn key={i} delay={i * 0.07} className="aspect-square overflow-hidden rounded-xl">
              <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent("social_click", { platform: "Instagram" })}
                aria-label="Voir sur Instagram"
                className="w-full h-full group cursor-pointer relative overflow-hidden block">
                <img src={src} alt={`Publication Instagram ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-[#B89B5E]/0 group-hover:bg-[#B89B5E]/25 transition-colors duration-500 flex items-center justify-center">
                  <Instagram size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="text-center">
          <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "Instagram" })}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border text-sm transition-all hover:shadow-md"
            style={{ fontFamily: FB, fontWeight: 500, borderColor: GOLD, color: GOLD }}>
            <Instagram size={16} /> {lang === 'en' ? 'Follow on Instagram' : 'Suivre sur Instagram'}
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FaqSection() {
  const { state: { faqs } } = useStore();
  const { lang, t } = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  const sorted = [...faqs].sort((a, b) => a.order - b.order);
  return (
    <section id="faq" className="py-24 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <GoldRule text={lang === 'en' ? 'Frequently Asked Questions' : 'Questions fréquentes'} />
          <h2 className="text-6xl md:text-7xl text-[#1F1F1F]" style={{ fontFamily: FD }}>FAQ</h2>
        </FadeIn>
        <div className="space-y-3">
          {sorted.map((faq, i) => (
            <FadeIn key={faq.id} delay={i * 0.06}>
              <div className={`rounded-2xl border overflow-hidden transition-colors ${open === faq.id ? "border-[#B89B5E]/50" : "border-[#DDD7D0]"}`}>
                <button onClick={() => setOpen(open === faq.id ? null : faq.id)}
                  aria-expanded={open === faq.id}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group">
                  <span className="text-sm text-[#1F1F1F] group-hover:text-[#B89B5E] transition-colors pr-6 leading-snug" style={{ fontFamily: FD }}>
                    {t(faq.question, faq.question_en)}
                  </span>
                  <motion.div animate={{ rotate: open === faq.id ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex-shrink-0">
                    <ChevronDown size={17} style={{ color: open === faq.id ? GOLD : "#6D6D6D" }} />
                  </motion.div>
                </button>
                {open === faq.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-[#4A4A4A] leading-loose" style={{ fontFamily: FB, fontWeight: 300 }}>{t(faq.answer, faq.answer_en)}</p>
                  </motion.div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactSection() {
  const { state: { content } } = useStore();
  const { lang, t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.sendContact(form);
      if (res.ok) {
        setStatus("sent");
        trackEvent("contact_form_submit");
        setForm({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const fieldCls = "w-full bg-[#F7F5F2] border border-[#DDD7D0] focus:border-[#B89B5E] outline-none px-4 py-3 text-sm text-[#1F1F1F] placeholder:text-[#6D6D6D]/60 transition-colors rounded-xl";

  const socials = [
    { I: Instagram, l: "Instagram", url: content.instagramUrl },
    { I: Facebook, l: "Facebook", url: content.facebookUrl },
    { I: Linkedin, l: "LinkedIn", url: content.linkedinUrl },
    { I: PinterestIcon, l: "Pinterest", url: content.pinterestUrl },
  ];

  return (
    <section id="contact" className="py-24 md:py-32" style={{ backgroundColor: "#EFEAE4" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <FadeIn className="text-center mb-20">
          <GoldRule text={lang === 'en' ? 'Let\'s talk about your project' : 'Parlons de votre projet'} />
          <h2 className="text-6xl md:text-7xl text-[#1F1F1F]" style={{ fontFamily: FD }}>{t(content.contactTitle, content.contactTitle_en)}</h2>
          <p className="text-sm text-[#6D6D6D] max-w-md mx-auto mt-4" style={{ fontFamily: FB, fontWeight: 300 }}>{t(content.contactSubtitle, content.contactSubtitle_en)}</p>
        </FadeIn>
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">
          <FadeIn>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" placeholder={lang === 'en' ? "Your Name" : "Votre nom"} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={fieldCls} style={{ fontFamily: FB, fontWeight: 300 }} aria-label="Votre nom" required />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={fieldCls} style={{ fontFamily: FB, fontWeight: 300 }} aria-label="Email" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="tel" placeholder={lang === 'en' ? "Phone" : "Téléphone"} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={fieldCls} style={{ fontFamily: FB, fontWeight: 300 }} aria-label="Téléphone" />
                <input type="text" placeholder={lang === 'en' ? "Subject" : "Sujet"} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={fieldCls} style={{ fontFamily: FB, fontWeight: 300 }} aria-label="Sujet" />
              </div>
              <textarea placeholder={lang === 'en' ? "Describe your project..." : "Décrivez votre projet..."} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5}
                className={`${fieldCls} resize-none`} style={{ fontFamily: FB, fontWeight: 300 }} aria-label="Votre message" required />

              {/* Honeypot — hidden from real users, catches bots */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                style={{ display: "none" }} />

              <PrimaryBtn type="submit">
                {status === "loading" ? (lang === 'en' ? "Sending..." : "Envoi en cours...") : status === "sent" ? <><Check size={14} /> {lang === 'en' ? "Request sent" : "Demande envoyée"} ✓</> : <><Send size={14} /> {lang === 'en' ? "Send Request" : "Envoyer la demande"}</>}
              </PrimaryBtn>

              {status === "error" && (
                <p className="text-sm" style={{ fontFamily: FB, color: "#C0392B" }}>
                  {lang === 'en' ? "An error occurred. Please try again." : "Une erreur s'est produite. Veuillez réessayer."}
                </p>
              )}
            </form>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="space-y-8">
              {[
                { I: MapPin, l: "Zone de service", v: content.address },
                { I: Phone, l: "Téléphone", v: content.phone },
                { I: Mail, l: "Email", v: content.email },
              ].map(({ I, l, v }) => (
                <div key={l} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                    <I size={16} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: FB, color: GOLD }}>{l}</div>
                    <div className="text-sm text-[#4A4A4A]" style={{ fontFamily: FB, fontWeight: 300 }}>{v}</div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div>
                <div className="text-[9px] uppercase tracking-[0.32em] mb-4" style={{ fontFamily: FB, color: GOLD }}>Retrouvez-nous sur</div>
                <div className="flex gap-3">
                  {socials.map(({ I, l, url }) => (
                    <a key={l} href={url || "#"} target="_blank" rel="noopener noreferrer" aria-label={l}
                      onClick={() => trackEvent("social_click", { platform: l })}
                      className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:shadow-md"
                      style={{ borderColor: "#DDD7D0", color: "#4A4A4A", backgroundColor: "white" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = GOLD; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#DDD7D0"; (e.currentTarget as HTMLElement).style.color = "#4A4A4A"; }}>
                      <I size={15} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="relative h-52 overflow-hidden rounded-2xl bg-[#DDD7D0]">
                <img src="https://images.unsplash.com/photo-1573167278390-0699fb12be46?w=700&h=400&fit=crop&auto=format"
                  alt="Zone de service" loading="lazy" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <MapPin size={26} style={{ color: GOLD }} />
                  <span className="text-xs text-[#1F1F1F]/80 tracking-[0.18em]" style={{ fontFamily: FB }}>{content.address}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const { state: { content } } = useStore();
  const { lang, t } = useI18n();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const socials = [
    { I: Instagram, l: "Instagram", url: content.instagramUrl },
    { I: Facebook, l: "Facebook", url: content.facebookUrl },
    { I: Linkedin, l: "LinkedIn", url: content.linkedinUrl },
    { I: PinterestIcon, l: "Pinterest", url: content.pinterestUrl },
  ];
  return (
    <footer className="bg-[#1F1F1F] text-white/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div>
            <Link to="/" onClick={() => window.scrollTo(0,0)} className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <img src="/logo-new.png" alt="2M ARCHI" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-xs text-white/40 leading-loose" style={{ fontFamily: FB, fontWeight: 300 }}>Des espaces uniques où esthétique, fonctionnalité et innovation se rencontrent.</p>
          </div>
          <div>
            <div className="text-[8px] tracking-[0.32em] uppercase mb-6" style={{ fontFamily: FB, color: GOLD }}>Navigation</div>
            <ul className="space-y-3">
              {[
                { l: t(content.navLabels.accueil, content.navLabels_en?.accueil) || "Accueil", path: "/" },
                { l: t(content.navLabels.about, content.navLabels_en?.about) || "À propos", path: "/about" },
                { l: t(content.navLabels.services, content.navLabels_en?.services) || "Services", path: "/services" },
                { l: t(content.navLabels.portfolio, content.navLabels_en?.portfolio) || "Réalisations", path: "/portfolio" },
                { l: t(content.navLabels.contact, content.navLabels_en?.contact) || "Contact", path: "/contact" }
              ].map(({ l, path }) => (
                <li key={path}><Link to={path} onClick={() => window.scrollTo(0,0)} className="text-xs text-white/40 hover:text-white transition-colors" style={{ fontFamily: FB, fontWeight: 300 }}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[8px] tracking-[0.32em] uppercase mb-6" style={{ fontFamily: FB, color: GOLD }}>Services</div>
            <ul className="space-y-3">
              {["Plans 2D","Modélisation 3D","Décoration & Design","Dossier Technique","Suivi de Chantier"].map(s => (
                <li key={s}><Link to="/services" onClick={() => window.scrollTo(0,0)} className="text-xs text-white/40 hover:text-white transition-colors text-left" style={{ fontFamily: FB, fontWeight: 300 }}>{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[8px] tracking-[0.32em] uppercase mb-6" style={{ fontFamily: FB, color: GOLD }}>Contact</div>
            <ul className="space-y-3 mb-7">
              {[{I:MapPin,t:content.address},{I:Phone,t:content.phone},{I:Mail,t:content.email}].map(({I,t}) => (
                <li key={t} className="flex items-center gap-2.5"><I size={12} style={{ color: GOLD }} /><span className="text-xs text-white/40" style={{ fontFamily: FB, fontWeight: 300 }}>{t}</span></li>
              ))}
            </ul>
            <div className="flex gap-2.5">
              {socials.map(({I,l,url}) => (
                <a key={l} href={url || "#"} target="_blank" rel="noopener noreferrer" aria-label={l}
                  onClick={() => trackEvent("social_click", { platform: l })}
                  className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-white/35 hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors"><I size={13} /></a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[9px] text-white/25 tracking-[0.12em]" style={{ fontFamily: FB }}>© 2026 2M ARCHI. Tous droits réservés.</p>
          <p className="text-[9px] text-white/18" style={{ fontFamily: FB }}>{content.address}</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <FeaturedCarousel />
    </>
  );
}

function About() {
  return (
    <>
      <AboutSection />
      <ProcessSection />
    </>
  );
}

function Services() {
  return (
    <>
      <ServicesSection />
      <DomainesSection />
    </>
  );
}

function Portfolio() {
  return (
    <PortfolioSection />
  );
}

function Contact() {
  return (
    <>
      <InstagramSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Website() {
  const { state: { content, faqs } } = useStore();

  // Scroll to top on route change
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // JSON-LD structured data (LocalBusiness + FAQPage).
  useEffect(() => {
    const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || "";
    const lb = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "2M ARCHI",
      "url": PUBLIC_URL,
      "logo": `${PUBLIC_URL}/logo.png`,
      "image": `${PUBLIC_URL}/og-image.jpg`,
      "description": "Studio d'architecture d'intérieur et design à Tunis",
      "telephone": content.phone,
      "email": content.email,
      "address": { "@type": "PostalAddress", "addressLocality": "Hammamet", "addressCountry": "TN" },
      "geo": { "@type": "GeoCoordinates", "latitude": 36.4, "longitude": 10.6 },
      "sameAs": [content.instagramUrl, content.facebookUrl].filter(u => u && u !== "#"),
      "openingHours": "Mo-Fr 09:00-18:00",
      "priceRange": "$$",
    };
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer },
      })),
    };
    const entries: [string, unknown][] = [["lb-schema", lb], ["faq-schema", faqSchema]];
    entries.forEach(([id]) => document.getElementById(id)?.remove());
    entries.forEach(([id, data]) => {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    });
  }, [content, faqs]);

  return (
    <div style={{ backgroundColor: "#F7F5F2", color: "#1F1F1F" }} className="overflow-x-hidden">
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:shadow"
        style={{ fontFamily: FB }}>
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
