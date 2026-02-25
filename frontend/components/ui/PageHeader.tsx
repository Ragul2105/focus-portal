interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px',
        paddingBottom: '18px',
        borderBottom: '1px solid var(--border)',
      }}
      className="fade-up"
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font)',
            fontSize: '19px',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--ink-3)',
              margin: '4px 0 0',
              fontWeight: 400,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
