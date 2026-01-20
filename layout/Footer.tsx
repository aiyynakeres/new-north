import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-north-200 mt-auto py-8">
    <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-north-800 rounded flex items-center justify-center text-white font-serif font-bold text-xs">
          N
        </div>
        <span className="font-serif font-bold text-north-800">New-North</span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-north-500">
        <a href="#" className="hover:text-north-800 transition-colors">
          Telegram Channel
        </a>
        <a href="mailto:contact@new-north.ru" className="hover:text-north-800 transition-colors">
          Questions? <span className="underline">new-north.ru</span>
        </a>
      </div>

      <div className="text-xs text-north-400">© {new Date().getFullYear()} New-North Yakutia</div>
    </div>
  </footer>
);

export default Footer;

