'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CopyPlus, Calendar, Home, Wrench, Users, ShieldAlert, Settings, Package, Menu, X, DollarSign } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  role: 'admin' | 'cliente';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Miembros', href: '/admin/clients', icon: Users },
    { name: 'Repuestos', href: '/admin/parts', icon: Package },
    { name: 'Costos', href: '/admin/costs', icon: DollarSign },
  ];

  const clientLinks = [
    { name: 'Dashboard', href: '/client/dashboard', icon: Home },
    { name: 'Nueva Reserva', href: '/client/appointments/new', icon: CopyPlus },
  ];

  const links = role === 'admin' ? adminLinks : clientLinks;

  return (
    <>
      {/* ===== MOBILE: Bottom Tab Bar ===== */}
      <nav className="mobile-bottom-nav">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href) && (link.href !== '/admin/dashboard' || pathname === '/admin/dashboard');
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
        {role === 'admin' && (
          <Link
            href="/admin/settings"
            className={`mobile-nav-item ${pathname.startsWith('/admin/settings') ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Config</span>
          </Link>
        )}
      </nav>

      {/* ===== DESKTOP: Side Panel ===== */}
      <aside className="sidebar">
        <div className="sidebar-group" style={{ marginBottom: "24px" }}>
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Wrench size={18} />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              Gajardo App
            </span>
          </div>
        </div>

        <div className="sidebar-group">
          <span className="sidebar-label">Menú Principal</span>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href) && (link.href !== '/admin/dashboard' || pathname === '/admin/dashboard');
            
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </div>

        {role === 'admin' && (
          <div className="sidebar-group mt-4">
            <span className="sidebar-label">Sistema</span>
            <Link href="/admin/settings" className={`nav-item ${pathname.startsWith('/admin/settings') ? 'active' : ''}`}>
              <Settings className="nav-icon" />
              <span>Configuración</span>
            </Link>
          </div>
        )}
        
        <div style={{ marginTop: "auto" }}>
          <div className="glass-panel flex-col gap-3" style={{ padding: "16px" }}>
             <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }} className="flex items-center gap-2">
               Rol activo: <strong className="text-emerald-600 capitalize">{role}</strong>
               {role === 'admin' && <ShieldAlert size={14} className="text-emerald-600" />}
             </span>
             <div style={{ height: "4px", background: "var(--glass-border)", borderRadius: "4px", overflow: "hidden" }}>
               <div style={{ width: "100%", height: "100%", background: "var(--accent-primary)" }}></div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
}
