import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, GripVertical, X, Star } from 'lucide-react';

interface Testimonial { id: string; name: string; project: string; text: string; rating: number; order?: number; }
type Form = Omit<Testimonial, 'id' | 'order'>;
const EMPTY: Form = { name: '', project: '', text: '', rating: 5 };

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const Toast = msg ? <div className="fixed bottom-4 right-4 z-50 bg-[#1F1F1F] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg toast-enter">{msg}</div> : null;
  return { show, Toast };
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`transition-colors ${n <= value ? 'text-[#B89B5E]' : 'text-gray-200 hover:text-gray-400'}`}>
          <Star size={18} fill={n <= value ? '#B89B5E' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function SortableRow({ t, onEdit, onDelete }: { t: Testimonial; onEdit: (t: Testimonial) => void; onDelete: (t: Testimonial) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-3 w-8"><button {...attributes} {...listeners} className="drag-handle text-gray-300 hover:text-gray-500"><GripVertical size={16} /></button></td>
      <td className="px-3 py-3 text-sm font-medium text-[#1F1F1F]">{t.name}</td>
      <td className="px-3 py-3 text-xs text-gray-400 hidden md:table-cell">{t.project}</td>
      <td className="px-3 py-3">
        <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={11} className={n <= t.rating ? 'text-[#B89B5E]' : 'text-gray-200'} fill={n <= t.rating ? '#B89B5E' : 'none'} />)}</div>
      </td>
      <td className="px-3 py-3 text-xs text-gray-400 hidden lg:table-cell max-w-xs truncate">{t.text}</td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#B89B5E] hover:bg-amber-50 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function Modal({ testimonial, onClose, onSaved }: { testimonial: Testimonial | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Form>(testimonial ? { name: testimonial.name, project: testimonial.project, text: testimonial.text, rating: testimonial.rating } : EMPTY);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (testimonial) await api.updateTestimonial(testimonial.id, form);
    else await api.createTestimonial(form);
    setSaving(false); onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[#1F1F1F]">{testimonial ? 'Modifier' : 'Nouveau témoignage'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {(['name', 'project'] as const).map(k => (
            <div key={k} className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{k === 'name' ? 'Nom' : 'Projet'}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input w-full" />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Témoignage</label>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} className="input w-full resize-none" rows={4} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Note</label>
            <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <button onClick={save} disabled={saving || !form.name} className="btn-gold">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null | 'new'>(null);
  const [confirm, setConfirm] = useState<Testimonial | null>(null);
  const { show, Toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(() => api.getTestimonials().then(setTestimonials), []);
  useEffect(() => { load(); }, [load]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(testimonials, testimonials.findIndex(t => t.id === active.id), testimonials.findIndex(t => t.id === over.id));
    setTestimonials(reordered);
    await api.reorderTestimonials(reordered.map(t => t.id));
    show('Ordre mis à jour');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditing('new')} className="btn-gold flex items-center gap-1.5"><Plus size={15} /> Nouveau témoignage</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="px-3 py-3 w-8" /><th className="px-3 py-3 text-left">Nom</th>
            <th className="px-3 py-3 text-left hidden md:table-cell">Projet</th>
            <th className="px-3 py-3 text-left">Note</th>
            <th className="px-3 py-3 text-left hidden lg:table-cell">Extrait</th><th className="px-3 py-3" />
          </tr></thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={testimonials.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {testimonials.length === 0
                  ? <tr><td colSpan={6} className="text-center text-gray-400 text-sm py-12">Aucun témoignage</td></tr>
                  : testimonials.map(t => <SortableRow key={t.id} t={t} onEdit={setEditing} onDelete={setConfirm} />)}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
      {editing !== null && (
        <Modal testimonial={editing === 'new' ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); show(editing === 'new' ? 'Témoignage créé' : 'Témoignage mis à jour'); }} />
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold">Supprimer ce témoignage ?</h3>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Annuler</button>
              <button onClick={async () => { await api.deleteTestimonial(confirm.id); setConfirm(null); load(); show('Témoignage supprimé'); }} className="btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </div>
  );
}
