import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react';

interface Faq { id: string; question: string; answer: string; order: number; }
type Form = Omit<Faq, 'id' | 'order'>;
const EMPTY: Form = { question: '', answer: '' };

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const Toast = msg ? <div className="fixed bottom-4 right-4 z-50 bg-[#1F1F1F] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg toast-enter">{msg}</div> : null;
  return { show, Toast };
}

function SortableRow({ faq, onEdit, onDelete }: { faq: Faq; onEdit: (f: Faq) => void; onDelete: (f: Faq) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq.id });
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-3 w-8"><button {...attributes} {...listeners} className="drag-handle text-gray-300 hover:text-gray-500"><GripVertical size={16} /></button></td>
      <td className="px-3 py-3 text-sm font-medium text-[#1F1F1F] max-w-xs truncate">{faq.question}</td>
      <td className="px-3 py-3 text-xs text-gray-400 hidden md:table-cell max-w-xs truncate">{faq.answer}</td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(faq)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#B89B5E] hover:bg-amber-50 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => onDelete(faq)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function Modal({ faq, onClose, onSaved }: { faq: Faq | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Form>(faq ? { question: faq.question, answer: faq.answer } : EMPTY);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (faq) await api.updateFaq(faq.id, form);
    else await api.createFaq(form);
    setSaving(false); onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[#1F1F1F]">{faq ? 'Modifier' : 'Nouvelle question'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Question</label>
            <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="input w-full" placeholder="Quelle est votre question ?" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Réponse</label>
            <textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className="input w-full resize-none" rows={5} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <button onClick={save} disabled={saving || !form.question || !form.answer} className="btn-gold">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Faqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [editing, setEditing] = useState<Faq | null | 'new'>(null);
  const [confirm, setConfirm] = useState<Faq | null>(null);
  const { show, Toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(() => api.getFaqs().then(setFaqs), []);
  useEffect(() => { load(); }, [load]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(faqs, faqs.findIndex(f => f.id === active.id), faqs.findIndex(f => f.id === over.id));
    setFaqs(reordered);
    await api.reorderFaqs(reordered.map(f => f.id));
    show('Ordre mis à jour');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditing('new')} className="btn-gold flex items-center gap-1.5"><Plus size={15} /> Nouvelle question</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="px-3 py-3 w-8" /><th className="px-3 py-3 text-left">Question</th>
            <th className="px-3 py-3 text-left hidden md:table-cell">Réponse</th><th className="px-3 py-3" />
          </tr></thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={faqs.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {faqs.length === 0
                  ? <tr><td colSpan={4} className="text-center text-gray-400 text-sm py-12">Aucune question</td></tr>
                  : faqs.map(f => <SortableRow key={f.id} faq={f} onEdit={setEditing} onDelete={setConfirm} />)}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
      {editing !== null && (
        <Modal faq={editing === 'new' ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); show(editing === 'new' ? 'Question créée' : 'Question mise à jour'); }} />
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold">Supprimer cette question ?</h3>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Annuler</button>
              <button onClick={async () => { await api.deleteFaq(confirm.id); setConfirm(null); load(); show('Question supprimée'); }} className="btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </div>
  );
}
