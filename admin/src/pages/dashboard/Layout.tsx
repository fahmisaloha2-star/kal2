import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../auth';
import {
  LayoutDashboard, Pencil, Image, Wrench, MessageSquare,
  HelpCircle, FileText, Settings, LogOut, ExternalLink, Menu, X
} from 'lucide-react';

const FRONT_URL = import.meta.env.VITE_FRONT_URL ?? 'http://localhost:5173';

const NAV = [
  { to: '/dashboard/editor',      icon: Pencil,          label: 'Éditeur visuel' },
  { to: '/dashboard/overview',    icon: LayoutDashboard, label: 'Vue d\'ensemble' },
  { to: '/dashboard/projects',    icon: Image,           label: 'Réalisations' },
  { to: '/dashboard/services',    icon: Wrench,          label: 'Services' },
  { to: '/dashboard/testimonials',icon: MessageSquare,   label: 'Témoignages' },
  { to: '/dashboard/faqs',        icon: HelpCircle,      label: 'FAQ' },
  { to: '/dashboard/content',     icon: FileText,        label: 'Contenu du site' },
  { to: '/dashboard/settings',    icon: Settings,        label: 'Paramètres' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/editor': 'Éditeur visuel',
  '/dashboard/overview': 'Vue d\'ensemble',
  '/dashboard/projects': 'Réalisations',
  '/dashboard/services': 'Services',
  '/dashboard/testimonials': 'Témoignages',
  '/dashboard/faqs': 'FAQ',
  '/dashboard/content': 'Contenu du site',
  '/dashboard/settings': 'Paramètres',
};

function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();

  function logout() {
    auth.clearToken();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center">
            <span className="text-[#B89B5E] font-bold text-xs">2M</span>
          </div>
          <div>
            <p className="font-semibold text-[#1F1F1F] text-sm leading-none">2M ARCHI</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Administration</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#B89B5E] bg-amber-50 border-l-2 border-[#B89B5E] pl-[10px]'
                  : 'text-gray-600 hover:text-[#1F1F1F] hover:bg-gray-50'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <a
          href={FRONT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-[#1F1F1F] hover:bg-gray-50 transition-colors"
        >
          <ExternalLink size={16} />
          Voir le site
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-[#1F1F1F]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-[#1F1F1F] text-sm lg:text-base">{title}</h1>
          </div>
          <a
            href={FRONT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#B89B5E] transition-colors"
          >
            Voir le site <ExternalLink size={12} />
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
