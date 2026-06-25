import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react';

import { useAdminLang } from './Layout';

interface Service { id: string; iconName: string; title: string; description: string; order: number; title_en?: string; description_en?: string; }
type ServiceForm = Omit<Service, 'id' | 'order'>;
const EMPTY: ServiceForm = { iconName: 'Layers', title: '', description: '', title_en: '', description_en: '' };

const ICON_LIST = ['PenTool', 'Box', 'Palette', 'FileText', 'Paintbrush', 'Layers', 'Hammer', 'ShoppingBag', 'HardHat', 'Home', 'Building2', 'Sofa', 'Lightbulb', 'Ruler', 'Monitor', 'Wrench', 'Star', 'Heart'];

const ICONS = ICON_LIST;

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const Toast = msg ? <div className="fixed bottom-4 right-4 z-50 bg-[#1F1F1F] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg toast-enter">{msg}</div> : null;
  return { show, Toast };
}

function SortableRow({ service, onEdit, onDelete, displayTitle, displayDesc, hasEn }: {
  service: Service;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
  displayTitle: string;
  displayDesc: string;
  hasEn: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-3 w-8">
        <button {...attributes} {...listeners} className="drag-handle text-gray-300 hover:text-gray-500"><GripVertical size={16} /></button>
      </td>
      <td className="px-3 py-3 text-xs text-gray-400 font-mono">{service.iconName}</td>
      <td className="px-3 py-3 text-sm font-medium text-[#1F1F1F]">{displayTitle}</td>
      <td className="px-3 py-3 text-xs text-gray-400 hidden md:table-cell max-w-xs truncate">{displayDesc}</td>
      <td className="px-3 py-3 text-center">
        {hasEn
          ? <span className="text-green-500 text-xs font-bold">✓</span>
          : <span className="text-gray-300 text-xs">—</span>
        }
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(service)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#B89B5E] hover:bg-amber-50 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => onDelete(service)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function Modal({ service, onClose, onSaved }: { service: Service | null; onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<'fr' | 'en'>('fr');
  const [form, setForm] = useState<ServiceForm>(service ? { iconName: service.iconName, title: service.title, description: service.description, title_en: service.title_en ?? '', description_en: service.description_en ?? '' } : EMPTY);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (service) await api.updateService(service.id, form);
    else await api.createService(form);
    setSaving(false); onSaved();
  }

  const isFr = tab === 'fr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-[#1F1F1F]">{service ? 'Edit Service' : 'New Service'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {/* Icon selector */}
        <div className="px-6 pt-5 pb-3">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Icon (Lucide name)</label>
          <select value={form.iconName} onChange={e => setForm(f => ({ ...f, iconName: e.target.value }))} className="input w-full">
            {ICONS.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 px-6 pb-2">
          <button
            onClick={() => setTab('fr')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              isFr ? 'bg-[#B89B5E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >🇫🇷 Français</button>
          <button
            onClick={() => setTab('en')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              !isFr ? 'bg-[#B89B5E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >🇬🇧 English</button>
        </div>

        <div className="px-6 pb-5 space-y-4">
          {isFr ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre (FR)</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input w-full" placeholder="ex: Conception architecturale"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description (FR)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input w-full resize-none" rows={3}
                  placeholder="Description en français..."
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title (EN)</label>
                <input
                  value={form.title_en ?? ''}
                  onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                  className="input w-full" placeholder="e.g. Architectural Design"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description (EN)</label>
                <textarea
                  value={form.description_en ?? ''}
                  onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
                  className="input w-full resize-none" rows={3}
                  placeholder="Description in English..."
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving || !form.title} className="btn-gold">
            {saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null | 'new'>(null);
  const [confirm, setConfirm] = useState<Service | null>(null);
  const { show, Toast } = useToast();
  const { lang } = useAdminLang();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(() => api.getServices().then(setServices), []);
  useEffect(() => { load(); }, [load]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(services, services.findIndex(s => s.id === active.id), services.findIndex(s => s.id === over.id));
    setServices(reordered);
    await api.reorderServices(reordered.map(s => s.id));
    show('Order updated');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1F1F1F]">Services</h2>
          <p className="text-xs text-gray-400 mt-0.5">Click ✏️ to edit title &amp; description in French and English</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-gold flex items-center gap-1.5"><Plus size={15} /> New Service</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="px-3 py-3 w-8" />
            <th className="px-3 py-3 text-left">Icon</th>
            <th className="px-3 py-3 text-left">Title ({lang === 'en' ? 'EN' : 'FR'})</th>
            <th className="px-3 py-3 text-left hidden md:table-cell">Description</th>
            <th className="px-3 py-3 text-right">EN ✓</th>
            <th className="px-3 py-3" />
          </tr></thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={services.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {services.length === 0
                  ? <tr><td colSpan={6} className="text-center text-gray-400 text-sm py-12">No services yet</td></tr>
                  : services.map(s => (
                    <SortableRow key={s.id} service={s} onEdit={setEditing} onDelete={setConfirm}
                      displayTitle={lang === 'en' ? (s.title_en || s.title) : s.title}
                      displayDesc={lang === 'en' ? (s.description_en || s.description) : s.description}
                      hasEn={!!s.title_en}
                    />
                  ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      {editing !== null && (
        <Modal service={editing === 'new' ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); show(editing === 'new' ? 'Service created' : 'Service updated'); }} />
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold">Delete this service?</h3>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
              <button onClick={async () => { await api.deleteService(confirm.id); setConfirm(null); load(); show('Service deleted'); }} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </div>
  );
}
