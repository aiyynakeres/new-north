import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  communityId: string;
  name: string;
};

/** Метка поста из клуба (без «#», визуально отличается от тегов темы) */
const CommunityPostBadge: React.FC<Props> = ({ communityId, name }) => (
  <Link
    to={`/community/${communityId}`}
    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-north-900 text-white border border-north-800 hover:bg-north-800 transition-colors shrink-0"
    title={`Пост в сообществе «${name}»`}
  >
    {name}
  </Link>
);

export default CommunityPostBadge;
