import type React from "react";
import { Link } from "react-router-dom";

type Props = {
	communityId: string;
	name: string;
	imageUrl?: string;
};

/** Метка поста из клуба (без «#», визуально отличается от тегов темы) */
const CommunityPostBadge: React.FC<Props> = ({ communityId, name, imageUrl }) => (
	<Link
		to={`/community/${communityId}`}
		className={`inline-flex min-h-8 shrink-0 items-center rounded-full border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-north-500 focus-visible:ring-offset-2 ${
			imageUrl
				? "gap-2 border-sky-200 bg-sky-50 py-1 pl-1 pr-3 text-sky-800 hover:bg-sky-100"
				: "border-north-800 bg-north-900 px-2.5 py-1 text-white hover:bg-north-800"
		}`}
		title={`Пост в сообществе «${name}»`}
	>
		{imageUrl && (
			<img
				src={imageUrl}
				alt=""
				width={24}
				height={24}
				loading="lazy"
				className="h-6 w-6 rounded-full border border-white object-cover shadow-sm"
			/>
		)}
		{name}
	</Link>
);

export default CommunityPostBadge;
