import React, { useEffect, useState } from 'react';
import FeedSidebar from '../components/feed/FeedSidebar';
import ArticleCard from '../components/articles/ArticleCard';
import { Article as ArticleType, User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  currentUser: UserType | null;
};

const Feed: React.FC<Props> = ({ currentUser }) => {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const list = db.getArticles().slice();
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setArticles(list);
    setUsers(db.getUsers());
  }, []);

  const getAuthor = (id: string) => users.find((u) => u.id === id);
  const getCommunity = (cid?: string) => (cid ? db.getCommunityById(cid) : undefined);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
        <main className="min-w-0 flex-1 w-full space-y-6">
          {articles.map((article) => {
            const author = getAuthor(article.authorId);
            const comm = getCommunity(article.communityId);
            return (
              <ArticleCard
                key={article.id}
                article={article}
                author={author}
                community={comm}
                users={users}
                currentUser={currentUser}
                onArticleUpdated={(a) => setArticles((prev) => prev.map((x) => (x.id === a.id ? a : x)))}
              />
            );
          })}
        </main>
        <FeedSidebar />
      </div>
    </div>
  );
};

export default Feed;
