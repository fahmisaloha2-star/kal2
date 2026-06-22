import type {
  SiteContent,
  Project,
  Service,
  Testimonial,
  FaqItem,
  ContactForm,
} from "./app/store";

const BASE = import.meta.env.VITE_API_URL;

export const api = {
  getContent: (): Promise<SiteContent> =>
    fetch(`${BASE}/content`).then((r) => r.json()),
  getProjects: (): Promise<Project[]> =>
    fetch(`${BASE}/projects`).then((r) => r.json()),
  getServices: (): Promise<Service[]> =>
    fetch(`${BASE}/services`).then((r) => r.json()),
  getTestimonials: (): Promise<Testimonial[]> =>
    fetch(`${BASE}/testimonials`).then((r) => r.json()),
  getFaqs: (): Promise<FaqItem[]> =>
    fetch(`${BASE}/faqs`).then((r) => r.json()),
  sendContact: (form: ContactForm): Promise<Response> =>
    fetch(`${BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }),
};
