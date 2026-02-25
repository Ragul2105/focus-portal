'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { listRegistrations, listCategories, listDetails, createRegistration, submitRegistration } from '@/lib/api';
import { formatINR } from '@/lib/data';
import type { Registration, ActivityCategory, ActivityDetail } from '@/lib/types';
import { Plus, X, CheckCircle, Send } from 'lucide-react';

export default function FundRegistrationPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [details, setDetails] = useState<ActivityDetail[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const appFormRef = useRef<HTMLInputElement>(null);
  const confFormRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    appliedAs: 'INDIVIDUAL' as 'INDIVIDUAL' | 'TEAM',
    teamCount: '',
    fundingAgency: 'GOV' as 'GOV' | 'NON_GOV',
    fundsFrom: 'NATIONAL' as 'NATIONAL' | 'INTERNATIONAL',
    activityCategoryId: '',
    activityDetailId: '',
    activityDetailText: '',
    fundAppliedINR: '',
    fundAppliedUSD: '',
    appliedApplicationNumber: '',
    appliedDate: '',
  });

  useEffect(() => {
    listRegistrations().then(setRegistrations);
    listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (form.activityCategoryId) {
      listDetails(Number(form.activityCategoryId)).then(setDetails);
    } else {
      setDetails([]);
    }
  }, [form.activityCategoryId]);

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v, ...(k === 'activityCategoryId' ? { activityDetailId: '', activityDetailText: '' } : {}) }));
  }

  const selectedCategory = categories.find(c => String(c.id) === form.activityCategoryId);
  const isOtherCategory = selectedCategory?.allows_free_text === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('appliedAs', form.appliedAs);
      if (form.appliedAs === 'TEAM' && form.teamCount) fd.append('teamCount', form.teamCount);
      fd.append('fundingAgency', form.fundingAgency);
      fd.append('fundsFrom', form.fundsFrom);
      fd.append('activityCategoryId', form.activityCategoryId);
      if (isOtherCategory) {
        if (form.activityDetailText) fd.append('activityDetailText', form.activityDetailText);
      } else {
        if (form.activityDetailId) fd.append('activityDetailId', form.activityDetailId);
      }
      fd.append('fundInr', form.fundAppliedINR);
      if (form.fundAppliedUSD) fd.append('fundUsd', form.fundAppliedUSD);
      if (form.appliedApplicationNumber) fd.append('applicationNumber', form.appliedApplicationNumber);
      fd.append('appliedDate', form.appliedDate);
      if (appFormRef.current?.files?.[0]) fd.append('applicationForm', appFormRef.current.files[0]);
      if (confFormRef.current?.files?.[0]) fd.append('confirmationForm', confFormRef.current.files[0]);

      await createRegistration(fd);
      const updated = await listRegistrations();
      setRegistrations(updated);
      setSuccess('Registration created successfully.');
      setShowForm(false);
      setForm({ appliedAs: 'INDIVIDUAL', teamCount: '', fundingAgency: 'GOV', fundsFrom: 'NATIONAL', activityCategoryId: '', activityDetailId: '', activityDetailText: '', fundAppliedINR: '', fundAppliedUSD: '', appliedApplicationNumber: '', appliedDate: '' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDraft(id: string) {
    await submitRegistration(id);
    listRegistrations().then(setRegistrations);
  }

  return (
    <AppLayout>
      <PageHeader
        title="Fund Registration"
        subtitle="Register grant applications and generate College Grants Registration IDs"
        action={
          <Button leftIcon={<Plus size={14} />} onClick={() => { setShowForm(v => !v); setSuccess(''); }}>
            {showForm ? 'Cancel' : 'New Registration'}
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

      {/* Registration Form */}
      {showForm && (
        <Card title="New Fund Registration" className="fade-up" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>

              {/* Applied As */}
              <FormField label="Applied As" required>
                <select className="form-select" value={form.appliedAs} onChange={e => set('appliedAs', e.target.value)} required>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="TEAM">Team</option>
                </select>
              </FormField>

              {form.appliedAs === 'TEAM' && (
                <FormField label="Team Count" required>
                  <input className="form-input" type="number" min={2} value={form.teamCount} onChange={e => set('teamCount', e.target.value)} placeholder="e.g. 4" required />
                </FormField>
              )}

              {/* Funding Agency */}
              <FormField label="Funding Agency" required>
                <select className="form-select" value={form.fundingAgency} onChange={e => set('fundingAgency', e.target.value)} required>
                  <option value="GOV">Government</option>
                  <option value="NON_GOV">Non-Government</option>
                </select>
              </FormField>

              {/* Funds From */}
              <FormField label="Funds From" required>
                <select className="form-select" value={form.fundsFrom} onChange={e => set('fundsFrom', e.target.value)} required>
                  <option value="NATIONAL">National</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </FormField>

              <FormField label="Activity Category" required>
                <select className="form-select" value={form.activityCategoryId} onChange={e => set('activityCategoryId', e.target.value)} required>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </FormField>

              {/* Activity Detail */}
              <FormField label="Activity Detail" required>
                {!form.activityCategoryId ? (
                  <select className="form-select" disabled>
                    <option value="">Select a category first...</option>
                  </select>
                ) : isOtherCategory ? (
                  <input
                    className="form-input"
                    value={form.activityDetailText}
                    onChange={e => set('activityDetailText', e.target.value)}
                    placeholder="Describe the activity (e.g. Hackathon, Workshop...)"
                    required
                  />
                ) : (
                  <select
                    className="form-select"
                    value={form.activityDetailId}
                    onChange={e => set('activityDetailId', e.target.value)}
                    required
                  >
                    <option value="">Select detail...</option>
                    {details.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </FormField>

              {/* Fund Applied INR */}
              <FormField label="Fund Applied (INR)" required>
                <input className="form-input" type="number" min={0} value={form.fundAppliedINR} onChange={e => set('fundAppliedINR', e.target.value)} placeholder="e.g. 150000" required />
              </FormField>

              {/* Fund Applied USD */}
              <FormField label="Fund Applied (USD)" hint="Optional — for international funds">
                <input className="form-input" type="number" min={0} value={form.fundAppliedUSD} onChange={e => set('fundAppliedUSD', e.target.value)} placeholder="e.g. 2000" />
              </FormField>

              {/* Application Number */}
              <FormField label="Applied Application Number" hint="Optional">
                <input className="form-input" value={form.appliedApplicationNumber} onChange={e => set('appliedApplicationNumber', e.target.value)} placeholder="e.g. AICTE/2025/IEEE/0042" />
              </FormField>

              {/* Applied Date */}
              <FormField label="Applied Date" required>
                <input className="form-input" type="date" value={form.appliedDate} onChange={e => set('appliedDate', e.target.value)} required />
              </FormField>
            </div>

            {/* File uploads */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <FormField label="Application Form (PDF)" hint="Application form — PDF only">
                  <input ref={appFormRef} className="form-input" type="file" accept=".pdf" />
                </FormField>
                <FormField label="Confirmation Form (PDF)" hint="Confirmation proof — PDF only">
                  <input ref={confFormRef} className="form-input" type="file" accept=".pdf" />
                </FormField>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={loading}>Create Registration</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Registrations" subtitle={`${registrations.length} records`} className="fade-up-2" padding="0">
        {registrations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
            No registrations yet. Create your first one above.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg ID</th>
                <th>Applied As</th>
                <th>Category</th>
                <th>Activity Detail</th>
                <th>Fund Applied (INR)</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id}>
                  <td><span className="grant-id">{r.reg_id}</span></td>
                  <td style={{ color: 'var(--ink-2)', fontSize: '12.5px' }}>{r.applied_as}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{r.category_name}</td>
                  <td style={{ fontSize: '12.5px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail_name || r.activity_detail_text || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r.fund_inr != null ? formatINR(r.fund_inr) : '—'}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>{r.applied_date ? new Date(r.applied_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <span className={`badge badge-${r.status === 'SUBMITTED' || r.status === 'GRANT_ID_ISSUED' || r.status === 'COMPLETED' ? 'approved' : r.status === 'REJECTED' ? 'rejected' : 'draft'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'DRAFT' && (
                      <Button variant="secondary" leftIcon={<Send size={12} />} onClick={() => handleSubmitDraft(r.id)} style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                        Submit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  );
}
