import { useEffect, useState } from 'react';
import { api } from '../../api';

interface SiteContent {
  phone: string; email: string; address: string;
  instagramUrl: string; facebookUrl: string; linkedinUrl: string; pinterestUrl: string;
  navLabels: { accueil: string; about: string; services: string; domaines: string; portfolio: string; contact: string; };
}

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
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState('');
  const { show, Toast } = useToast();

  useEffect(() => { api.getContent().then(c => setContent(c)); }, []);

  function setField(k: keyof Omit<SiteContent, 'navLabels'>, v: string) {
    setContent(prev => ({ ...prev, [k]: v }));
  }
  function setNav(k: keyof SiteContent['navLabels'], v: string) {
    setContent(prev => ({ ...prev, navLabels: { ...prev.navLabels, [k]: v } }));
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
