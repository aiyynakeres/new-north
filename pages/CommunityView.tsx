import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, PenTool, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { Article as ArticleType, Community, User as UserType } from '../types';
import { db } from '../services/mockDb';

type Props = {
  currentUser: UserType | null;
};

const CommunityView: React.FC<Props> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [msg, setMsg] = useState('');

  const refresh = () => {
    if (!id) return;
    const c = db.getCommunityById(id);
    setCommunity(c || null);
    setArticles(db.getArticlesByCommunityId(id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
    setUsers(db.getUsers());
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const adminNicknames = useMemo(() => {
    if (!community) return [];
    const getUser = (uid: string) => users.find((u) => u.id === uid);
    const seen = new Set<string>();
    const handles: string[] = [];
    const ordered = [community.creatorId, ...community.adminIds.filter((aid) => aid !== community.creatorId)];
    for (const aid of ordered) {
      if (seen.has(aid)) continue;
      seen.add(aid);
      if (!community.adminIds.includes(aid) && aid !== community.creatorId) continue;
      const u = getUser(aid);
      if (u) handles.push(`@${u.telegramHandle}`);
    }
    return handles;
  }, [community, users]);

  const handleJoin = () => {
    if (!currentUser || !community) return;
    setMsg('');
    const r = db.joinCommunity(community.id, currentUser.id);
    if (!r.ok && r.error === 'blocked') setMsg('Вам закрыт доступ к этому сообществу.');
    refresh();
  };

  const handleLeave = () => {
    if (!currentUser || !community) return;
    setMsg('');
    const r = db.leaveCommunity(community.id, currentUser.id);
    if (!r.ok && r.error === 'creator_cannot_leave') {
      setMsg('Создатель не может покинуть сообщество (передайте права или удалите группу в будущей версии).');
    }
    refresh();
  };

  const handlePromote = (targetId: string) => {
    if (!currentUser || !community) return;
    db.promoteCommunityAdmin(community.id, currentUser.id, targetId);
    refresh();
  };

  const handleBlock = (targetId: string) => {
    if (!currentUser || !community) return;
    const r = db.blockUserFromCommunity(community.id, currentUser.id, targetId);
    if (!r.ok && r.error === 'cannot_block_creator') setMsg('Нельзя заблокировать создателя.');
    refresh();
  };

  const handleJoinClick = () => {
    if (!community) return;
    if (!currentUser) {
      navigate('/login', { state: { from: `/community/${community.id}` } });
      return;
    }
    handleJoin();
  };

  if (!id || !community) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-north-400" />
      </div>
    );
  }

  const isMember = currentUser ? community.memberIds.includes(currentUser.id) : false;
  const isCreator = currentUser?.id === community.creatorId;
  const isAdmin = currentUser ? community.adminIds.includes(currentUser.id) : false;
  const isModerator = isCreator || isAdmin;

  const getUser = (uid: string) => users.find((u) => u.id === uid);

  return (
    <div className="pb-16">
      <div className="h-48 w-full bg-north-200 relative">
        <img src={community.coverUrl} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative">
        <div className="bg-white rounded-xl border border-north-200 p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-north-900">{community.name}</h1>
          <p className="text-north-600 mt-4 text-sm leading-relaxed">{community.description}</p>
          {adminNicknames.length > 0 && (
            <p className="text-sm text-north-500 mt-4">
              Админы: <span className="text-north-800">{adminNicknames.join(', ')}</span>
            </p>
          )}
          <div className="mt-5">
            <Link
              to={`/community/${community.id}/members`}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-north-300 bg-white px-5 text-north-800 shadow-sm hover:border-north-400 hover:bg-north-50/80 transition-all"
              title="Список участников"
            >
              <Users size={20} strokeWidth={2} className="text-north-500" />
              <span className="text-lg font-bold tabular-nums leading-none text-north-900">{community.memberIds.length}</span>
            </Link>
          </div>

          {msg && <p className="text-sm text-red-600 mt-3">{msg}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            {!isMember && <Button onClick={handleJoinClick}>Подписаться</Button>}
            {currentUser && isMember && !isCreator && (
              <Button variant="secondary" onClick={handleLeave}>
                Отписаться
              </Button>
            )}
          </div>
        </div>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-north-900">Посты сообщества</h2>
            {!currentUser && (
              <Button type="button" onClick={() => navigate('/login', { state: { from: `/write?community=${community.id}` } })}>
                <PenTool size={16} /> Написать пост
              </Button>
            )}
            {currentUser && isMember && (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/write?community=${community.id}`)}
              >
                <PenTool size={16} /> Написать пост
              </Button>
            )}
            {currentUser && !isMember && (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  setMsg('Подпишитесь на сообщество, чтобы публиковать посты.');
                }}
              >
                <PenTool size={16} /> Написать пост
              </Button>
            )}
          </div>
          <ul className="space-y-3">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/article/${a.id}`}
                  className="block bg-white rounded-lg border border-north-200 px-4 py-3 hover:border-north-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-north-900 text-white">
                      {community.name}
                    </span>
                  </div>
                  <span className="font-medium text-north-800">{a.title}</span>
                  <span className="text-xs text-north-400 ml-2">{new Date(a.createdAt).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
            {articles.length === 0 && <p className="text-north-400 text-sm italic">Пока нет постов в этом сообществе.</p>}
          </ul>
        </section>

        {isModerator && (
          <section className="mt-10 bg-white rounded-xl border border-north-200 p-6">
            <h2 className="font-serif text-lg font-bold text-north-900 mb-2">Участники и модерация</h2>
            <p className="text-sm text-north-500 mb-4">
              Создатель может назначать админов. Админы и создатель могут редактировать посты в сообществе и блокировать
              участников (кроме создателя).
            </p>
            <ul className="space-y-3">
              {community.memberIds.map((uid) => {
                const u = getUser(uid);
                if (!u) return null;
                const admin = community.adminIds.includes(uid);
                return (
                  <li key={uid} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-north-100 pb-2">
                    <div>
                      <Link to={`/profile/${uid}`} className="font-medium text-north-800 hover:underline">
                        @{u.telegramHandle}
                      </Link>
                      {uid === community.creatorId && (
                        <span className="ml-2 text-xs text-north-400">создатель</span>
                      )}
                      {admin && uid !== community.creatorId && (
                        <span className="ml-2 text-xs text-north-400">админ</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isCreator && uid !== community.creatorId && !admin && (
                        <button type="button" className="text-xs text-north-600 hover:underline" onClick={() => handlePromote(uid)}>
                          Сделать админом
                        </button>
                      )}
                      {isModerator && uid !== community.creatorId && (
                        <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => handleBlock(uid)}>
                          Заблокировать
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default CommunityView;
