'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { listGrantRequests, generateLetter, listLetters, getLetterDownloadUrl } from '@/lib/api';
import { formatINR } from '@/lib/data';
import type { GrantRequest, GeneratedLetter } from '@/lib/types';
import { FileOutput, Download, CheckCircle, RefreshCw } from 'lucide-react';

export default function HOLetterPage() {
  const [requests, setRequests] = useState<GrantRequest[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [letters, setLetters] = useState<GeneratedLetter[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const approved = requests.filter(r => r.status === 'APPROVED');
  const selected = requests.find(r => r.id === selectedId);

  useEffect(() => { listGrantRequests().then(setRequests); }, []);

  useEffect(() => {
    if (selectedId) {
      listLetters(selectedId).then(setLetters);
      setGenerated(false);
    } else {
      setLetters([]);
    }
  }, [selectedId]);

  async function handleGenerate() {
    if (!selectedId) return;
    setLoading(true);
    try {
      await generateLetter(selectedId);
      const updated = await listLetters(selectedId);
      setLetters(updated);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(letter: GeneratedLetter) {
    const url = await getLetterDownloadUrl(letter.s3_key);
    window.open(url, '_blank');
  }

  return (
    <AppLayout>
      <PageHeader
        title="H.O Letter Generation"
        subtitle="Auto-generate Head of Office letters after final approval"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
        {/* Left panel — selector */}
        <div>
          <Card title="Select Approved Request" className="fade-up">
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Approved Grant Request</label>
              <select
                className="form-select"
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setGenerated(false); }}
              >
                <option value="">Choose request...</option>
                {approved.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.grant_id} — {(r.detail_name ?? r.category_name ?? '').slice(0, 28)}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <div
                style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '12px', marginBottom: '14px',
                }}
              >
                {([
                  ['Grant ID', <span key="gid" className="grant-id">{selected.grant_id}</span>],
                  ['Applicant', selected.user_name],
                  ['Activity', selected.detail_name ?? selected.category_name],
                  ['Requested', selected.requested_amount_inr != null ? formatINR(selected.requested_amount_inr) : '—'],
                  ['Granted', selected.amount_granted_inr ? formatINR(selected.amount_granted_inr) : '—'],
                  ['Letters', letters.length > 0 ? <span key="gen" className="badge badge-approved">{letters.length} Generated</span> : <span key="nog" className="badge badge-pending">None yet</span>],
                ] as [string, React.ReactNode][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              leftIcon={<FileOutput size={14} />}
              onClick={handleGenerate}
              loading={loading}
              disabled={!selectedId}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
            >
              Generate H.O Letter
            </Button>


          </Card>

          {/* Approved requests list */}
          <Card title="Approved Requests" className="fade-up-2" style={{ marginTop: '14px' }} padding="12px 16px">
            {approved.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--ink-3)', margin: 0 }}>No approved requests yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {approved.map(r => (
                  <div
                    key={r.id}
                    onClick={() => { setSelectedId(r.id); setGenerated(false); }}
                    style={{
                      padding: '10px 12px', border: `1px solid ${selectedId === r.id ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)', cursor: 'pointer',
                      background: selectedId === r.id ? 'var(--accent-bg)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="grant-id">{r.grant_id}</span>
                      {selectedId === r.id && letters.length > 0 && <span className="badge badge-approved" style={{ fontSize: '10px' }}>Generated</span>}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-3)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.detail_name ?? r.category_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right panel — generated letters */}
        <div>
          {!selectedId ? (
            <div
              className="fade-up-2"
              style={{
                height: '500px', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '12px',
                color: 'var(--ink-3)',
              }}
            >
              <FileOutput size={32} strokeWidth={1.2} />
              <div style={{ fontSize: '14px', fontWeight: 500 }}>H.O Letter Generation</div>
              <div style={{ fontSize: '12.5px' }}>Select an approved request to get started</div>
            </div>
          ) : (
            <div className="fade-up">
              {generated && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', background: 'var(--green-bg)',
                  border: '1px solid rgba(26,92,53,0.2)', borderRadius: 'var(--radius)',
                  marginBottom: '16px', fontSize: '13px', color: 'var(--green)',
                }}>
                  <CheckCircle size={15} /> H.O Letter generated successfully
                </div>
              )}

              <Card title={`Letters for ${selected?.grant_id ?? ''}`}>
                {letters.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: '13px' }}>
                    <RefreshCw size={24} strokeWidth={1.2} style={{ marginBottom: '8px' }} />
                    <div>No letters generated yet. Click &ldquo;Generate H.O Letter&rdquo; to create one.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {letters.map((letter, idx) => (
                      <div
                        key={letter.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 14px', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)', background: 'var(--surface-2)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Letter #{idx + 1}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>
                            Generated: {new Date(letter.generated_at).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          leftIcon={<Download size={13} />}
                          onClick={() => handleDownload(letter)}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Download PDF
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
