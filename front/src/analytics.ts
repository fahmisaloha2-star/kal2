// Thin GA4 wrapper. No-ops unless gtag is present (i.e. VITE_GA_ID is set).
export function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as unknown as { gtag?: unknown }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", name, params);
  }
}
