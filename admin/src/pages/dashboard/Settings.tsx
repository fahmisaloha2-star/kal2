import { useEffect, useState } from 'react';
import { api } from '../../api';

interface Typography {
  globalScale: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  pSize: string;
}

interface SiteContent {
  phone: string; email: string; address: string;
  instagramUrl: string; facebookUrl: string; linkedinUrl: string; pinterestUrl: string;
  navLabels: { accueil: string; about: string; services: string; domaines: string; portfolio: string; contact: string; };
  typography?: Typography;
}

const DEFAULT_TYPO: Typography = {
  globalScale: '100',
  h1Size: '',
  h2Size: '',
  h3Size: '',
  pSize: '',
};

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const Toast = msg ? <div className="fixed bottom-4 right-4 z-50 bg-[#1F1F1F] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg toast-enter">{msg}</div> : null;
  return { show, Toast };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
      <h2 className="font-semibold text-[#1F1F1F] text-sm">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function Settings() {
  const [content, setContent] = useState<SiteContent>({
    phone: '', email: '', address: '',
    instagramUrl: '', facebookUrl: '', linkedinUrl: '', pinterestUrl: '',
    navLabels: { accueil: '', about: '', services: '', domaines: '', portfolio: '', contact: '' },
    typography: { ...DEFAULT_TYPO },
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState('');
  const { show, Toast } = useToast();

  useEffect(() => {
    api.getContent().then(c => {
      setContent({
        ...c,
        typography: c.typography ? { ...DEFAULT_TYPO, ...c.typography } : { ...DEFAULT_TYPO },
      });
    });
  }, []);

  function setField(k: keyof Omit<SiteContent, 'navLabels' | 'typography'>, v: string) {
    setContent(prev => ({ ...prev, [k]: v }));
  }
  function setNav(k: keyof SiteContent['navLabels'], v: string) {
    setContent(prev => ({ ...prev, navLabels: { ...prev.navLabels, [k]: v } }));
  }
  function setTypo(k: keyof Typography, v: string) {
    setContent(prev => ({
      ...prev,
      typography: { ...(prev.typography || DEFAULT_TYPO), [k]: v },
    }));
  }

  async function saveSection(fields: Partial<SiteContent>, label: string) {
    setSaving(label);
    await api.updateContent(fields);
    setSaving('');
    show('Sauvegardé ✓');
  }

  async function changePassword() {
    if (pwForm.next !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    if (pwForm.next.length < 6) { setPwError('Minimum 6 caractères.'); return; }
    setPwError('');
    const res = await api.changePassword(pwForm.current, pwForm.next);
    if (res.ok) { show('Mot de passe mis à jour'); setPwForm({ current: '', next: '', confirm: '' }); }
    else { setPwError('Mot de passe actuel incorrect.'); }
  }

  const inp = (val: string, onChange: (v: string) => void, placeholder = '') => (
    <input value={val} onChange={e => onChange(e.target.value)} className="input w-full" placeholder={placeholder} />
  );

  const savingBtn = (label: string, onClick: () => void) => (
    <button onClick={onClick} disabled={saving === label}
      className="btn-gold min-w-28">
      {saving === label ? 'Enregistrement...' : 'Sauvegarder'}
    </button>
  );

  const typo = content.typography || DEFAULT_TYPO;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Contact info */}
      <Section title="Informations de contact">
        <Field label="Téléphone">{inp(content.phone, v => setField('phone', v), '+216 XX XXX XXX')}</Field>
        <Field label="E-mail">{inp(content.email, v => setField('email', v), 'contact@2marchi.com')}</Field>
        <Field label="Zone de service">{inp(content.address, v => setField('address', v), 'Hammamet, Tunisie')}</Field>
        <div className="flex justify-end pt-1">
          {savingBtn('contact', () => saveSection({ phone: content.phone, email: content.email, address: content.address }, 'contact'))}
        </div>
      </Section>

      {/* Social links */}
      <Section title="Réseaux sociaux">
        {([
          ['Instagram', 'instagramUrl', 'https://www.instagram.com/2m.archi'],
          ['Facebook', 'facebookUrl', 'https://www.facebook.com/...'],
          ['LinkedIn', 'linkedinUrl', 'https://www.linkedin.com/...'],
          ['Pinterest', 'pinterestUrl', 'https://www.pinterest.com/...'],
        ] as const).map(([label, key, ph]) => (
          <Field key={key} label={label}>
            {inp(content[key], v => setField(key, v), ph)}
          </Field>
        ))}
        <div className="flex justify-end pt-1">
          {savingBtn('social', () => saveSection({
            instagramUrl: content.instagramUrl, facebookUrl: content.facebookUrl,
            linkedinUrl: content.linkedinUrl, pinterestUrl: content.pinterestUrl,
          }, 'social'))}
        </div>
      </Section>

      {/* Nav labels */}
      <Section title="Labels de navigation">
        <p className="text-xs text-gray-400 italic">Seul le texte visible change. Les ancres (#about, #services, etc.) ne changent pas.</p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(content.navLabels) as [keyof SiteContent['navLabels'], string][]).map(([k, v]) => (
            <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
              {inp(v, nv => setNav(k, nv))}
            </Field>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          {savingBtn('nav', () => saveSection({ navLabels: content.navLabels }, 'nav'))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typographie — Tailles de texte">
        <p className="text-xs text-gray-400 italic">
          Contrôlez la taille de tous les textes du site. Utilisez l'échelle globale pour un changement proportionnel,
          ou définissez des tailles spécifiques pour chaque type de texte (ex: 48px, 3rem, 2.5em).
          Laissez vide pour garder la taille par défaut.
        </p>

        {/* Global scale slider */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Échelle globale — {typo.globalScale || '100'}%
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-8">50%</span>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={typo.globalScale || '100'}
              onChange={e => setTypo('globalScale', e.target.value)}
              className="flex-1 accent-[#B89B5E] h-2 rounded-lg cursor-pointer"
            />
            <span className="text-xs text-gray-400 w-10">200%</span>
          </div>
          <p className="text-[10px] text-gray-400">
            Appliqué uniquement quand les tailles individuelles ci-dessous sont vides.
          </p>
        </div>

        {/* Individual sizes */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="H1 — Titres principaux">
            <input
              value={typo.h1Size}
              onChange={e => setTypo('h1Size', e.target.value)}
              className="input w-full"
              placeholder="ex: 60px, 4rem (vide = échelle globale)"
            />
          </Field>
          <Field label="H2 — Titres de section">
            <input
              value={typo.h2Size}
              onChange={e => setTypo('h2Size', e.target.value)}
              className="input w-full"
              placeholder="ex: 48px, 3rem"
            />
          </Field>
          <Field label="H3 — Sous-titres">
            <input
              value={typo.h3Size}
              onChange={e => setTypo('h3Size', e.target.value)}
              className="input w-full"
              placeholder="ex: 30px, 1.875rem"
            />
          </Field>
          <Field label="P — Paragraphes">
            <input
              value={typo.pSize}
              onChange={e => setTypo('pSize', e.target.value)}
              className="input w-full"
              placeholder="ex: 16px, 1rem"
            />
          </Field>
        </div>

        {/* Live preview */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Aperçu en direct</p>
          <h1 style={{ fontSize: typo.h1Size || `${(parseFloat(typo.globalScale || '100') / 100) * 60}px`, fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[#1F1F1F] leading-tight">
            Titre H1
          </h1>
          <h2 style={{ fontSize: typo.h2Size || `${(parseFloat(typo.globalScale || '100') / 100) * 48}px`, fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[#1F1F1F] leading-tight">
            Titre H2
          </h2>
          <h3 style={{ fontSize: typo.h3Size || `${(parseFloat(typo.globalScale || '100') / 100) * 30}px`, fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[#1F1F1F] leading-tight">
            Sous-titre H3
          </h3>
          <p style={{ fontSize: typo.pSize || `${(parseFloat(typo.globalScale || '100') / 100) * 14}px`, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300 }} className="text-[#4A4A4A]">
            Ceci est un paragraphe de texte exemple pour visualiser la taille du contenu.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => {
              setContent(prev => ({ ...prev, typography: { ...DEFAULT_TYPO } }));
            }}
            className="px-4 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          {savingBtn('typography', () => saveSection({ typography: content.typography } as any, 'typography'))}
        </div>
      </Section>

      {/* Password */}
      <Section title="Sécurité — Changer le mot de passe">
        <Field label="Mot de passe actuel">
          <input type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} className="input w-full" />
        </Field>
        <Field label="Nouveau mot de passe">
          <input type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} className="input w-full" />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="input w-full" />
        </Field>
        {pwError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{pwError}</p>}
        <div className="flex justify-end pt-1">
          <button onClick={changePassword} disabled={!pwForm.current || !pwForm.next || !pwForm.confirm} className="btn-gold">
            Changer le mot de passe
          </button>
        </div>
      </Section>

      {Toast}
    </div>
  );
}

