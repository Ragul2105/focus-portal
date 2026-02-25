'use client';

import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { listGrantIds, listGrantRequests, createGrantRequest } from '@/lib/api';
import { formatINR } from '@/lib/data';
import type { GrantId, GrantRequest } from '@/lib/types';
import { Plus, X, CheckCircle } from 'lucide-react';

export default function GrantRequestPage() {
  const [grantIds, setGrantIds] = useState<GrantId[]>([]);
  const [requests, setRequests] = useState<GrantRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [selectedGrantIdId, setSelectedGrantIdId] = useState('');
  const [requestedAmountInr, setRequestedAmountInr] = useState('');
  const reqLetterRef = useRef<HTMLInputElement>(null);
  const authLetterRef = useRef<HTMLInputElement>(null);

  const selected = grantIds.find(g => g.id === selectedGrantIdId);

  useEffect(() => {
    listGrantIds().then(setGrantIds);
    listGrantRequests().then(setRequests);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGrantIdId) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('grantIdId', selectedGrantIdId);
      fd.append('requestedAmountInr', requestedAmountInr);
      if (reqLetterRef.current?.files?.[0]) fd.append('requisitionLetter', reqLetterRef.current.files[0]);
      if (authLetterRef.current?.files?.[0]) fd.append('authorizationLetter', authLetterRef.current.files[0]);

      await createGrantRequest(fd);
      const updated = await listGrantRequests();
      setRequests(updated);
      setSuccess('Grant request submitted. Pending HOD approval.');
      setShowForm(false);
      setSelectedGrantIdId('');
      setRequestedAmountInr('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Grant Request Submission"
        subtitle="Submit grant requests for HOD and Principal approval"
        action={
          <Button leftIcon={<Plus size={14} />} onClick={() => { setShowForm(v => !v); setSuccess(''); }}>
            {showForm ? 'Cancel' : 'New Request'}
          </Button>
        }
      />

      {success && (
        <div
          className="fade-up"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: 'var(--green-bg)',
            border: '1px solid rgba(26,92,53,0.2)', borderRadius: 'var(--radius)',
            marginBottom: '20px', fontSize: '13.5px', color: 'var(--green)',
          }}
        >
          <CheckCircle size={16} />
          {success}
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {showForm && (
        <Card title="New Grant Request" className="fade-up" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleSubmit}>
            <FormField label="Select Grant ID" required hint="Select a grant ID to file a request against">
              <select className="form-select" value={selectedGrantIdId} onChange={e => setSelectedGrantIdId(e.target.value)} required>
                <option value="">Choose grant ID...</option>
                {grantIds.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.grant_id} — {(g.detail_name ?? g.category_name ?? '').slice(0, 35)}
                  </option>
                ))}
              </select>
            </FormField>

            {selected && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: '16px' }}>
                {([
                  ['Category', selected.category_name ?? '—'],
                  ['Detail', selected.detail_name ?? '—'],
                  ['Amount Granted (INR)', selected.amount_granted_inr != null ? formatINR(selected.amount_granted_inr) : '—'],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginBottom: '2px' }}>{k}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            <FormField label="Requested Amount (INR)" required>
              <input className="form-input" type="number" min={0} value={requestedAmountInr} onChange={e => setRequestedAmountInr(e.target.value)} placeholder="e.g. 150000" required />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <FormField label="Requisition Letter (PDF)" hint="Grant Evaluation Form — PDF only">
                <input ref={reqLetterRef} className="form-input" type="file" accept=".pdf" />
              </FormField>
              <FormField label="Authorization Letter (PDF)" hint="College authorization — PDF only">
                <input ref={authLetterRef} className="form-input" type="file" accept=".pdf" />
              </FormField>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={loading} disabled={!selectedGrantIdId}>Submit Request</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Requests table */}
      <Card title="My Grant Requests" subtitle={`${requests.length} submissions`} className="fade-up-2" padding="0">
        {requests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>No requests yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Grant ID</th>
                <th>Activity</th>
                <th>Requested (INR)</th>
                <th>Submitted</th>
                <th>HOD</th>
                <th>Principal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const hodApproval = r.approvals?.find(a => a.step === 'HOD');
                const principalApproval = r.approvals?.find(a => a.step === 'PRINCIPAL');
                return (
                  <tr key={r.id}>
                    <td><span className="grant-id">{r.grant_id}</span></td>
                    <td style={{ fontSize: '12.5px', color: 'var(--ink-2)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.detail_name ?? r.category_name}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r.requested_amount_inr != null ? formatINR(r.requested_amount_inr) : '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      {hodApproval ? (
                        <span className={`badge ${hodApproval.status === 'APPROVED' ? 'badge-approved' : hodApproval.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                          {hodApproval.status}
                        </span>
                      ) : <span className="badge badge-pending">Pending</span>}
                    </td>
                    <td>
                      {principalApproval ? (
                        <span className={`badge ${principalApproval.status === 'APPROVED' ? 'badge-approved' : principalApproval.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                          {principalApproval.status}
                        </span>
                      ) : <span className="badge badge-draft">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'APPROVED' ? 'badge-approved' : r.status === 'REJECTED' ? 'badge-rejected' : r.status === 'HOD_APPROVED' ? 'badge-pending' : 'badge-draft'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  );
}
