import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Camera,
  Check,
  Coffee,
  HeartHandshake,
  Lightbulb,
  Link2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  onLogin: (u: UserType) => void;
};

type FormField = 'email' | 'password' | 'confirmPassword' | 'nickname' | 'fullName' | 'bio';

const COMMUNITY_OPTIONS = [
  { id: 'mentor', label: 'Могу менторить', icon: HeartHandshake },
  { id: 'coffee', label: 'Готов попить кофе', icon: Coffee },
  { id: 'startup', label: 'Могу помочь стартапу', icon: Lightbulb },
];

const Register: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    fullName: '',
    avatarUrl: '',
    country: '',
    city: '',
    shortBio: '',
    role: '',
    company: '',
    bio: '',
    tags: [] as string[],
    communityOffers: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [touched, setTouched] = useState<Record<FormField, boolean>>({
    email: false,
    password: false,
    confirmPassword: false,
    nickname: false,
    fullName: false,
    bio: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fieldErrors = useMemo(() => {
    const errors: Partial<Record<FormField, string>> = {};
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const nickname = formData.nickname.trim();
    const fullName = formData.fullName.trim();
    const bioLength = formData.bio.trim().length;

    if (!normalizedEmail) {
      errors.email = 'Почта обязательна';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = 'Введите корректный email';
    }

    if (!normalizedPassword) {
      errors.password = 'Пароль обязателен';
    } else if (normalizedPassword.length < 6) {
      errors.password = 'Пароль должен быть минимум 6 символов';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (normalizedPassword !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (!nickname) {
      errors.nickname = 'Никнейм обязателен';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      errors.nickname = 'Только латинские буквы, цифры, «-» и «_»';
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
  }, [email, password, confirmPassword, formData]);

  const isStepOneValid = useMemo(
    () => !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword,
    [fieldErrors.email, fieldErrors.password, fieldErrors.confirmPassword]
  );

  const isStepTwoValid = useMemo(
    () => !fieldErrors.nickname && !fieldErrors.fullName && !fieldErrors.bio,
    [fieldErrors.nickname, fieldErrors.fullName, fieldErrors.bio]
  );

  const touchField = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleNextStep = () => {
    if (!isStepOneValid) {
      setTouched({ email: true, password: true, confirmPassword: true, nickname: false, fullName: false, bio: false });
      return;
    }

    setError('');
    if (db.getUserByEmail(email.trim())) {
      setError('Пользователь с такой почтой уже существует');
      return;
    }

    setStep(2);
  };

  const handleRegister = async () => {
    if (!isStepTwoValid) {
      setTouched({ email: false, password: false, confirmPassword: false, nickname: true, fullName: true, bio: true });
      return;
    }

    setError('');
    const nicknameTaken = db.getUsers().some(
      (user) => user.nickname?.toLowerCase() === formData.nickname.trim().toLowerCase()
    );
    if (nicknameTaken) {
      setTouched((prev) => ({ ...prev, nickname: true }));
      setError('Этот никнейм уже занят. Попробуйте другой.');
      return;
    }

    const newUser: UserType = {
      id: `u${Date.now()}`,
      email: email.trim(),
      password: password.trim(),
      telegramHandle: '',
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

  const toggleCommunityOffer = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      communityOffers: prev.communityOffers.includes(option)
        ? prev.communityOffers.filter((item) => item !== option)
        : [...prev.communityOffers, option],
    }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className={`w-full ${step === 1 ? 'max-w-md' : 'max-w-3xl'} bg-white rounded-2xl shadow-xl border border-north-100 p-6 sm:p-8 md:p-10 transition-all`}>
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-north-900 mb-2">
            {step === 1 ? 'Создать аккаунт' : 'Завершить профиль'}
          </h2>
          <p className="text-north-500">Шаг {step} из 2</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {step === 1 ? (
          <div className="space-y-4">
            <Input
              label="Почта"
              type="email"
              placeholder="your@email.com"
              required
              error={touched.email ? fieldErrors.email : undefined}
              onBlur={() => touchField('email')}
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              required
              error={touched.password ? fieldErrors.password : undefined}
              onBlur={() => touchField('password')}
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
            <Input
              label="Подтвердить пароль"
              type="password"
              placeholder="••••••••"
              required
              error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
              onBlur={() => touchField('confirmPassword')}
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
            />
            <Button className="w-full mt-6" onClick={handleNextStep} disabled={!isStepOneValid}>
              Продолжить
            </Button>
            <div className="text-center text-sm">
              <span className="text-north-500">Уже есть аккаунт? </span>
              <Link to="/login" className="text-north-600 font-medium hover:text-north-900">
                Войти
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex items-start gap-3 text-emerald-900">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Указывайте только проверенную информацию</p>
                <p className="text-xs sm:text-sm text-emerald-800/80 mt-1 leading-relaxed">
                  Честный профиль помогает участникам доверять друг другу и быстрее находить точки пересечения. Всё необязательное можно дополнить позже.
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-north-100 bg-north-50/60 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-white border border-north-100 flex items-center justify-center text-north-600">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-north-900">Основное</h3>
                  <p className="text-xs text-north-500">Так вы будете выглядеть в клубе</p>
                </div>
              </div>

              <div className="grid md:grid-cols-[144px_1fr] gap-6 items-start">
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="avatar-upload"
                    className={`relative w-32 h-32 rounded-full border-2 ${
                      isDragOver ? 'border-north-800 bg-white' : 'border-dashed border-north-300 bg-white'
                    } flex items-center justify-center overflow-hidden cursor-pointer transition-colors group`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Предпросмотр фотографии профиля" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="w-8 h-8 text-north-400 mx-auto mb-1 group-hover:text-north-600" />
                        <span className="text-xs text-north-500 font-medium">Добавить фото</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  </label>
                  <input className="sr-only" type="file" id="avatar-upload" accept="image/*" onChange={handleFileSelect} />
                  <p className="text-[11px] text-center text-north-400 mt-2">JPG или PNG</p>
                </div>

                <div className="space-y-4 min-w-0">
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-north-700 mb-1.5">
                      Никнейм <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex rounded-lg border bg-white overflow-hidden focus-within:ring-2 ${
                      touched.nickname && fieldErrors.nickname ? 'border-red-300 focus-within:ring-red-200' : 'border-north-200 focus-within:ring-north-400'
                    }`}>
                      <span className="px-3 flex items-center text-xs text-north-400 bg-north-50 border-r border-north-200 whitespace-nowrap">new-north.ru/</span>
                      <input
                        id="nickname"
                        className="min-w-0 w-full px-3 py-2.5 bg-white text-north-800 placeholder-north-300 focus:outline-none"
                        placeholder="nickname"
                        value={formData.nickname}
                        onBlur={() => touchField('nickname')}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value.toLowerCase() })}
                        aria-invalid={Boolean(touched.nickname && fieldErrors.nickname)}
                      />
                    </div>
                    {touched.nickname && fieldErrors.nickname ? (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.nickname}</p>
                    ) : (
                      <p className="text-xs text-north-400 mt-1">Используется как URL вашей страницы</p>
                    )}
                  </div>
                  <Input
                    label="Как вас зовут *"
                    placeholder="Имя и фамилия"
                    error={touched.fullName ? fieldErrors.fullName : undefined}
                    onBlur={() => touchField('fullName')}
                    value={formData.fullName}
                    onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <p className="text-xs text-north-400 -mt-4">Укажите настоящее имя и фамилию</p>
                  <div>
                    <label className="block text-sm font-medium text-north-700 mb-1.5">
                      Страна и город <span className="text-xs font-normal text-north-400 ml-1">Необязательно</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-north-400" aria-hidden="true" />
                        <input className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 bg-white" placeholder="Страна" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                      </div>
                      <input className="w-full px-3 py-2.5 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 bg-white" placeholder="Город" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link2 size={17} className="text-north-500" aria-hidden="true" />
                  <label htmlFor="short-bio" className="text-sm font-medium text-north-700">Краткое био</label>
                  <span className="text-xs text-north-400">Необязательно</span>
                </div>
                <textarea
                  id="short-bio"
                  maxLength={320}
                  className="w-full px-4 py-3 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 bg-white text-north-800 placeholder-north-300 min-h-[110px]"
                  placeholder="Расскажите немного о себе и добавьте ссылки на Telegram, блог, Instagram или другие соцсети"
                  value={formData.shortBio}
                  onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                />
                <div className="flex justify-between text-xs text-north-400 mt-1"><span>Ссылки будут видны в профиле</span><span>{formData.shortBio.length}/320</span></div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseBusiness size={17} className="text-north-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-north-700">Чем занимаетесь?</span>
                  <span className="text-xs text-north-400">Необязательно</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="w-full px-4 py-2.5 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 bg-white" placeholder="Должность или что вы делаете" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                  <input className="w-full px-4 py-2.5 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 bg-white" placeholder="Компания" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
              </div>

              <div className="w-full">
                <label htmlFor="club-story" className="block text-sm font-medium text-north-700 mb-1">Расскажите клубу о себе <span className="text-red-500">*</span></label>
                <p className="text-xs text-north-400 mb-2">Чем вы занимаетесь и где сейчас работаете? О чём мечтаете? Что ищете в клубе?</p>
                <textarea
                  id="club-story"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.bio && fieldErrors.bio ? 'border-red-300 focus:ring-red-200' : 'border-north-200 focus:ring-north-400'
                  } focus:outline-none focus:ring-2 bg-white transition-all text-north-800 placeholder-north-300 min-h-[150px]`}
                  placeholder="Напишите так, как рассказали бы о себе за чашкой кофе…"
                  value={formData.bio}
                  onBlur={() => touchField('bio')}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <div className={`text-xs text-right mt-1 ${touched.bio && fieldErrors.bio ? 'text-red-500' : 'text-north-400'}`}>{formData.bio.length} / 100 символов минимум</div>
                {touched.bio && fieldErrors.bio && <p className="text-red-500 text-xs mt-1">{fieldErrors.bio}</p>}
              </div>
            </section>

            <div className="w-full">
              <label className="block text-sm font-medium text-north-700 mb-1">Интересы <span className="text-xs font-normal text-north-400 ml-1">Необязательно</span></label>
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

            <fieldset>
              <legend className="block text-sm font-medium text-north-700 mb-1">Для клуба и людей я… <span className="text-xs font-normal text-north-400 ml-1">Можно выбрать несколько</span></legend>
              <p className="text-xs text-north-400 mb-3">Что другие участники могут смело предложить вам?</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {COMMUNITY_OPTIONS.map(({ id, label, icon: Icon }) => {
                  const selected = formData.communityOffers.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCommunityOffer(id)}
                      className={`relative min-h-[72px] rounded-xl border px-3 py-3 text-left transition-all ${
                        selected ? 'border-north-700 bg-north-800 text-white shadow-sm' : 'border-north-200 bg-white text-north-600 hover:border-north-400 hover:bg-north-50'
                      }`}
                    >
                      <Icon size={19} className="mb-2" aria-hidden="true" />
                      <span className="text-xs font-medium leading-snug block pr-4">{label}</span>
                      {selected && <Check size={16} className="absolute top-3 right-3" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button className="w-full mt-8 min-h-[52px] text-base" onClick={handleRegister} disabled={!isStepTwoValid}>
              Завершить регистрацию
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
