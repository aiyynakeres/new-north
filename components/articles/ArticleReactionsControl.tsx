import React, { useMemo, useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Article as ArticleType, User as UserType } from '../../types';
import { db } from '../../services/mockDb';
import { groupReactionsByEmoji, userHasReaction } from '../../utils/reactions';

export const QUICK_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '👏', '🙏'];
export const MORE_EMOJIS = ['💯', '✨', '🥰', '😍', '🤔', '🎉', '💪', '🙌', '✅', '👀', '💜', '🧡', '🤝', '☀️', '🌟'];

type Props = {
  article: ArticleType;
  users: UserType[];
  currentUser: UserType | null;
  onUpdated?: (a: ArticleType) => void;
  /** hover-подсказка с именами: native title или всплывающий блок */
  richHover?: boolean;
};

const ArticleReactionsControl: React.FC<Props> = ({ article, users, currentUser, onUpdated, richHover }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const grouped = useMemo(() => groupReactionsByEmoji(article.reactions), [article.reactions]);
  const nameFor = (userId: string) => users.find((u) => u.id === userId)?.fullName || userId;

  const handleEmoji = (emoji: string) => {
    if (!currentUser || !onUpdated) return;
    const updated = db.toggleArticleReaction(article.id, currentUser.id, emoji);
    if (updated) onUpdated(updated);
  };

  if (!currentUser && grouped.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {grouped.map(({ emoji, userIds }) => {
        const names = userIds.map(nameFor).join(', ');
        if (richHover) {
          return (
            <span key={emoji} className="group relative inline-flex" title={names ? `${emoji}: ${names}` : undefined}>
              <span className="inline-flex cursor-default items-center gap-1 rounded-full border border-north-200 bg-north-50 px-2.5 py-1 text-sm text-north-800">
                <span className="leading-none">{emoji}</span>
                <span className="text-xs font-medium text-north-500">{userIds.length}</span>
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden min-w-[140px] max-w-xs -translate-x-1/2 rounded-lg border border-north-200 bg-white px-3 py-2 text-xs text-north-700 shadow-lg group-hover:block">
                <span className="font-medium text-north-500">{emoji}</span>
                <br />
                {names}
              </span>
            </span>
          );
        }
        return (
          <span
            key={emoji}
            title={names ? `${emoji}: ${names}` : emoji}
            className="inline-flex cursor-default items-center gap-1 rounded-full border border-north-200 bg-north-50 px-2.5 py-1 text-sm text-north-800"
          >
            <span className="leading-none">{emoji}</span>
            <span className="text-xs font-medium text-north-500">{userIds.length}</span>
          </span>
        );
      })}
      {currentUser && onUpdated && (
        <div className="flex flex-wrap items-center gap-1 border-l border-north-200 pl-2">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              title={userHasReaction(article.reactions, currentUser.id, e) ? 'Убрать реакцию' : `Отреагировать ${e}`}
              onClick={() => handleEmoji(e)}
              className={`rounded-lg px-1.5 py-1 text-xl leading-none transition-colors hover:bg-north-100 ${
                userHasReaction(article.reactions, currentUser.id, e) ? 'ring-2 ring-north-400 bg-north-100' : ''
              }`}
            >
              {e}
            </button>
          ))}
          <div className="relative">
            <button
              type="button"
              title="Ещё реакции"
              onClick={() => setMoreOpen((o) => !o)}
              className="rounded-lg p-1.5 text-north-500 hover:bg-north-100 hover:text-north-800"
            >
              <SmilePlus size={20} />
            </button>
            {moreOpen && (
              <>
                <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Закрыть" onClick={() => setMoreOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 flex max-w-[260px] flex-wrap gap-1 rounded-xl border border-north-200 bg-white p-2 shadow-lg">
                  {MORE_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        handleEmoji(e);
                        setMoreOpen(false);
                      }}
                      className={`rounded-lg px-2 py-1 text-xl leading-none hover:bg-north-50 ${
                        userHasReaction(article.reactions, currentUser.id, e) ? 'bg-north-100 ring-1 ring-north-300' : ''
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleReactionsControl;
