import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const base =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<Variant, string> = {
    primary: 'bg-north-800 text-white hover:bg-north-700 shadow-md',
    secondary: 'bg-white text-north-800 border border-north-200 hover:bg-north-50',
    ghost: 'text-north-600 hover:text-north-900 hover:bg-north-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

