import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'green' | 'blue-outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  leftIcon, rightIcon, children, disabled, className, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '', className ?? ''].filter(Boolean).join(' ')}
      {...props}
    >
      {loading
        ? <span style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} className="spin" />
        : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
