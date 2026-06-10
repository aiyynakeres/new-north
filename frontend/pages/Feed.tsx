import type React from "react";
import { useEffect, useState } from "react";
import ArticleCard from "../components/articles/ArticleCard";
import FeedSidebar from "../components/feed/FeedSidebar";
import { api } from "../services/api";
import type { Article as ArticleType, Community, User as UserType } from "../types";

type Props = {
	currentUser: UserType | null;
};

const Feed: React.FC<Props> = ({ currentUser }) => {
	const [articles, setArticles] = useState<ArticleType[]>([]);
	const [users, setUsers] = useState<UserType[]>([]);
	const [communities, setCommunities] = useState<Community[]>([]);

	useEffect(() => {
		(async () => {
			const list = await api.getArticles();
			list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
			setArticles(list);
			const [u, c] = await Promise.all([api.getUsers(), api.getCommunities()]);
			setUsers(u);
			setCommunities(c);
		})();
	}, []);

	const getAuthor = (id: string) => users.find((u) => u.id === id);
	const getCommunity = (cid?: string) => (cid ? communities.find((c) => c.id === cid) : undefined);

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
								onArticleUpdated={(a) =>
									setArticles((prev) => prev.map((x) => (x.id === a.id ? a : x)))
								}
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
