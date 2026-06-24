import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, GripVertical, Search, X, Upload, Star } from 'lucide-react';

type Category = 'Résidentiel' | 'Commercial' | 'Bureaux' | 'Hôtellerie & Restauration' | 'Santé & Bien-être';
const CATEGORIES: Category[] = ['Résidentiel', 'Commercial', 'Bureaux', 'Hôtellerie & Restauration', 'Santé & Bien-être'];
const BASE_URL = (import.meta.env.VITE_API_URL as string).replace('/api', '');

import { useAdminLang } from './Layout';

interface Project {
  id: string; title: string; category: string; location: string;
  year: number; images: string[]; thumbnails?: string[];
  description: string; featured: boolean; published: boolean; order: number;
  title_en?: string; category_en?: string; location_en?: string; description_en?: string;
}
type ProjectForm = Omit<Project, 'id' | 'order'>;

const EMPTY_FORM: ProjectForm = {
  title: '', category: 'Résidentiel', location: '', year: new Date().getFullYear(),
  images: [], thumbnails: [], description: '', featured: false, published: true,
  title_en: '', category_en: '', location_en: '', description_en: ''
};

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const Toast = msg ? (
    <div className="fixed bottom-4 right-4 z-50 bg-[#1F1F1F] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg toast-enter">
      {msg}
    </div>
  ) : null;
  return { show, Toast };
}

function SortableRow({ project, onEdit, onDelete, onToggleFeatured }: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onToggleFeatured: (p: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const thumb = project.thumbnails?.[0] ?? project.images?.[0];

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-3 w-8">
        <button {...attributes} {...listeners} className="drag-handle text-gray-300 hover:text-gray-500">
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-3 py-3 w-12">
        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
          {thumb ? (
            <img src={`${BASE_URL}${thumb}`} alt={project.title} className="w-full h-full object-cover" />
          ) : <div className="w-full h-full bg-gray-200" />}
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="text-sm font-medium text-[#1F1F1F]">{project.title}</p>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{project.category}</span>
      </td>
      <td className="px-3 py-3 hidden lg:table-cell text-xs text-gray-400">{project.location}</td>
      <td className="px-3 py-3 hidden lg:table-cell text-xs text-gray-400">{project.year}</td>
      <td className="px-3 py-3 text-center">
        <button onClick={() => onToggleFeatured(project)}
          className={`transition-colors ${project.featured ? 'text-[#B89B5E]' : 'text-gray-200 hover:text-gray-400'}`}>
          <Star size={15} fill={project.featured ? '#B89B5E' : 'none'} />
        </button>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(project)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#B89B5E] hover:bg-amber-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(project)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ImageUploadZone({ images, thumbnails, onChange }: {
  images: string[]; thumbnails: string[];
  onChange: (images: string[], thumbnails: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const newImgs = [...images]; const newThumbs = [...thumbnails];
    for (const file of Array.from(files)) {
      const res = await api.uploadImage(file);
      if (res.ok) {
        const { url, thumbUrl } = await res.json();
        newImgs.push(url); newThumbs.push(thumbUrl);
      }
    }
    onChange(newImgs, newThumbs);
    setUploading(false);
  }

  function removeImage(i: number) {
    const imgs = images.filter((_, j) => j !== i);
    const thumbs = thumbnails.filter((_, j) => j !== i);
    onChange(imgs, thumbs);
  }

  return (
    <div className="space-y-2">
      <label
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#B89B5E] transition-colors"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
        <Upload size={20} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">{uploading ? 'Envoi en cours...' : 'Glissez ou cliquez pour ajouter des images'}</p>
      </label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
              <img src={`${BASE_URL}${src}`} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600">
                <X size={8} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ project, onClose, onSaved }: {
  project: Project | null; onClose: () => void; onSaved: () => void;
}) {
  const { lang } = useAdminLang();
  const [form, setForm] = useState<ProjectForm>(project ? {
    title: project.title, category: project.category, location: project.location,
    year: project.year, images: project.images, thumbnails: project.thumbnails ?? [],
    description: project.description, featured: project.featured, published: project.published,
    title_en: project.title_en ?? '', category_en: project.category_en ?? '', location_en: project.location_en ?? '', description_en: project.description_en ?? ''
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    if (project) await api.updateProject(project.id, form);
    else await api.createProject(form);
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[#1F1F1F]">{project ? 'Modifier' : 'Nouveau projet'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Titre">
            <input value={lang === 'en' ? form.title_en : form.title} onChange={e => set(lang === 'en' ? 'title_en' : 'title', e.target.value)}
              className="input" placeholder="Villa résidentielle à La Marsa" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              {lang === 'fr' ? (
                <select value={form.category} onChange={e => set('category', e.target.value as Category)} className="input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              ) : (
                <input value={form.category_en || ''} onChange={e => set('category_en', e.target.value)}
                  className="input" placeholder="Residential" />
              )}
            </Field>
            <Field label="Année">
              <input type="number" value={form.year} onChange={e => set('year', +e.target.value)}
                className="input" min={2000} max={2099} />
            </Field>
          </div>
          <Field label="Localisation">
            <input value={lang === 'en' ? form.location_en : form.location} onChange={e => set(lang === 'en' ? 'location_en' : 'location', e.target.value)}
              className="input" placeholder="Tunis, Tunisie" />
          </Field>
          <Field label="Description">
            <textarea value={lang === 'en' ? form.description_en : form.description} onChange={e => set(lang === 'en' ? 'description_en' : 'description', e.target.value)}
              className="input resize-none" rows={3} placeholder="Décrivez ce projet..." />
          </Field>
          <Field label="Images">
            <ImageUploadZone images={form.images} thumbnails={form.thumbnails ?? []}
              onChange={(imgs, thumbs) => { set('images', imgs); set('thumbnails', thumbs); }} />
          </Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}
                className="w-4 h-4 accent-[#B89B5E]" />
              Mis en avant
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)}
                className="w-4 h-4 accent-[#B89B5E]" />
              Publié
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <button onClick={save} disabled={saving || !form.title} className="btn-gold">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Project | null | 'new'>(null);
  const [confirm, setConfirm] = useState<Project | null>(null);
  const { show, Toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(() => api.getProjects().then(setProjects), []);
  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);
    await api.reorderProjects(reordered.map(p => p.id));
    show('Ordre mis à jour');
  }

  async function handleDelete(p: Project) {
    await api.deleteProject(p.id);
    setConfirm(null);
    load();
    show('Projet supprimé');
  }

  async function toggleFeatured(p: Project) {
    await api.updateProject(p.id, { ...p, featured: !p.featured });
    load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..." className="input pl-8 w-full" />
        </div>
        <button onClick={() => setEditing('new')} className="btn-gold flex items-center gap-1.5">
          <Plus size={15} /> Nouveau projet
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-3 py-3 w-8" />
                <th className="px-3 py-3 w-12" />
                <th className="px-3 py-3 text-left">Titre</th>
                <th className="px-3 py-3 text-left hidden md:table-cell">Catégorie</th>
                <th className="px-3 py-3 text-left hidden lg:table-cell">Localisation</th>
                <th className="px-3 py-3 text-left hidden lg:table-cell">Année</th>
                <th className="px-3 py-3 text-center">Mis en avant</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 text-sm py-12">Aucun projet</td></tr>
                  ) : filtered.map(p => (
                    <SortableRow key={p.id} project={p}
                      onEdit={setEditing}
                      onDelete={setConfirm}
                      onToggleFeatured={toggleFeatured}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editing !== null && (
        <Modal
          project={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); show(editing === 'new' ? 'Projet créé' : 'Projet mis à jour'); }}
        />
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold text-[#1F1F1F]">Supprimer ce projet ?</h3>
            <p className="text-sm text-gray-500">Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Annuler</button>
              <button onClick={() => handleDelete(confirm)} className="btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </div>
  );
}
