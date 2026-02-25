'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FilePlus, Hash, FileText, CheckSquare, FileOutput, LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

const NAV = [
  { href: '/dashboard',         label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/fund-registration', label: 'Fund Registration',  icon: FilePlus },
  { href: '/grant-id',          label: 'Grant ID',           icon: Hash },
  { href: '/grant-request',     label: 'Grant Request',      icon: FileText },
  { href: '/approvals',         label: 'Approvals',          icon: CheckSquare },
  { href: '/ho-letter',         label: 'H.O Letter',         icon: FileOutput },
];

export default function Sidebar() {
  const path = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 40,
    }}>
      {/* Brand */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          fontFamily: 'var(--font)',
          fontSize: '15px',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
        }}>
          Fund Tracker
        </div>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.38)',
          marginTop: '3px',
          letterSpacing: '0.03em',
          fontWeight: 500,
        }}>
          Grant Management Portal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '9px 12px',
                borderRadius: '6px',
                marginBottom: '1px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                background: active ? 'rgba(37,99,235,0.85)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.13s, color 0.13s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                }
              }}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          padding: '9px 12px',
          borderRadius: '6px',
          marginBottom: '4px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
            {user?.fullName ?? user?.email ?? '—'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', marginTop: '1px' }}>
            {[user?.roles?.[0], user?.department].filter(Boolean).join(' · ') || 'User'}
          </div>
        </div>
        <button
          onClick={() => signOut()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: 'rgba(255,255,255,0.4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'var(--font-body)',
            transition: 'color 0.13s, background 0.13s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#f87171';
            (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut size={13} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
