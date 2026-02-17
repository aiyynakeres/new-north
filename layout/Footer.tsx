import React from 'react';
import { Mail, Send } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-north-200 mt-auto py-4">
    <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        {/* logo image reused from header */}
        <img src="/logo.png" alt="New-North" className="w-5 h-5" />
        <span className="font-serif font-bold text-north-800 text-sm">New-North</span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-xs text-north-500">
        <a href="https://t.me/your_group" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-north-800 transition-colors">
          <Send size={16} className="mr-1" />
          tg-канал
        </a>
        <a href="mailto:new-north@gmail.com" className="flex items-center hover:text-north-800 transition-colors">
          <Mail size={16} className="mr-1" />
          n-n@gmail.com
        </a>
      </div>

    </div>
  </footer>
);

export default Footer;

