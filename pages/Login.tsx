import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  onLogin: (u: UserType) => void;
};

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = db.getUserByEmail(email);
    if (user && user.password === password) {
      db.setSession(user);
      onLogin(user);
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-north-100 p-8">
        <h2 className="font-serif text-3xl font-bold text-north-900 mb-6 text-center">Добро пожаловать</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <div className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
          <Button className="w-full mt-4" onClick={handleLogin}>
            Войти
          </Button>
          <div className="text-center mt-4">
            <Link to="/register" className="text-north-600 text-sm hover:text-north-900">
              Зарегаться можно тут
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

