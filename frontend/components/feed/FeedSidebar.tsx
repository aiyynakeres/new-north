import { ChevronRight, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import type { Community, User } from "../../types";

const TOP_LIMIT = 5;

const FeedSidebar: React.FC = () => {
	const [topAuthors, setTopAuthors] = useState<{ user: User; articleCount: number }[]>([]);
	const [topCommunities, setTopCommunities] = useState<Community[]>([]);

	useEffect(() => {
		(async () => {
			const [authors, comms] = await Promise.all([
				api.getAuthorsLeaderboard(),
				api.getCommunitiesByMemberCount(),
			]);
			setTopAuthors(authors.slice(0, TOP_LIMIT));
			setTopCommunities(comms.slice(0, TOP_LIMIT));
		})();
	}, []);

	return (
		<aside className="w-full md:w-[300px] md:shrink-0 space-y-6 md:sticky md:top-20 md:self-start">
			<section className="bg-white rounded-xl border border-north-200 p-5 shadow-sm">
				<h2 className="font-serif font-bold text-lg text-north-900 mb-2">Что такое блог?</h2>
				<p className="text-sm text-north-600 leading-relaxed">
					New-North — это информационный блог про республику.
				</p>
			</section>

			<section className="bg-white rounded-xl border border-north-200 p-5 shadow-sm">
				<div className="flex items-center justify-between mb-3">
					<h2 className="font-serif font-bold text-lg text-north-900">Топ пользователей</h2>
					<Link
						to="/authors"
						className="text-xs text-north-500 hover:text-north-800 flex items-center gap-0.5"
					>
						Все <ChevronRight size={14} />
					</Link>
				</div>
				<ul className="space-y-3">
					{topAuthors.map(({ user, articleCount }) => (
						<li key={user.id}>
							<Link
								to={`/profile/${user.id}`}
								className="flex items-center justify-between gap-2 group"
							>
								<span className="text-sm font-medium text-north-800 truncate group-hover:text-north-600">
									@{user.telegramHandle}
								</span>
								<span className="text-xs text-north-400 shrink-0 tabular-nums">{articleCount}</span>
							</Link>
						</li>
					))}
				</ul>
			</section>

			<section className="bg-white rounded-xl border border-north-200 p-5 shadow-sm">
				<div className="flex items-center justify-between mb-3">
					<h2 className="font-serif font-bold text-lg text-north-900 flex items-center gap-2">
						<Users size={18} className="text-north-500" />
						Топ сообществ
					</h2>
					<Link
						to="/communities"
						className="text-xs text-north-500 hover:text-north-800 flex items-center gap-0.5"
					>
						Все <ChevronRight size={14} />
					</Link>
				</div>
				<ul className="space-y-3">
					{topCommunities.map((c) => (
						<li key={c.id}>
							<Link
								to={`/community/${c.id}`}
								className="flex items-center justify-between gap-2 group"
							>
								<span className="text-sm font-medium text-north-800 truncate group-hover:text-north-600">
									{c.name}
								</span>
								<span className="text-xs text-north-400 shrink-0 tabular-nums">
									{c.memberIds.length}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</aside>
	);
};

export default FeedSidebar;
