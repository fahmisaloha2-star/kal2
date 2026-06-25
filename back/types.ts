// Shared data shapes for the 2M ARCHI API.

export type ProjectCategory =
  | "Résidentiel"
  | "Commercial"
  | "Bureaux"
  | "Hôtellerie & Restauration"
  | "Santé & Bien-être";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory | string;
  location: string;
  year: number;
  images: string[];
  thumbnails?: string[];
  description: string;
  featured: boolean;
  published: boolean;
  order: number;
}

export interface Service {
  id: string;
  iconName: string;
  title: string;
  description: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  project: string;
  text: string;
  rating: number;
  order?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface NavLabels {
  accueil: string;
  about: string;
  services: string;
  domaines: string;
  portfolio: string;
  contact: string;
}

export interface SiteContent {
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  aboutTitle: string;
  aboutBody1: string;
  aboutBody2: string;
  aboutBody3: string;
  phone: string;
  email: string;
  address: string;
  statsProjects: string;
  statsYears: string;
  statsClients: string;
  servicesTitle: string;
  servicesSubtitle: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  navLabels: NavLabels;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  pinterestUrl: string;
  beforeAfterBefore: string;
  beforeAfterAfter: string;
  typography?: {
    globalScale: string;
    h1Size: string;
    h2Size: string;
    h3Size: string;
    pSize: string;
  };
}
