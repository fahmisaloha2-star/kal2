import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Upload, X } from 'lucide-react';
import { useAdminLang } from './Layout';

interface SiteContent {
  heroTitle: string; heroTitle_en?: string;
  heroTagline: string; heroTagline_en?: string;
  heroDescription: string; heroDescription_en?: string;
  aboutTitle: string; aboutTitle_en?: string;
  aboutBody1: string; aboutBody1_en?: string;
  aboutBody2: string; aboutBody2_en?: string;
  aboutBody3: string; aboutBody3_en?: string;
  servicesTitle: string; servicesTitle_en?: string;
  servicesSubtitle: string; servicesSubtitle_en?: string;
  portfolioTitle: string; portfolioTitle_en?: string;
  portfolioSubtitle: string; portfolioSubtitle_en?: string;
  beforeAfterBefore: string; beforeAfterAfter: string;
  contactTitle: string; contactTitle_en?: string;
  contactSubtitle: string; contactSubtitle_en?: string;
}

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace('/api', '');

const TABS = [
  { key: 'hero', label: 'Accueil' },
  { key: 'about', label: 'À propos' },
  { key: 'services', label: 'Services' },
  { key: 'portfolio', label: 'Réalisations' },
  { key: 'contact', label: 'Contact' },
] as const;
type Tab = typeof TABS[number]['key'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const res = await api.uploadImage(files[0]);
    if (res.ok) {
      const { url } = await res.json();
      onChange(url);
    }
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <label
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:border-[#B89B5E] transition-colors"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files); }}
      >
        <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />
        {value ? (
          <img src={`${BASE_URL}${value}`} alt={label} className="max-h-32 object-contain rounded-lg" />
        ) : (
          <>
            <Upload size={18} className="text-gray-300 mb-1" />
            <p className="text-xs text-gray-400">{uploading ? 'Envoi...' : 'Glissez ou cliquez'}</p>
          </>
        )}
      </label>
      {value && (
        <button onClick={() => onChange('')} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
          <X size={12} /> Supprimer l'image
        </button>
      )}
    </div>
  );
}

export default function Content() {
  const { lang } = useAdminLang();
  const [content, setContent] = useState<SiteContent>({
    heroTitle: '', heroTagline: '', heroDescription: '',
    heroTitle_en: '', heroTagline_en: '', heroDescription_en: '',
    aboutTitle: '', aboutBody1: '', aboutBody2: '', aboutBody3: '',
    aboutTitle_en: '', aboutBody1_en: '', aboutBody2_en: '', aboutBody3_en: '',
    servicesTitle: '', servicesSubtitle: '',
    servicesTitle_en: '', servicesSubtitle_en: '',
    portfolioTitle: '', portfolioSubtitle: '', beforeAfterBefore: '', beforeAfterAfter: '',
    portfolioTitle_en: '', portfolioSubtitle_en: '',
    contactTitle: '', contactSubtitle: '',
    contactTitle_en: '', contactSubtitle_en: '',
  });
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getContent().then(c => setContent(c)); }, []);

  function set(k: keyof SiteContent, v: string) {
    setContent(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  async function save(fields: Partial<SiteContent>) {
    setSaving(true);
    await api.updateContent(fields);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function SaveBtn({ fields }: { fields: Partial<SiteContent> }) {
    return (
      <button onClick={() => save(fields)} disabled={saving}
        className="btn-gold min-w-28">
        {saving ? 'Enregistrement...' : saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
      </button>
    );
  }

  const ta = (k: keyof SiteContent, rows = 2) => {
    const key = lang === 'en' ? `${k}_en` as keyof SiteContent : k;
    return (
      <textarea value={(content[key] as string) || ''} onChange={e => set(key, e.target.value)}
        className="input w-full resize-none" rows={rows} />
    );
  };
  const inp = (k: keyof SiteContent) => {
    const key = lang === 'en' ? `${k}_en` as keyof SiteContent : k;
    return (
      <input value={(content[key] as string) || ''} onChange={e => set(key, e.target.value)} className="input w-full" />
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-white text-[#1F1F1F] shadow-sm' : 'text-gray-500 hover:text-[#1F1F1F]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {activeTab === 'hero' && (
          <>
            <Field label="Titre principal">{inp('heroTitle')}</Field>
            <Field label="Tagline">{inp('heroTagline')}</Field>
            <Field label="Description">{ta('heroDescription', 3)}</Field>
            <div className="flex justify-end pt-2">
              <SaveBtn fields={lang === 'en' ? { heroTitle_en: content.heroTitle_en, heroTagline_en: content.heroTagline_en, heroDescription_en: content.heroDescription_en } : { heroTitle: content.heroTitle, heroTagline: content.heroTagline, heroDescription: content.heroDescription }} />
            </div>
          </>
        )}
        {activeTab === 'about' && (
          <>
            <Field label="Titre">{inp('aboutTitle')}</Field>
            <Field label="Paragraphe 1">{ta('aboutBody1', 3)}</Field>
            <Field label="Paragraphe 2">{ta('aboutBody2', 3)}</Field>
            <Field label="Paragraphe 3 (mission)">{ta('aboutBody3', 3)}</Field>
            <div className="flex justify-end pt-2">
              <SaveBtn fields={lang === 'en' ? { aboutTitle_en: content.aboutTitle_en, aboutBody1_en: content.aboutBody1_en, aboutBody2_en: content.aboutBody2_en, aboutBody3_en: content.aboutBody3_en } : { aboutTitle: content.aboutTitle, aboutBody1: content.aboutBody1, aboutBody2: content.aboutBody2, aboutBody3: content.aboutBody3 }} />
            </div>
          </>
        )}
        {activeTab === 'services' && (
          <>
            <Field label="Titre section">{inp('servicesTitle')}</Field>
            <Field label="Sous-titre">{inp('servicesSubtitle')}</Field>
            <div className="flex justify-end pt-2">
              <SaveBtn fields={lang === 'en' ? { servicesTitle_en: content.servicesTitle_en, servicesSubtitle_en: content.servicesSubtitle_en } : { servicesTitle: content.servicesTitle, servicesSubtitle: content.servicesSubtitle }} />
            </div>
          </>
        )}
        {activeTab === 'portfolio' && (
          <>
            <Field label="Titre section">{inp('portfolioTitle')}</Field>
            <Field label="Sous-titre">{inp('portfolioSubtitle')}</Field>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <ImageUpload label="Image Avant" value={content.beforeAfterBefore} onChange={v => set('beforeAfterBefore', v)} />
              <ImageUpload label="Image Après" value={content.beforeAfterAfter} onChange={v => set('beforeAfterAfter', v)} />
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn fields={lang === 'en' ? { portfolioTitle_en: content.portfolioTitle_en, portfolioSubtitle_en: content.portfolioSubtitle_en, beforeAfterBefore: content.beforeAfterBefore, beforeAfterAfter: content.beforeAfterAfter } : { portfolioTitle: content.portfolioTitle, portfolioSubtitle: content.portfolioSubtitle, beforeAfterBefore: content.beforeAfterBefore, beforeAfterAfter: content.beforeAfterAfter }} />
            </div>
          </>
        )}
        {activeTab === 'contact' && (
          <>
            <Field label="Titre section">{inp('contactTitle')}</Field>
            <Field label="Sous-titre">{inp('contactSubtitle')}</Field>
            <div className="flex justify-end pt-2">
              <SaveBtn fields={lang === 'en' ? { contactTitle_en: content.contactTitle_en, contactSubtitle_en: content.contactSubtitle_en } : { contactTitle: content.contactTitle, contactSubtitle: content.contactSubtitle }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
