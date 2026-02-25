interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, required, hint, error, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label className="form-label">
        {label}
        {required && <span style={{ color: 'var(--accent)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--ink-3)' }}>{hint}</p>
      )}
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--red)' }}>{error}</p>
      )}
    </div>
  );
}
