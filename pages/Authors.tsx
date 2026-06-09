import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserType } from '../types';
import { db } from '../services/mockDb';

const Authors: React.FC = () => {
  const [rows, setRows] = useState<{ user: UserType; articleCount: number }[]>([]);

  useEffect(() => {
    setRows(db.getAuthorsLeaderboard());
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-north-900 mb-2">Авторы</h1>
      <p className="text-north-500 text-sm mb-8">Сортировка по количеству статей (по убыванию)</p>
      <ul className="bg-white rounded-xl border border-north-200 divide-y divide-north-100">
        {rows.map(({ user, articleCount }) => (
          <li key={user.id}>
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-north-50/80 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-north-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-north-500 truncate">@{user.telegramHandle}</p>
                </div>
              </div>
              <span className="text-sm text-north-600 tabular-nums shrink-0">{articleCount} статей</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Authors;
