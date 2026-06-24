import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Image, Wrench, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';

interface Stats { projects: number; services: number; testimonials: number; faqs: number; }
interface Project { id: string; title: string; thumbnails?: string[]; images?: string[]; category: string; }

export default function Overview() {
  const [stats, setStats] = useState<Stats>({ projects: 0, services: 0, testimonials: 0, faqs: 0 });
  const [recent, setRecent] = useState<Project[]>([]);

  useEffect(() => {
    Promise.all([api.getProjects(), api.getServices(), api.getTestimonials(), api.getFaqs()])
      .then(([p, s, t, f]) => {
        setStats({ projects: p.length, services: s.length, testimonials: t.length, faqs: f.length });
        setRecent(p.slice(0, 5));
      });
  }, []);

  const cards = [
    { label: 'Réalisations', value: stats.projects, icon: Image, href: '/dashboard/projects', color: 'bg-blue-50 text-blue-600' },
    { label: 'Services', value: stats.services, icon: Wrench, href: '/dashboard/services', color: 'bg-amber-50 text-amber-600' },
    { label: 'Témoignages', value: stats.testimonials, icon: MessageSquare, href: '/dashboard/testimonials', color: 'bg-green-50 text-green-600' },
    { label: 'FAQ', value: stats.faqs, icon: HelpCircle, href: '/dashboard/faqs', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} to={href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:border-[#B89B5E]/40 hover:shadow-sm transition-all group"
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[#1F1F1F]">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5 group-hover:text-[#B89B5E] transition-colors">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm text-[#1F1F1F]">Dernières réalisations</h2>
          <Link to="/dashboard/projects" className="flex items-center gap-1 text-xs text-[#B89B5E] hover:underline">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune réalisation pour le moment.</p>
          ) : recent.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {(p.thumbnails?.[0] ?? p.images?.[0]) ? (
                  <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${p.thumbnails?.[0] ?? p.images?.[0]}`}
                    alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Image size={16} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1F1F1F] truncate">{p.title}</p>
                <p className="text-xs text-gray-400">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nouveau projet', href: '/dashboard/projects' },
          { label: 'Modifier le contenu', href: '/dashboard/content' },
          { label: 'Paramètres', href: '/dashboard/settings' },
          { label: 'Éditeur visuel', href: '/dashboard/editor' },
        ].map(({ label, href }) => (
          <Link key={label} to={href}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
