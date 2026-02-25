'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { listGrantRequests, decideApproval } from '@/lib/api';
import { formatINR } from '@/lib/data';
import { useAuth } from '@/lib/authContext';
import type { GrantRequest } from '@/lib/types';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

type TabType = 'pending' | 'all';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<GrantRequest[]>([]);
  const [tab, setTab] = useState<TabType>('pending');
  const [modal, setModal] = useState<{ req: GrantRequest; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<GrantRequest | null>(null);

  const isHod = user?.roles?.includes('HOD');
  const isPrincipal = user?.roles?.includes('PRINCIPAL');

  useEffect(() => { listGrantRequests().then(setRequests); }, []);

  const pending = requests.filter(r =>
    isHod ? r.status === 'PENDING' : isPrincipal ? r.status === 'HOD_APPROVED' : false
  );

  const displayed = tab === 'pending' ? pending : requests;

  const canAct = isHod || isPrincipal;

  async function handleAction() {
    if (!modal) return;
    setLoading(true);
    try {
      await decideApproval(modal.req.id, modal.action === 'approve' ? 'APPROVED' : 'REJECTED', remarks || undefined);
      setRequests(await listGrantRequests());
      setModal(null);
      setRemarks('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Approval Workflow"
        subtitle={`Reviewing as ${isHod ? 'Head of Department (HOD)' : isPrincipal ? 'Principal' : 'Viewer'}`}
      />

      {canAct && (
        <div
          className="fade-up"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', background: 'var(--accent-bg)',
            border: '1px solid rgba(37,99,235,0.2)', borderRadius: 'var(--radius)',
            marginBottom: '20px', fontSize: '12.5px', color: 'var(--accent)',
          }}
        >
          <CheckCircle size={14} />
          Logged in as <strong>{isHod ? 'HOD' : 'Principal'}</strong> — you can approve/reject{' '}
          {isHod ? 'pending HOD' : 'HOD-approved'} requests
        </div>
      )}

      {/* Tabs */}
      <div
        className="fade-up-2"
        style={{
          display: 'flex', gap: '4px', marginBottom: '16px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '4px', width: 'fit-content',
        }}
      >
        {(['pending', 'all'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', border: 'none', borderRadius: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer',
              fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--ink-2)',
              transition: 'all 0.15s',
            }}
          >
            {t === 'pending' ? `Pending (${pending.length})` : `All Requests (${requests.length})`}
          </button>
        ))}
      </div>

      {/* Requests */}
      <Card
        title={tab === 'pending' ? 'Pending Your Approval' : 'All Grant Requests'}
        className="fade-up-3"
        padding="0"
      >
        {displayed.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
            {tab === 'pending' ? '🎉 No pending approvals!' : 'No requests found.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Grant ID</th>
                <th>Submitted By</th>
                <th>Activity</th>
                <th>Requested (INR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(r => {
                const myPending = isHod ? r.status === 'PENDING' : isPrincipal ? r.status === 'HOD_APPROVED' : false;
                return (
                  <tr key={r.id}>
                    <td><span className="grant-id">{r.grant_id ?? '—'}</span></td>
                    <td style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{r.user_name ?? '—'}</td>
                    <td style={{ fontSize: '12.5px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.detail_name ?? r.category_name ?? '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {r.requested_amount_inr != null ? formatINR(r.requested_amount_inr) : '—'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => setDetailModal(r)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', background: 'none', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px',
                            color: 'var(--ink-2)', fontFamily: 'var(--font-body)',
                          }}
                        >
                          <Eye size={12} /> View
                        </button>
                        {canAct && myPending && (
                          <>
                            <button
                              onClick={() => { setModal({ req: r, action: 'approve' }); setRemarks(''); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '4px 8px', background: 'var(--green-bg)', border: '1px solid rgba(26,92,53,0.2)',
                                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px',
                                color: 'var(--green)', fontFamily: 'var(--font-body)', fontWeight: 500,
                              }}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => { setModal({ req: r, action: 'reject' }); setRemarks(''); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '4px 8px', background: 'var(--red-bg)', border: '1px solid rgba(139,26,26,0.2)',
                                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px',
                                color: 'var(--red)', fontFamily: 'var(--font-body)', fontWeight: 500,
                              }}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Approve/Reject Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        width="440px"
      >
        {modal && (
          <>
            <div
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: '16px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Grant ID', modal.req.grant_id ?? '—'],
                  ['Amount', modal.req.requested_amount_inr != null ? formatINR(modal.req.requested_amount_inr) : '—'],
                  ['Activity', modal.req.detail_name ?? modal.req.category_name ?? '—'],
                  ['Submitted By', modal.req.user_name ?? '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">
                Remarks {modal.action === 'reject' && <span style={{ color: 'var(--accent)' }}>*</span>}
              </label>
              <textarea
                className="form-textarea"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={modal.action === 'approve' ? 'Optional remarks...' : 'Reason for rejection...'}
                required={modal.action === 'reject'}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button
                variant={modal.action === 'approve' ? 'primary' : 'danger'}
                onClick={handleAction}
                loading={loading}
                leftIcon={modal.action === 'approve' ? <CheckCircle size={14} /> : <XCircle size={14} />}
              >
                {modal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Grant Request Details" width="520px">
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              {[
                ['Grant ID', <span className="grant-id" key="gid">{detailModal.grant_id ?? '—'}</span>],
                ['Reg ID', <span className="grant-id" key="rid">{detailModal.reg_id ?? '—'}</span>],
                ['Category', detailModal.category_name ?? '—'],
                ['Activity', detailModal.detail_name ?? '—'],
                ['Requested (INR)', detailModal.requested_amount_inr != null ? formatINR(detailModal.requested_amount_inr) : '—'],
                ['Submitted By', detailModal.user_name ?? '—'],
                ['Status', <StatusBadge key="status" status={detailModal.status} />],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginBottom: '3px' }}>{k}</div>
                  <div style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{v as React.ReactNode}</div>
                </div>
              ))}
            </div>

            {detailModal.approvals && detailModal.approvals.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: '8px' }}>Approval Trail</div>
                {detailModal.approvals.map(a => (
                  <div key={a.id} style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{a.step}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.decided_by_name && <div style={{ fontSize: '12px', color: 'var(--ink-2)' }}>By: {a.decided_by_name}</div>}
                    {a.remarks && <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '4px' }}>{a.remarks}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
