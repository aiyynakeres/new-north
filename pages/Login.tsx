import React, { useMemo, useState } from 'react';
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
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fieldErrors = useMemo(() => {
    const errors: { email?: string; password?: string } = {};
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      errors.email = 'Почта обязательна';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = 'Введите корректный email';
    }

    if (!normalizedPassword) {
      errors.password = 'Пароль обязателен';
    }

    return errors;
  }, [email, password]);

  const isFormValid = useMemo(() => !fieldErrors.email && !fieldErrors.password, [fieldErrors]);

  const handleLogin = () => {
    if (!isFormValid) {
      setTouched({ email: true, password: true });
      return;
    }

    setError('');
    const user = db.verifyEmailPassword(email.trim(), password.trim());
    if (user) {
      db.setSession(user);
      onLogin(user);
      navigate('/');
    } else {
      setError('Неверный email или пароль');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-north-100 p-8">
        <h2 className="font-serif text-3xl font-bold text-north-900 mb-2 text-center">Вход</h2>
        {/* <p className="text-center text-north-500 text-sm mb-6">Введи свою почту и пароль</p> */}
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <div className="space-y-4 mb-6">
          <Input
            label="Почта"
            type="email"
            required
            placeholder="your@email.com"
            error={touched.email ? fieldErrors.email : undefined}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Input
            label="Пароль"
            type="password"
            required
            placeholder="••••••••"
            error={touched.password ? fieldErrors.password : undefined}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <Button 
          className="w-full mb-4" 
          onClick={handleLogin} 
          disabled={!isFormValid}
        >
          Войти
        </Button>

        <div className="space-y-2 text-center text-sm">
          <div>
            <Link 
              to="#" 
              onClick={(e) => e.preventDefault()}
              className="text-north-500 hover:text-north-700 transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>
          {/* <div>
            <span className="text-north-500">Нет аккаунта? </span>
            <Link 
              to="/register" 
              className="text-north-600 font-medium hover:text-north-900 transition-colors"
            >
              Зарегистрируйся
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
