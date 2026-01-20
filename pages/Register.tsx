import React, { useCallback, useState } from 'react';
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
  const navigate = useNavigate();

  const handleNext = () => setStep(2);

  const handleRegister = async () => {
    if (formData.bio.length < 100) {
      alert('Please write at least 100 characters about yourself.');
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
            {step === 1 ? 'Join the Club' : 'Complete Profile'}
          </h2>
          <p className="text-north-500">Step {step} of 2</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <Input
              label="Telegram Handle"
              placeholder="@username"
              value={formData.telegramHandle}
              onChange={(e: any) => setFormData({ ...formData, telegramHandle: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button className="w-full mt-6" onClick={handleNext}>
              Next Step
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
                    <span className="text-[10px] text-north-400 font-medium">Drop photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
                <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleFileSelect} />
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="Ivan Ivanov"
              value={formData.fullName}
              onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-north-600 mb-1">About Me</label>
              <textarea
                className={`w-full px-4 py-3 rounded-lg border ${
                  formData.bio.length > 0 && formData.bio.length < 100
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-north-200 focus:ring-north-400'
                } focus:outline-none focus:ring-2 bg-white transition-all text-north-800 placeholder-north-300 min-h-[120px]`}
                placeholder="Tell us about your experience, interests, and what drives you..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <div
                className={`text-xs text-right mt-1 ${formData.bio.length < 100 ? 'text-red-500' : 'text-north-400'}`}
              >
                {formData.bio.length} / 100 characters minimum
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-north-600 mb-1">Interests</label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                {formData.tags.map((tag) => (
                  <Tag key={tag} onRemove={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
                {formData.tags.length === 0 && <span className="text-sm text-north-400 italic">No tags added yet</span>}
              </div>
              <input
                className="w-full px-4 py-2 rounded-lg border border-north-200 focus:outline-none focus:ring-2 focus:ring-north-400 focus:border-transparent bg-white transition-all text-north-800 placeholder-north-300"
                placeholder="Type interest and press Enter"
                value={tagInput}
                onKeyDown={addTag}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <p className="text-xs text-north-400 mt-1">Press Enter to add a tag</p>
            </div>

            <Button className="w-full mt-8" onClick={handleRegister}>
              Finish Profile
            </Button>
            <button onClick={() => setStep(1)} className="w-full text-center text-sm text-north-500 mt-2 hover:underline">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;

