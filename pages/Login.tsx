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
  const [step, setStep] = useState<1 | 2>(1);
  const [telegramHandle, setTelegramHandle] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [touched, setTouched] = useState({ telegramHandle: false, authCode: false });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fieldErrors = useMemo(() => {
    const errors: { telegramHandle?: string; authCode?: string } = {};
    const normalizedTelegramHandle = telegramHandle.trim();
    const normalizedAuthCode = authCode.trim();

    if (!normalizedTelegramHandle) {
      errors.telegramHandle = 'Telegram обязателен';
    }

    if (!normalizedAuthCode) {
      errors.authCode = 'Код обязателен';
    } else if (!/^\d{6}$/.test(normalizedAuthCode)) {
      errors.authCode = 'Код должен состоять из 6 цифр';
    }

    return errors;
  }, [telegramHandle, authCode]);

  const isStepOneValid = useMemo(() => !fieldErrors.telegramHandle, [fieldErrors.telegramHandle]);
  const isStepTwoValid = useMemo(() => !fieldErrors.authCode, [fieldErrors.authCode]);

  const handleRequestCode = () => {
    if (!isStepOneValid) {
      setTouched((prev) => ({ ...prev, telegramHandle: true }));
      return;
    }

    setError('');
    setStep(2);
  };

  const handleLogin = () => {
    if (!isStepTwoValid) {
      setTouched((prev) => ({ ...prev, authCode: true }));
      return;
    }

    setError('');
    const user = db.verifyAuthCode(telegramHandle.trim(), authCode.trim());
    if (user) {
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
          {step === 1 ? (
            <>
              <Input
                label="Telegram"
                required
                error={touched.telegramHandle ? fieldErrors.telegramHandle : undefined}
                onBlur={() => setTouched((prev) => ({ ...prev, telegramHandle: true }))}
                value={telegramHandle}
                onChange={(e: any) => setTelegramHandle(e.target.value)}
              />
              <Button className="w-full mt-4" onClick={handleRequestCode} disabled={!isStepOneValid}>
                Получить код
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Код авторизации"
                required
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                error={touched.authCode ? fieldErrors.authCode : undefined}
                onBlur={() => setTouched((prev) => ({ ...prev, authCode: true }))}
                value={authCode}
                onChange={(e: any) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <p className="text-xs text-north-500 -mt-2">Тестовый код: 123456</p>
              <Button className="w-full mt-4" onClick={handleLogin} disabled={!isStepTwoValid}>
                Войти
              </Button>
              <button
                className="w-full text-center text-sm text-north-500 hover:underline"
                onClick={() => {
                  setStep(1);
                  setAuthCode('');
                  setTouched((prev) => ({ ...prev, authCode: false }));
                  setError('');
                }}
              >
                Изменить Telegram
              </button>
            </>
          )}
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
