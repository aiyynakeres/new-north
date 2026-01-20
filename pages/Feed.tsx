import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare } from 'lucide-react';
import Tag from '../components/ui/Tag';
import { Article as ArticleType, User as UserType } from '../types';
import { db } from '../services/mockDb';

const Feed: React.FC = () => {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    setArticles(db.getArticles());
    setUsers(db.getUsers());
  }, []);

  const getAuthor = (id: string) => users.find((u) => u.id === id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-north-900 mb-8">Fresh Perspectives</h1>
      <div className="space-y-8">
        {articles.map((article) => {
          const author = getAuthor(article.authorId);
          return (
            <div key={article.id} className="bg-white rounded-xl border border-north-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                {author && (
                  <Link to={`/profile/${author.id}`} className="flex items-center gap-3">
                    <img src={author.avatarUrl} alt={author.fullName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-north-900">{author.fullName}</p>
                      <p className="text-xs text-north-500">{new Date(article.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                )}
              </div>
              <Link to={`/article/${article.id}`}>
                <h2 className="font-serif text-2xl font-bold text-north-800 mb-2 hover:text-north-600 transition-colors">{article.title}</h2>
                <p className="text-north-600 leading-relaxed mb-4">{article.preview}</p>
              </Link>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {article.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-north-400 text-sm">
                  <span className="flex items-center gap-1">
                    <Eye size={16} /> {article.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={16} /> {article.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feed;

