import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { api } from "../api";

export type Language = "fr" | "en";

export type ProjectCategory = "Résidentiel" | "Commercial" | "Bureaux" | "Hôtellerie & Restauration" | "Santé & Bien-être";

export interface Project {
  id: string; title: string; title_en?: string; category: ProjectCategory | string; category_en?: string; location: string; location_en?: string; year: number;
  images: string[]; thumbnails?: string[]; description: string; description_en?: string; featured: boolean; published: boolean; order: number;
}
export interface Service { id: string; iconName: string; title: string; title_en?: string; description: string; description_en?: string; image?: string; order: number; }
export interface Testimonial { id: string; name: string; project: string; project_en?: string; text: string; text_en?: string; rating: number; order?: number; }
export interface FaqItem { id: string; question: string; question_en?: string; answer: string; answer_en?: string; order: number; }

export interface NavLabels {
  accueil: string; about: string; services: string; domaines: string; portfolio: string; contact: string;
}
export interface NavLabelsEn {
  accueil?: string; about?: string; services?: string; domaines?: string; portfolio?: string; contact?: string;
}

export interface SiteContent {
  // Existing
  heroTitle: string; heroTitle_en?: string; heroTagline: string; heroTagline_en?: string; heroDescription: string; heroDescription_en?: string;
  aboutTitle: string; aboutTitle_en?: string; aboutBody1: string; aboutBody1_en?: string; aboutBody2: string; aboutBody2_en?: string; aboutBody3: string; aboutBody3_en?: string;
  phone: string; email: string; address: string;
  statsProjects: string; statsYears: string; statsClients: string;
  // New
  servicesTitle: string; servicesTitle_en?: string; servicesSubtitle: string; servicesSubtitle_en?: string;
  portfolioTitle: string; portfolioTitle_en?: string; portfolioSubtitle: string; portfolioSubtitle_en?: string;
  contactTitle: string; contactTitle_en?: string; contactSubtitle: string; contactSubtitle_en?: string;
  navLabels: NavLabels; navLabels_en?: NavLabelsEn;
  instagramUrl: string; facebookUrl: string; linkedinUrl: string; pinterestUrl: string;
  beforeAfterBefore: string; beforeAfterAfter: string;
  typography?: {
    globalScale?: string;
    h1Size?: string;
    h2Size?: string;
    h3Size?: string;
    pSize?: string;
  };
}

export interface ContactForm {
  name: string; email: string; phone: string; subject: string; message: string; website: string;
}

export interface AppState {
  projects: Project[]; services: Service[]; testimonials: Testimonial[]; faqs: FaqItem[]; content: SiteContent;
}

const img = (id: string, w = 800, h = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

// ── Default content — also the offline fallback if the API is unreachable. ──
const defaultContent: SiteContent = {
  heroTitle: "2M ARCHI",
  heroTagline: "Architecture d'Intérieur et Design",
  heroDescription: "Créer des espaces uniques où esthétique, fonctionnalité et innovation se rencontrent.",
  aboutTitle: "À propos de 2M ARCHI",
  aboutBody1: "2M ARCHI est une société spécialisée en architecture d'intérieur et design. L'agence propose des solutions créatives et sur mesure, alliant esthétique et fonctionnalité, afin de répondre aux besoins spécifiques de chaque client.",
  aboutBody2: "Grâce à son expertise en conception 2D et 3D, 2M ARCHI accompagne chaque projet de l'idée initiale à sa réalisation, en assurant l'aménagement des espaces, la coordination des travaux ainsi que le suivi de chantier avec rigueur et professionnalisme.",
  aboutBody3: "Notre mission est de concevoir des espaces harmonieux, fonctionnels et durables qui reflètent l'identité et les attentes de chaque client.",
  phone: "+216 XX XXX XXX", email: "contact@2marchi.com", address: "Hammamet, Tunisie",
  statsProjects: "80+", statsYears: "10+", statsClients: "100%",
  servicesTitle: "Nos Projets", servicesSubtitle: "Un accompagnement complet, de la conception à la livraison.",
  portfolioTitle: "Nos Réalisations", portfolioSubtitle: "Une sélection de projets réalisés avec passion, rigueur et expertise.",
  contactTitle: "Contactez-nous", contactSubtitle: "Parlons de votre projet.",
  navLabels: { accueil: "Accueil", about: "À propos", services: "Services", domaines: "Domaines", portfolio: "Réalisations", contact: "Contact" },
  navLabels_en: { accueil: "Home", about: "About", services: "Services", domaines: "Sectors", portfolio: "Portfolio", contact: "Contact" },
  instagramUrl: "https://www.instagram.com/2m.archi",
  facebookUrl: "https://www.facebook.com/share/1GnDe6Dn3Q/?mibextid=wwXIfr",
  linkedinUrl: "#", pinterestUrl: "#",
  beforeAfterBefore: img("1655175468016-a38acfa1277b", 800, 500),
  beforeAfterAfter: img("1583847268964-b28dc8f51f92", 800, 500),
};

const defaultProjects: Project[] = [
  { id:"p1", title:"Villa Lumière", category:"Résidentiel", location:"La Marsa", year:2024,
    images:[img("1583847268964-b28dc8f51f92",900,600), img("1757262798620-c2cc40cfb440",900,600)],
    description:"Villa familiale contemporaine alliant volumes généreux, matériaux naturels et palette de teintes sable et ivoire.",
    featured:true, published:true, order:0 },
  { id:"p2", title:"Appartement Prestige", category:"Résidentiel", location:"Carthage", year:2024,
    images:[img("1614628079765-6c164f4bd970",800,700), img("1776673687936-65e63a5a3e05",800,600)],
    description:"Appartement entièrement rénové avec des détails soignés, des finitions artisanales et une palette raffinée.",
    featured:true, published:true, order:1 },
  { id:"p3", title:"Restaurant Le Jasmin", category:"Hôtellerie & Restauration", location:"Tunis Centre", year:2023,
    images:[img("1600488999806-8efb986d87b1",800,600), img("1560184897-0e5d96d86acd",800,600)],
    description:"Restaurant gastronomique imaginé comme un écrin chaleureux aux accents méditerranéens, avec mobilier sur mesure.",
    featured:true, published:true, order:2 },
  { id:"p4", title:"Espace Bien-être & Spa", category:"Santé & Bien-être", location:"Sidi Bou Saïd", year:2024,
    images:[img("1573167278390-0699fb12be46",800,600)],
    description:"Centre esthétique et spa alliant sérénité, matériaux nobles et lumière naturelle pour une expérience apaisante.",
    featured:false, published:true, order:3 },
  { id:"p5", title:"Bureaux Open Space", category:"Bureaux", location:"Lac 2, Tunis", year:2023,
    images:[img("1771888703723-01d85da1dae1",800,600)],
    description:"550 m² de bureaux repensés pour favoriser la créativité, le bien-être et l'efficacité des équipes.",
    featured:false, published:true, order:4 },
  { id:"p6", title:"Boutique Showroom", category:"Commercial", location:"Tunis", year:2022,
    images:[img("1628745423010-bfb4df95f3eb",800,600), img("1613685303213-1f646ca61306",800,600)],
    description:"Boutique showroom au design épuré mettant en valeur les produits grâce à un éclairage et un agencement étudiés.",
    featured:false, published:true, order:5 },
];

const defaultServices: Service[] = [
  { id:"s1", iconName:"PenTool", title:"Conception architecturale et plans 2D", description:"Création de plans détaillés et optimisation des espaces selon les besoins du projet.", order:0 },
  { id:"s2", iconName:"Box", title:"Modélisation et visualisation 3D", description:"Rendus réalistes permettant de visualiser le projet avant sa réalisation.", order:1 },
  { id:"s3", iconName:"Palette", title:"Décoration et Design", description:"Création d'ambiances personnalisées et harmonieuses adaptées à chaque client.", order:2 },
  { id:"s4", iconName:"FileText", title:"Élaboration de dossiers techniques", description:"Préparation des documents techniques nécessaires à l'exécution du projet.", order:3 },
  { id:"s5", iconName:"Paintbrush", title:"Conseil et sélection des peintures, matériaux et finitions", description:"Choix des matériaux adaptés pour garantir qualité et esthétique.", order:4 },
  { id:"s6", iconName:"Layers", title:"Choix des couleurs et harmonisation des ambiances", description:"Développement de palettes cohérentes pour créer des espaces équilibrés.", order:5 },
  { id:"s7", iconName:"Hammer", title:"Conception et réalisation de mobilier sur mesure", description:"Création de meubles personnalisés adaptés à chaque projet et espace.", order:6 },
  { id:"s8", iconName:"ShoppingBag", title:"Accompagnement shopping et sourcing fournisseurs", description:"Recherche et sélection des meilleurs fournisseurs, matériaux et accessoires.", order:7 },
  { id:"s9", iconName:"HardHat", title:"Suivi et coordination des travaux", description:"Gestion et contrôle rigoureux du chantier jusqu'à la livraison finale.", order:8 },
];

const defaultTestimonials: Testimonial[] = [
  { id:"t1", name:"Sana Ben Romdhane", project:"Villa Résidentielle · La Marsa",
    text:"2M ARCHI a transformé notre maison en un véritable chef-d'œuvre. Leur sens du détail, la qualité de la 3D et le suivi rigoureux du chantier ont fait toute la différence.", rating:5, order:0 },
  { id:"t2", name:"Tarek Chekili", project:"Bureaux Open Space · Lac 2",
    text:"Un travail professionnel du début à la fin. Les plans 2D étaient clairs, les rendus 3D bluffants et la livraison dans les délais. Je recommande fortement 2M ARCHI.", rating:5, order:1 },
  { id:"t3", name:"Leila Gharbi", project:"Boutique Showroom · Tunis",
    text:"Équipe créative, à l'écoute et très professionnelle. Notre boutique est devenue un vrai espace de vie qui attire et fidélise nos clients. Merci 2M ARCHI.", rating:5, order:2 },
];

const defaultFaqs: FaqItem[] = [
  { id:"f1", question:"Quelles sont les étapes d'un projet avec 2M ARCHI ?", answer:"Nous commençons par une analyse de vos besoins, suivie de la conception des plans 2D et de la modélisation 3D. Après validation, nous élaborons le dossier technique, coordonnons les travaux et assurons un suivi rigoureux jusqu'à la livraison finale.", order:0 },
  { id:"f2", question:"Dans quels secteurs intervenez-vous ?", answer:"2M ARCHI intervient dans tous les secteurs : résidentiel (villas, appartements), commercial (boutiques, showrooms, restaurants), tertiaire (bureaux, espaces professionnels), hôtellerie, santé, bien-être et espaces modulaires.", order:1 },
  { id:"f3", question:"Proposez-vous des rendus 3D avant les travaux ?", answer:"Oui, la modélisation et la visualisation 3D font partie intégrante de notre processus. Vous visualisez votre projet avec précision avant le début des travaux, ce qui permet de valider chaque choix esthétique et fonctionnel en toute confiance.", order:2 },
  { id:"f4", question:"Gérez-vous le suivi de chantier ?", answer:"Absolument. Nous assurons la coordination et le suivi complet des travaux, de la sélection des entreprises jusqu'à la livraison finale. Notre équipe contrôle la qualité d'exécution à chaque étape.", order:3 },
  { id:"f5", question:"Travaillez-vous uniquement en Tunisie ?", answer:"Notre base est en Tunisie mais nous acceptons des projets à l'international, notamment pour les clients de la diaspora et les projets en Afrique du Nord et en Europe.", order:4 },
];

const INITIAL_STATE: AppState = {
  projects: defaultProjects, services: defaultServices, testimonials: defaultTestimonials, faqs: defaultFaqs, content: defaultContent,
};

// ── Read-only actions (the public site never mutates data). ──
type Action =
  | { type: "SET_CONTENT"; content: SiteContent }
  | { type: "SET_PROJECTS"; projects: Project[] }
  | { type: "SET_SERVICES"; services: Service[] }
  | { type: "SET_TESTIMONIALS"; testimonials: Testimonial[] }
  | { type: "SET_FAQS"; faqs: FaqItem[] }
  | { type: "SET_ALL"; content: SiteContent; projects: Project[]; services: Service[]; testimonials: Testimonial[]; faqs: FaqItem[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_CONTENT": return { ...state, content: { ...defaultContent, ...action.content } };
    case "SET_PROJECTS": return { ...state, projects: action.projects };
    case "SET_SERVICES": return { ...state, services: action.services };
    case "SET_TESTIMONIALS": return { ...state, testimonials: action.testimonials };
    case "SET_FAQS": return { ...state, faqs: action.faqs };
    case "SET_ALL": return {
      content: { ...defaultContent, ...action.content },
      projects: action.projects, services: action.services, testimonials: action.testimonials, faqs: action.faqs,
    };
    default: return state;
  }
}

interface StoreCtx { state: AppState; language: Language; setLanguage: (l: Language) => void; }
const StoreContext = createContext<StoreCtx>(null!);

const GOLD = "#B89B5E";
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "9999px",
        border: `3px solid ${GOLD}33`, borderTopColor: GOLD,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function hasItems(x: unknown): x is unknown[] { return Array.isArray(x) && x.length > 0; }

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "fr";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getContent(),
      api.getProjects(),
      api.getServices(),
      api.getTestimonials(),
      api.getFaqs(),
    ])
      .then(([content, projects, services, testimonials, faqs]) => {
        if (cancelled) return;
        // Use API data when present; otherwise keep the bundled defaults so the
        // site never renders empty even if a collection comes back empty.
        dispatch({
          type: "SET_ALL",
          content: content && typeof content === "object" ? content : defaultContent,
          projects: hasItems(projects) ? (projects as Project[]) : defaultProjects,
          services: hasItems(services) ? (services as Service[]) : defaultServices,
          testimonials: hasItems(testimonials) ? (testimonials as Testimonial[]) : defaultTestimonials,
          faqs: hasItems(faqs) ? (faqs as FaqItem[]) : defaultFaqs,
        });
        setLoading(false);
      })
      .catch(() => {
        // Silently fall back to default data — no error shown to visitors.
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <StoreContext.Provider value={{ state, language, setLanguage }}>
      {loading ? <LoadingScreen /> : children}
    </StoreContext.Provider>
  );
}

export function useStore() { return useContext(StoreContext); }

export function useI18n() {
  const { language, setLanguage } = useStore();
  return {
    lang: language,
    setLanguage,
    t: (fr: string, en?: string) => (language === 'en' && en) ? en : fr,
  };
}
