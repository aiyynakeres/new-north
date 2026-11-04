import type React from "react";
import { useEffect, useState } from "react";
import ArticleCard from "../components/articles/ArticleCard";
import FeedSidebar from "../components/feed/FeedSidebar";
import InfiniteScrollSentinel from "../components/ui/InfiniteScrollSentinel";
import { useInfiniteArticles } from "../hooks/useInfiniteArticles";
import { api } from "../services/api";
import type { Community, User as UserType } from "../types";

type Props = {
	currentUser: UserType | null;
};

const Feed: React.FC<Props> = ({ currentUser }) => {
	const [users, setUsers] = useState<UserType[]>([]);
	const [communities, setCommunities] = useState<Community[]>([]);
	const { articles, hasMore, loading, loadMore } = useInfiniteArticles("feed", api.getFeed);

	useEffect(() => {
		(async () => {
			const [u, c] = await Promise.all([api.getUsers(), api.getCommunities()]);
			setUsers(u ?? []);
			setCommunities(c ?? []);
		})();
	}, []);

	const getAuthor = (id: string) => users.find((u) => u.id === id);
	const getCommunity = (cid?: string) => (cid ? communities.find((c) => c.id === cid) : undefined);

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
				<main className="min-w-0 w-full flex-1 space-y-4">
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
								variant="feed"
							/>
						);
					})}
					{!loading && articles.length === 0 && (
						<p className="text-north-400 italic">Пока нет публикаций.</p>
					)}
					<InfiniteScrollSentinel hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
				</main>
				<FeedSidebar communities={communities} />
			</div>
		</div>
	);
};

export default Feed;
