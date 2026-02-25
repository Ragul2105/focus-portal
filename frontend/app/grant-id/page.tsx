'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { listRegistrations, listGrantIds, generateGrantId } from '@/lib/api';
import { formatINR } from '@/lib/data';
import type { Registration, GrantId } from '@/lib/types';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function GrantIdPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [grantIds, setGrantIds] = useState<GrantId[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GrantId | null>(null);

  // Only SUBMITTED registrations are eligible for grant ID generation
  const eligible = registrations.filter(r => r.status === 'SUBMITTED');
  const selected = registrations.find(r => r.id === selectedId);

  useEffect(() => {
    listRegistrations().then(setRegistrations);
    listGrantIds().then(setGrantIds);
  }, []);

  async function handleGenerate() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const record = await generateGrantId(selectedId);
      setGenerated(record);
      const [updatedRegs, updatedIds] = await Promise.all([listRegistrations(), listGrantIds()]);
      setRegistrations(updatedRegs);
      setGrantIds(updatedIds);
      setSelectedId('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Grant ID Generation"
        subtitle="Generate activity grant IDs for submitted fund registrations"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Generator */}
        <Card title="Generate New Grant ID" className="fade-up">
          {generated && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', background: 'var(--green-bg)', border: '1px solid rgba(26,92,53,0.2)', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ color: 'var(--green)', marginTop: '1px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>Grant ID generated successfully</div>
                <span className="grant-id" style={{ marginTop: '6px', display: 'inline-block' }}>{generated.grant_id}</span>
              </div>
            </div>
          )}

          <FormField label="Select Registration" required hint="Only submitted registrations are listed">
            <select className="form-select" value={selectedId} onChange={e => { setSelectedId(e.target.value); setGenerated(null); }}>
              <option value="">Choose registration...</option>
              {eligible.map(r => (
                <option key={r.id} value={r.id}>
                  {r.reg_id} — {r.category_name ?? ''} · {(r.detail_name ?? '').slice(0, 30)}
                </option>
              ))}
            </select>
          </FormField>

          {selected && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Registration Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {([
                  ['Reg ID', selected.reg_id],
                  ['Category', selected.category_name ?? '—'],
                  ['Detail', selected.detail_name ?? '—'],
                  ['Fund Applied (INR)', selected.fund_inr != null ? formatINR(selected.fund_inr) : '—'],
                  ['Applied As', selected.applied_as],
                  ['Applied Date', selected.applied_date ? new Date(selected.applied_date).toLocaleDateString('en-IN') : '—'],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{k}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            leftIcon={<Sparkles size={14} />}
            onClick={handleGenerate}
            loading={loading}
            disabled={!selectedId}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Generate Grant ID
          </Button>

          {eligible.length === 0 && (
            <p style={{ fontSize: '12.5px', color: 'var(--ink-3)', marginTop: '16px', textAlign: 'center' }}>
              No submitted registrations awaiting Grant ID generation.
            </p>
          )}
        </Card>

        {/* Info card */}
        <Card title="About Grant IDs" className="fade-up-2">
          <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '12px' }}>Grant IDs are automatically generated by the system when you select a submitted registration and click Generate.</p>
            <p style={{ marginBottom: '12px' }}>The ID encodes the activity category, detail, year, and a sequence number to uniquely identify each grant.</p>
            <p>Only registrations with status <strong>SUBMITTED</strong> are eligible for Grant ID generation.</p>
          </div>
        </Card>
      </div>

      {/* Existing Grant IDs */}
      <Card title="Generated Grant IDs" subtitle={`${grantIds.length} IDs generated`} className="fade-up-3" padding="0">
        {grantIds.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>No grant IDs generated yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Grant ID</th>
                <th>Reg ID</th>
                <th>Category</th>
                <th>Activity Detail</th>
                <th>Amount Granted (INR)</th>
                <th>Generated</th>
              </tr>
            </thead>
            <tbody>
              {grantIds.map(g => (
                <tr key={g.id}>
                  <td><span className="grant-id">{g.grant_id}</span></td>
                  <td><span className="grant-id">{g.reg_id}</span></td>
                  <td style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{g.category_name}</td>
                  <td style={{ fontSize: '12.5px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.detail_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{g.amount_granted_inr != null ? formatINR(g.amount_granted_inr) : '—'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{new Date(g.generated_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  );
}

