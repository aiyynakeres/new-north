import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  onLogin: (u: UserType) => void;
};

type FormField = 'telegramHandle' | 'email' | 'password' | 'fullName' | 'bio';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    telegramHandle: '',
    password: '',
    fullName: '',
    avatarUrl: '',
    bio: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [touched, setTouched] = useState<Record<FormField, boolean>>({
    telegramHandle: false,
    email: false,
    password: false,
    fullName: false,
    bio: false,
  });
  const navigate = useNavigate();

  const fieldErrors = useMemo(() => {
    const errors: Partial<Record<FormField, string>> = {};
    const telegram = formData.telegramHandle.trim();
    const email = formData.email.trim();
    const passwordLength = formData.password.trim().length;
    const fullName = formData.fullName.trim();
    const bioLength = formData.bio.trim().length;

    if (!telegram) {
      errors.telegramHandle = 'Telegram обязателен';
    }
    if (!email) {
      errors.email = 'Почта обязательна';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Неверный формат почты';
    }
    if (passwordLength === 0) {
      errors.password = 'Пароль обязателен';
    } else if (passwordLength < 8 || passwordLength > 64) {
      errors.password = 'Пароль должен быть от 8 до 64 символов';
    }
    if (!fullName) {
      errors.fullName = 'Имя и фамилия обязательны';
    }
    if (bioLength === 0) {
      errors.bio = 'Расскажи о себе';
    } else if (bioLength < 100) {
      errors.bio = 'Минимум 100 символов';
    }

    return errors;
  }, [formData]);

  const isValid = useMemo(() => {
    if (step === 1) {
      return (
        !fieldErrors.telegramHandle &&
        !fieldErrors.email &&
        !fieldErrors.password
      );
    }

    return !fieldErrors.fullName && !fieldErrors.bio;
  }, [fieldErrors, step]);

  const touchField = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const touchFieldsForStep = (currentStep: number) => {
    if (currentStep === 1) {
      setTouched((prev) => ({ ...prev, telegramHandle: true, email: true, password: true }));
      return;
    }
    setTouched((prev) => ({ ...prev, fullName: true, bio: true }));
  };

  const handleNext = () => {
    if (!isValid) {
      touchFieldsForStep(1);
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!isValid) {
      touchFieldsForStep(2);
      return;
    }

    const newUser: UserType = {
      id: `u${Date.now()}`,
      ...formData,
      bannerUrl: 'https://picsum.photos/1200/400?grayscale',
      joinedAt: new Date().toISOString(),
    };
    db.saveUser(newUser);
    db.setSession(newUser);
    onLogin(newUser);
    navigate('/');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-north-100 p-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-north-900 mb-2">
            {step === 1 ? 'Вступить в клуб' : 'Завершить профиль'}
          </h2>
          <p className="text-north-500">Шаг {step} из 2</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <Input
              label="Telegram"
              placeholder="username"
              required
              error={touched.telegramHandle ? fieldErrors.telegramHandle : undefined}
              onBlur={() => touchField('telegramHandle')}
              value={formData.telegramHandle}
              onChange={(e: any) => setFormData({ ...formData, telegramHandle: e.target.value })}
            />
            <Input
              label="Почта"
              type="email"
              placeholder="you@example.com"
              required
              error={touched.email ? fieldErrors.email : undefined}
              onBlur={() => touchField('email')}
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={64}
              error={touched.password ? fieldErrors.password : undefined}
              onBlur={() => touchField('password')}
              value={formData.password}
              onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button className="w-full mt-6" onClick={handleNext} disabled={!isValid}>
              Далее
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div
                className={`relative w-32 h-32 rounded-full border-2 ${
                  isDragOver ? 'border-north-800 bg-north-50' : 'border-dashed border-north-300'
                } flex items-center justify-center overflow-hidden cursor-pointer transition-colors group`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <Upload className="w-8 h-8 text-north-400 mx-auto mb-1 group-hover:text-north-600" />
                    <span className="text-[10px] text-north-400 font-medium">Добавить фото</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
                <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleFileSelect} />
              </div>
            </div>

            <Input
              label="Имя и фамилия"
              placeholder="Петр Петров"
              error={touched.fullName ? fieldErrors.fullName : undefined}
              onBlur={() => touchField('fullName')}
              value={formData.fullName}
              onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-north-600 mb-1">Обо мне</label>
              <textarea
                className={`w-full px-4 py-3 rounded-lg border ${
                  touched.bio && fieldErrors.bio
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-north-200 focus:ring-north-400'
                } focus:outline-none focus:ring-2 bg-white transition-all text-north-800 placeholder-north-300 min-h-[120px]`}
                placeholder="Tell us about your experience, interests, and what drives you..."
                value={formData.bio}
                onBlur={() => touchField('bio')}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <div
                className={`text-xs text-right mt-1 ${touched.bio && fieldErrors.bio ? 'text-red-500' : 'text-north-400'}`}
              >
                {formData.bio.length} / 100 символов минимум
              </div>
              {touched.bio && fieldErrors.bio && <p className="text-red-500 text-xs mt-1">{fieldErrors.bio}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-north-600 mb-1">Интересы</label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                {formData.tags.map((tag) => (
                  <Tag key={tag} onRemove={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
                {formData.tags.length === 0 && <span className="text-sm text-north-400 italic">Еще не добавлен ни один тэг</span>}
              </div>
              <input
                className="w-full px-4 py-2 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 focus:border-transparent bg-white transition-all text-north-800 placeholder-north-300"
                placeholder="Напиши интереc"
                value={tagInput}
                onKeyDown={addTag}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <p className="text-xs text-north-400 mt-1">Нажми на Enter для добавления тэга</p>
            </div>

            <Button className="w-full mt-8" onClick={handleRegister} disabled={!isValid}>
              Регистрация
            </Button>
            <button onClick={() => setStep(1)} className="w-full text-center text-sm text-north-500 mt-2 hover:underline">
              Назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
