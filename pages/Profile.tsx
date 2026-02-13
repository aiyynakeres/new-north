import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Camera, Image as ImageIcon, Loader2, Edit3, Save, X, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { Article as ArticleType, User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  currentUser: UserType | null;
};

const Profile: React.FC<Props> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [userArticles, setUserArticles] = useState<ArticleType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedBanner, setEditedBanner] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');
  const [editedTelegramHandle, setEditedTelegramHandle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);

  useEffect(() => {
    if (id) {
      const u = db.getUserById(id);
      if (u) {
        setUser(u);
        setUserArticles(db.getArticles().filter((a) => a.authorId === id));
        setEditedBio(u.bio);
        setEditedTags([...u.tags]);
        setEditedBanner(u.bannerUrl);
        setEditedAvatar(u.avatarUrl);
        setEditedTelegramHandle(u.telegramHandle);
      }
    }
  }, [id]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editedTags.includes(tagInput.trim())) {
        setEditedTags([...editedTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((t) => t !== tagToRemove));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAvatar(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (user) {
      const updatedUser = { 
        ...user, 
        bio: editedBio, 
        tags: editedTags, 
        bannerUrl: editedBanner,
        avatarUrl: editedAvatar,
        telegramHandle: editedTelegramHandle
      };
      db.saveUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedBio(user?.bio || '');
    setEditedTags(user?.tags || []);
    setEditedBanner(user?.bannerUrl || '');
    setEditedAvatar(user?.avatarUrl || '');
    setEditedTelegramHandle(user?.telegramHandle || '');
    setTagInput('');
    setIsEditing(false);
  };

  if (!user) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-north-400" /></div>;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="pb-20">
      <div className="h-64 w-full bg-north-200 relative overflow-hidden group">
        <img src={isEditing ? editedBanner : user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        {isEditing && (
          <div
            className={`absolute inset-0 border-2 border-dashed transition-colors ${
              isDragOver ? 'border-north-800 bg-north-50/50' : 'border-north-300'
            } flex items-center justify-center cursor-pointer`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('banner-upload')?.click()}
          >
            <div className="bg-black/50 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
              <Upload size={20} />
              <span>Drag or click to change</span>
            </div>
          </div>
        )}
        <input type="file" id="banner-upload" hidden accept="image/*" onChange={handleBannerFileSelect} />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-16 mb-6 flex justify-between items-end">
          <div
            className={`relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white ${
              isEditing ? 'cursor-pointer group' : ''
            }`}
            onDragOver={isEditing ? (e) => {
              e.preventDefault();
              setIsDragOverAvatar(true);
            } : undefined}
            onDragLeave={isEditing ? () => setIsDragOverAvatar(false) : undefined}
            onDrop={isEditing ? handleAvatarDrop : undefined}
            onClick={isEditing ? () => document.getElementById('avatar-upload')?.click() : undefined}
          >
            <img
              src={isEditing ? editedAvatar : user.avatarUrl}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <>
                <div className={`absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity ${isDragOverAvatar ? 'opacity-100 bg-black/50' : ''}`}>
                  <Upload className="text-white" size={24} />
                </div>
                <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleAvatarFileSelect} />
              </>
            )}
          </div>
          {isOwnProfile && (
            isEditing ? (
              <div className="flex gap-2 mb-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save size={16} /> Save
                </Button>
                <Button onClick={handleCancel} variant="secondary" className="flex items-center gap-2">
                  <X size={16} /> Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="secondary" className="mb-2 flex items-center gap-2">
                <Edit3 size={16} /> Edit Profile
              </Button>
            )
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-north-900 mb-2">{user.fullName}</h1>
          {isEditing && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-north-600 mb-1">Telegram</label>
              <input
                type="text"
                value={editedTelegramHandle}
                onChange={(e) => setEditedTelegramHandle(e.target.value)}
                className="w-full p-3 border border-north-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-north-400"
                placeholder="username"
              />
            </div>
          )}
          {!isEditing && (
            <p className="text-north-500 mb-4">@{user.telegramHandle}</p>
          )}
          {isEditing ? (
            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-north-600 mb-1">Обо мне</label>
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full p-3 border border-north-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-north-400"
                  rows={3}
                  placeholder="Enter your bio..."
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-north-600 mb-1">Интересы</label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                  {editedTags.map((tag) => (
                    <Tag key={tag} onRemove={() => removeTag(tag)}>
                      {tag}
                    </Tag>
                  ))}
                  {editedTags.length === 0 && <span className="text-sm text-north-400 italic">Еще не добавлен ни один тэг</span>}
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
            </div>
          ) : (
            <>
              <p className="text-north-500 mb-4">{user.bio}</p>
              <div className="flex gap-2 mb-4">
                {user.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-6 text-sm text-north-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Joined {new Date(user.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t border-north-200 pt-8">
          <h2 className="font-serif text-xl font-bold text-north-900 mb-6">Articles</h2>
          <div className="grid gap-6">
            {userArticles.map((article) => (
              <div key={article.id} className="flex gap-4 p-4 rounded-xl hover:bg-north-50 transition-colors border border-transparent hover:border-north-100">
                <div className="flex-1">
                  <Link to={`/article/${article.id}`}>
                    <h3 className="font-bold text-north-800 mb-1">{article.title}</h3>
                    <p className="text-sm text-north-600 line-clamp-2">{article.preview}</p>
                  </Link>
                  <div className="flex gap-4 mt-3 text-xs text-north-400">
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    <span>{article.views} views</span>
                  </div>
                </div>
                {article.preview && (
                  <div className="w-24 h-24 bg-north-100 rounded-lg shrink-0 overflow-hidden hidden sm:block">
                    <div className="w-full h-full flex items-center justify-center text-north-300">
                      <ImageIcon size={24} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {userArticles.length === 0 && <p className="text-north-400 italic">No articles published yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

