import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Users, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing: React.FC = () => (
  <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -z-10"></div>

    <h1 className="font-serif text-5xl md:text-7xl font-bold text-north-900 mb-6 tracking-tight">
      New-North
    </h1>
    <p className="text-xl md:text-2xl text-north-600 max-w-2xl mb-2 font-light">
      Делиться, вдохновлять и тд
    </p>
    <p className="text-base text-north-500 max-w-lg mb-10 leading-relaxed">
      Закрытый клуб любителей Якутии
    </p>
    <Link to="/register">
      <Button className="px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
        Стать участником
      </Button>
    </Link>

    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-left">
      <div className="p-6 bg-white rounded-2xl border border-north-100 shadow-sm">
        <div className="w-10 h-10 bg-north-100 rounded-lg flex items-center justify-center text-north-700 mb-4">
          <PenTool size={20} />
        </div>
        <h3 className="font-serif font-bold text-lg mb-2">Share Knowledge</h3>
        <p className="text-north-500 text-sm">Create meaningful articles about your experiences, travels, and skills.</p>
      </div>
      <div className="p-6 bg-white rounded-2xl border border-north-100 shadow-sm">
        <div className="w-10 h-10 bg-north-100 rounded-lg flex items-center justify-center text-north-700 mb-4">
          <Users size={20} />
        </div>
        <h3 className="font-serif font-bold text-lg mb-2">Connect</h3>
        <p className="text-north-500 text-sm">Find like-minded people in Yakutia who are driven by growth.</p>
      </div>
      <div className="p-6 bg-white rounded-2xl border border-north-100 shadow-sm">
        <div className="w-10 h-10 bg-north-100 rounded-lg flex items-center justify-center text-north-700 mb-4">
          <Sparkles size={20} />
        </div>
        <h3 className="font-serif font-bold text-lg mb-2">Inspire</h3>
        <p className="text-north-500 text-sm">A noise-free environment to read, learn, and get inspired.</p>
      </div>
    </div>
  </div>
);

export default Landing;

