import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../api';
import { Upload, Save, RotateCcw } from 'lucide-react';

interface SiteContent {
  heroTitle: string; heroTagline: string; heroDescription: string;
  aboutTitle: string; aboutBody1: string; aboutBody2: string; aboutBody3: string;
  servicesTitle: string; servicesSubtitle: string;
  portfolioTitle: string; portfolioSubtitle: string;
  contactTitle: string; contactSubtitle: string;
  phone: string; email: string; address: string;
  [key: string]: string;
}

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace('/api', '');
const SECTIONS = ['hero', 'about', 'services', 'portfolio', 'contact'];

const GOLD = '#B89B5E';
const CREAM = '#F7F5F2';

function useDebouncedSave(content: SiteContent, setStatus: (s: string) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = useCallback((fields: Partial<SiteContent>) => {
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await api.updateContent(fields);
      setStatus('saved');
      setTimeout(() => setStatus(''), 2000);
    }, 800);
  }, [setStatus]);
  return save;
}

function EditableText({ value, onChange, tag = 'p', className = '', multiline = false, style }: {
  value: string; onChange: (v: string) => void;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'; className?: string; multiline?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleBlur() {
    const v = ref.current?.innerText ?? '';
    if (v !== value) onChange(v);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); ref.current?.blur(); }
  }

  const TagMap: Record<string, string> = { h1: 'div', h2: 'div', h3: 'div', p: 'div', span: 'span' };
  const tagClass = tag === 'h1' ? 'text-4xl font-bold' : tag === 'h2' ? 'text-3xl font-bold' : tag === 'h3' ? 'text-xl font-semibold' : '';

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={style}
      className={`outline-none cursor-text hover:ring-2 hover:ring-[#B89B5E]/40 focus:ring-2 focus:ring-[#B89B5E] rounded px-1 -mx-1 transition-all ${tagClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

function ImageReplace({ src, onReplace, className = '' }: { src: string; onReplace: (url: string) => void; className?: string }) {
  const [hover, setHover] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setUploading(true);
    const res = await api.uploadImage(file);
    if (res.ok) { const { url } = await res.json(); onReplace(url); }
    setUploading(false);
  }

  async function handleClick() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setUploading(true);
      const res = await api.uploadImage(file);
      if (res.ok) { const { url } = await res.json(); onReplace(url); }
      setUploading(false);
    };
    input.click();
  }

  return (
    <div className={`relative ${className}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      {src && <img src={`${BASE_URL}${src}`} alt="" className="w-full h-full object-cover" />}
      {(hover || uploading || !src) && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer rounded" onClick={handleClick}>
          <Upload size={20} className="text-white mb-1" />
          <span className="text-white text-xs">{uploading ? 'Envoi...' : 'Remplacer'}</span>
        </div>
      )}
    </div>
  );
}

export default function VisualEditor() {
  const [content, setContent] = useState<SiteContent>({
    heroTitle: '', heroTagline: '', heroDescription: '',
    aboutTitle: '', aboutBody1: '', aboutBody2: '', aboutBody3: '',
    servicesTitle: '', servicesSubtitle: '',
    portfolioTitle: '', portfolioSubtitle: '',
    contactTitle: '', contactSubtitle: '',
    phone: '', email: '', address: '',
  });
  const [status, setStatus] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState<SiteContent[]>([]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const debouncedSave = useDebouncedSave(content, setStatus);

  useEffect(() => {
    api.getContent().then(c => { setContent(c); setLoaded(true); });
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (status === 'saving') { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [status]);

  function update(key: string, value: string) {
    setHistory(h => [...h.slice(-9), content]);
    const next = { ...content, [key]: value };
    setContent(next);
    debouncedSave({ [key]: value });
  }

  function undo() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setContent(prev);
    debouncedSave(prev);
  }

  function scrollTo(section: string) {
    sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Chargement de l'éditeur...
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Floating section nav */}
      <div className="hidden xl:flex flex-col gap-1 w-36 flex-shrink-0 p-4 border-r border-gray-100 bg-white">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Sections</p>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => scrollTo(s)}
            className="text-left text-xs text-gray-500 hover:text-[#B89B5E] capitalize py-1 px-2 rounded hover:bg-amber-50 transition-colors">
            {s === 'hero' ? 'Accueil' : s === 'about' ? 'À propos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
        {/* Status bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={undo} disabled={!history.length}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
              <RotateCcw size={12} /> Annuler
            </button>
          </div>
          <div className="flex items-center gap-2">
            {status === 'saving' && <span className="text-xs text-amber-500">Sauvegarde en cours...</span>}
            {status === 'saved' && <span className="text-xs text-green-500 flex items-center gap-1"><Save size={11} /> Sauvegardé ✓</span>}
          </div>
          <p className="text-[10px] text-gray-400 hidden sm:block">Cliquez sur un texte pour modifier · Glissez une image pour la remplacer</p>
        </div>

        {/* Hero section */}
        <section ref={el => sectionRefs.current['hero'] = el} className="bg-[#F7F5F2] px-10 py-16 border-b-2 border-dashed border-gray-200">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
              <span className="text-[9px] tracking-[0.45em] uppercase" style={{ color: GOLD }}>Studio d'Architecture d'Intérieur</span>
            </div>
            <EditableText tag="h1" value={content.heroTitle} onChange={v => update('heroTitle', v)}
              className="text-4xl font-bold text-[#1F1F1F] mb-3 block" />
            <EditableText tag="p" value={content.heroTagline} onChange={v => update('heroTagline', v)}
              className="text-lg mb-4 italic block" style={{ color: '#9B8C7D' } as React.CSSProperties} />
            <EditableText tag="p" value={content.heroDescription} onChange={v => update('heroDescription', v)}
              className="text-sm text-gray-500 leading-loose block" multiline />
          </div>
        </section>

        {/* About section */}
        <section ref={el => sectionRefs.current['about'] = el} className="bg-white px-10 py-14 border-b-2 border-dashed border-gray-200">
          <EditableText tag="h2" value={content.aboutTitle} onChange={v => update('aboutTitle', v)}
            className="text-3xl font-bold text-[#1F1F1F] mb-6 block" />
          <div className="space-y-4 max-w-2xl">
            <EditableText tag="p" value={content.aboutBody1} onChange={v => update('aboutBody1', v)}
              className="text-sm text-gray-600 leading-loose block" multiline />
            <EditableText tag="p" value={content.aboutBody2} onChange={v => update('aboutBody2', v)}
              className="text-sm text-gray-600 leading-loose block" multiline />
            <EditableText tag="p" value={content.aboutBody3} onChange={v => update('aboutBody3', v)}
              className="text-sm text-gray-600 leading-loose block" multiline />
          </div>
        </section>

        {/* Services section */}
        <section ref={el => sectionRefs.current['services'] = el} style={{ backgroundColor: CREAM }} className="px-10 py-14 border-b-2 border-dashed border-gray-200">
          <div className="text-center mb-8">
            <EditableText tag="h2" value={content.servicesTitle} onChange={v => update('servicesTitle', v)}
              className="text-3xl font-bold text-[#1F1F1F] mb-2 block" />
            <EditableText tag="p" value={content.servicesSubtitle} onChange={v => update('servicesSubtitle', v)}
              className="text-sm text-gray-500 block" />
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: `${GOLD}20` }} />
                <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
                <div className="h-2 bg-gray-50 rounded w-full" />
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">Gérez les services dans la section Réalisations → Services</p>
        </section>

        {/* Portfolio section */}
        <section ref={el => sectionRefs.current['portfolio'] = el} className="bg-white px-10 py-14 border-b-2 border-dashed border-gray-200">
          <div className="text-center mb-8">
            <EditableText tag="h2" value={content.portfolioTitle} onChange={v => update('portfolioTitle', v)}
              className="text-3xl font-bold text-[#1F1F1F] mb-2 block" />
            <EditableText tag="p" value={content.portfolioSubtitle} onChange={v => update('portfolioSubtitle', v)}
              className="text-sm text-gray-500 block" />
          </div>
          <p className="text-center text-xs text-gray-400">Gérez les projets dans la section Réalisations</p>
        </section>

        {/* Contact section */}
        <section ref={el => sectionRefs.current['contact'] = el} className="bg-[#1F1F1F] px-10 py-14">
          <div className="text-center mb-6">
            <EditableText tag="h2" value={content.contactTitle} onChange={v => update('contactTitle', v)}
              className="text-3xl font-bold text-white mb-2 block" />
            <EditableText tag="p" value={content.contactSubtitle} onChange={v => update('contactSubtitle', v)}
              className="text-sm block" style={{ color: `${GOLD}CC` } as React.CSSProperties} />
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center text-sm text-gray-300">
            <EditableText tag="p" value={content.phone} onChange={v => update('phone', v)} className="block" />
            <EditableText tag="p" value={content.email} onChange={v => update('email', v)} className="block" />
            <EditableText tag="p" value={content.address} onChange={v => update('address', v)} className="block" />
          </div>
        </section>
      </div>
    </div>
  );
}
