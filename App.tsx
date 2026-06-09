import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import Feed from './pages/Feed';
import ArticleView from './pages/ArticleView';
import Profile from './pages/Profile';
import Authors from './pages/Authors';
import Communities from './pages/Communities';
import CommunityView from './pages/CommunityView';
import CommunityMembers from './pages/CommunityMembers';
import Editor from './pages/Editor';
import { User as UserType } from './types';
import { db } from './services/mockDb';
import { Loader2 } from 'lucide-react';

function WriteRoute({ user }: { user: UserType | null }) {
  const [searchParams] = useSearchParams();
  const community = searchParams.get('community');
  if (!user) {
    const qs = community ? `?community=${encodeURIComponent(community)}` : '';
    return <Navigate to="/login" replace state={{ from: `/write${qs}` }} />;
  }
  return <Editor currentUser={user} />;
}

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = db.getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    db.clearSession();
    setUser(null);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-north-50">
        <Loader2 className="animate-spin text-north-400" size={32} />
      </div>
    );

  return (
    <Router>
      <div className="min-h-screen bg-north-50 font-sans text-north-800 flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Feed currentUser={user} />} />
            <Route path="/register" element={<Register onLogin={setUser} />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/article/:id" element={<ArticleView currentUser={user} />} />
            <Route path="/profile/:id" element={<Profile currentUser={user} />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/communities" element={<Communities currentUser={user} />} />
            <Route path="/community/:id/members" element={<CommunityMembers />} />
            <Route path="/community/:id" element={<CommunityView currentUser={user} />} />
            <Route path="/people" element={<Navigate to="/authors" replace />} />
            <Route path="/write" element={<WriteRoute user={user} />} />
            <Route path="/edit/:id" element={user ? <Editor currentUser={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}