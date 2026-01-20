import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      const u = db.getUserById(id);
      if (u) {
        setUser(u);
        setUserArticles(db.getArticles().filter((a) => a.authorId === id));
      }
    }
  }, [id]);

  if (!user) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-north-400" /></div>;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="pb-20">
      <div className="h-64 w-full bg-north-200 relative">
        <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        {isOwnProfile && (
          <button className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors">
            <Camera size={20} />
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-16 mb-6 flex justify-between items-end">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
          />
          {isOwnProfile && (
            <Button variant="secondary" className="mb-2">
              Edit Profile
            </Button>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-north-900 mb-2">{user.fullName}</h1>
          <p className="text-north-500 mb-4">{user.bio}</p>
          <div className="flex gap-2 mb-4">
            {user.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <div className="flex gap-6 text-sm text-north-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Joined {new Date(user.joinedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">@{user.telegramHandle}</span>
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

