import React from 'react';
import { X } from 'lucide-react';

type TagProps = {
  children: React.ReactNode;
  onRemove?: () => void;
};

const Tag: React.FC<TagProps> = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-north-100 text-north-600 text-xs rounded-full font-medium tracking-wide border border-north-200">
    #{children}
    {onRemove && (
      <button
        onClick={onRemove}
        className="hover:text-red-500 focus:outline-none ml-1 flex items-center justify-center rounded-full p-0.5 hover:bg-north-200"
      >
        <X size={12} />
      </button>
    )}
  </span>
);

export default Tag;

