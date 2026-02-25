'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { getDashboardStats, getRecentActivity } from '@/lib/api';
import { formatINR } from '@/lib/data';
import type { DashboardStats, RecentActivity } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import { FilePlus, Hash, CheckSquare, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, sub, icon, delay = '0s' }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; delay?: string;
}) {
  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 22px',
        boxShadow: 'var(--shadow-sm)', animationDelay: delay,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            width: '36px', height: '36px', background: 'var(--accent-bg)',
            borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--accent)',
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 400, color: 'var(--ink)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '12.5px', color: 'var(--ink-2)', marginTop: '6px', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '11.5px', color: 'var(--ink-3)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity[]>([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getRecentActivity().then(setRecent);
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.fullName ?? ''} — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          label="Fund Registrations"
          value={stats?.totalRegistrations ?? '—'}
          sub="All time"
          icon={<FilePlus size={16} />}
          delay="0s"
        />
        <StatCard
          label="Grant IDs Generated"
          value={stats?.totalGrantIds ?? '—'}
          sub="Activity IDs issued"
          icon={<Hash size={16} />}
          delay="0.05s"
        />
        <StatCard
          label="Pending Approvals"
          value={stats?.pendingApprovals ?? '—'}
          sub="Needs attention"
          icon={<CheckSquare size={16} />}
          delay="0.10s"
        />
        <StatCard
          label="Total Applied (INR)"
          value={stats ? formatINR(stats.totalFundAppliedINR) : '—'}
          sub={stats ? `Approved: ${formatINR(stats.totalFundApprovedINR)}` : undefined}
          icon={<TrendingUp size={16} />}
          delay="0.15s"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent requests */}
        <Card
          title="Recent Grant Requests"
          className="fade-up-2"
          action={
            <Link href="/grant-request" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
              View all <ArrowUpRight size={12} />
            </Link>
          }
          padding="0"
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Grant ID</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id}>
                  <td><span className="grant-id">{r.grant_id ?? '—'}</span></td>
                  <td style={{ color: 'var(--ink-2)', fontSize: '12.5px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.detail_name ?? r.category_name ?? '—'}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Quick actions */}
        <Card title="Quick Actions" className="fade-up-3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { href: '/fund-registration', label: 'New Fund Registration', desc: 'Register a new grant application', icon: '📋' },
              { href: '/grant-id', label: 'Generate Grant ID', desc: 'Create activity ID for a registration', icon: '#️⃣' },
              { href: '/grant-request', label: 'Submit Grant Request', desc: 'Upload requisition and authorization', icon: '📤' },
              { href: '/approvals', label: 'Review Approvals', desc: 'HOD & Principal approval queue', icon: '✅' },
            ].map(({ href, label, desc, icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 14px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--accent-bg)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{desc}</div>
                </div>
                <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
