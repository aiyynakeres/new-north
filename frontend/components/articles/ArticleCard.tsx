import { Eye, MessageSquare } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import type { Article as ArticleType, Community, User as UserType } from "../../types";
import CommunityPostBadge from "../ui/CommunityPostBadge";
import Tag from "../ui/Tag";
import ArticleReactionsControl from "./ArticleReactionsControl";

type Props = {
	article: ArticleType;
	author?: UserType;
	community?: Community;
	users: UserType[];
	currentUser: UserType | null;
	onArticleUpdated?: (article: ArticleType) => void;
	/** если false — без строки автора (например, свои статьи в профиле) */
	showAuthor?: boolean;
};

const ArticleCard: React.FC<Props> = ({
	article,
	author,
	community,
	users,
	currentUser,
	onArticleUpdated,
	showAuthor = true,
}) => {
	return (
		<div className="bg-white rounded-xl border border-north-200 p-6 hover:shadow-md transition-shadow">
			{showAuthor && author && (
				<div className="flex items-center gap-3 mb-4">
					<Link to={`/profile/${author.id}`} className="flex items-center gap-3">
						<img
							src={author.avatarUrl}
							alt={author.fullName}
							className="w-10 h-10 rounded-full object-cover"
						/>
						<div>
							<p className="font-medium text-north-900">{author.fullName}</p>
							<p className="text-xs text-north-500">
								{new Date(article.createdAt).toLocaleDateString()}
							</p>
						</div>
					</Link>
				</div>
			)}
			<Link to={`/article/${article.id}`}>
				<h2 className="font-serif text-2xl font-bold text-north-800 mb-2 hover:text-north-600 transition-colors">
					{article.title}
				</h2>
				<p className="text-north-600 leading-relaxed mb-4">{article.preview}</p>
			</Link>

			<div className="flex flex-wrap items-center gap-2 mb-3">
				{community && <CommunityPostBadge communityId={community.id} name={community.name} />}
				{article.tags.map((tag) => (
					<Tag key={tag}>{tag}</Tag>
				))}
			</div>

			<div className="mb-4">
				<ArticleReactionsControl
					article={article}
					users={users}
					currentUser={currentUser}
					onUpdated={(a) => onArticleUpdated?.(a)}
					richHover={false}
				/>
			</div>

			<div className="flex items-center justify-end gap-4 text-north-400 text-sm pt-1 border-t border-north-100">
				<span className="flex items-center gap-1">
					<Eye size={16} /> {article.views}
				</span>
				<span className="flex items-center gap-1">
					<MessageSquare size={16} /> {article.commentsCount}
				</span>
			</div>
		</div>
	);
};

export default ArticleCard;
