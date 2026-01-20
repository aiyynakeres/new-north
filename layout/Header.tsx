import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, PenTool, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { User } from '../types';

type Props = {
  user: User | null;
  onLogout: () => void;
};

const Header: React.FC<Props> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-north-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-north-800 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg group-hover:rotate-3 transition-transform">
            N
          </div>
          <span className="font-serif font-bold text-xl text-north-800 tracking-tight">New-North</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/write">
                <Button variant="secondary" className="hidden sm:flex text-sm">
                  <PenTool size={16} /> Write
                </Button>
              </Link>
              <Link to="/people" className="text-north-500 hover:text-north-900 transition-colors">
                <Users size={20} />
              </Link>
              <div className="relative group">
                <Link to={`/profile/${user.id}`}>
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-north-200 cursor-pointer"
                  />
                </Link>
              </div>
              <button onClick={onLogout} className="text-north-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Join Club</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

