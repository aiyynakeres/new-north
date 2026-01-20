import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserType } from '../types';
import { db } from '../services/mockDb';

const People: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-north-900 mb-8">Community</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className="bg-white p-6 rounded-xl border border-north-200 hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <img src={user.avatarUrl} alt={user.fullName} className="w-20 h-20 rounded-full mb-4 object-cover" />
            <h3 className="font-bold text-north-800">{user.fullName}</h3>
            <p className="text-xs text-north-500 mb-3">@{user.telegramHandle}</p>
            <p className="text-sm text-north-600 line-clamp-2 mb-4 h-10">{user.bio}</p>
            <div className="flex flex-wrap justify-center gap-1">
              {user.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-north-50 px-2 py-1 rounded-full text-north-500">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default People;

