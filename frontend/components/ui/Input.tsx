import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-sm font-medium text-north-600 mb-1">{label}</label>}
    <input
      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-all text-north-800 placeholder-north-300 ${
        error ? 'border-red-300 focus:ring-red-200' : 'border-north-200 focus:ring-north-400'
      } ${className}`}
      aria-invalid={Boolean(error)}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default Input;
