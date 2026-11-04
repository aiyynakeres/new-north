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
	variant?: "default" | "feed";
	/** если false — без строки автора (например, свои статьи в профиле) */
	showAuthor?: boolean;
};

const getFeedDescription = (article: ArticleType) => {
	const preview = article.preview.trim().replace(/\s*\.{3,}\s*$/, "");
	const paragraphs =
		article.blocks
			?.filter((block) => block.type === "paragraph")
			.map((block) => block.content.trim())
			.filter(Boolean)
			.join(" ") ?? "";

	if (!paragraphs) return preview || article.content;
	if (!preview) return paragraphs;

	const normalizedPreview = preview.toLocaleLowerCase();
	const normalizedParagraphs = paragraphs.toLocaleLowerCase();
	if (
		normalizedParagraphs.includes(normalizedPreview) ||
		normalizedPreview.includes(normalizedParagraphs)
	) {
		return paragraphs.length >= preview.length ? paragraphs : preview;
	}

	return `${preview}. ${paragraphs}`;
};

const ArticleCard: React.FC<Props> = ({
	article,
	author,
	community,
	users,
	currentUser,
	onArticleUpdated,
	variant = "default",
	showAuthor = true,
}) => {
	const isFeed = variant === "feed";
	const primaryTopic = article.tags[0];
	const description = isFeed ? getFeedDescription(article) : article.preview;
	const feedMetadata = isFeed && (community || primaryTopic) && (
		<div className="flex min-w-0 flex-wrap items-center gap-1.5">
			{community && (
				<CommunityPostBadge
					communityId={community.id}
					name={community.name}
					imageUrl={community.coverUrl}
				/>
			)}
			{primaryTopic && (
				<span className="inline-flex min-h-8 items-center rounded-full border border-north-200 bg-north-50 px-3 py-1 text-xs font-medium text-north-600">
					{primaryTopic}
				</span>
			)}
		</div>
	);

	return (
		<article className="rounded-xl border border-north-200 bg-white p-5 transition-[border-color,box-shadow] duration-200 hover:border-north-300 hover:shadow-sm">
			{showAuthor && author && (
				<div className="mb-3 flex items-center gap-3">
					<Link
						to={`/profile/${author.id}`}
						className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-north-500 focus-visible:ring-offset-2"
					>
						<img
							src={author.avatarUrl}
							alt={author.fullName}
							width={40}
							height={40}
							loading="lazy"
							className="h-10 w-10 rounded-full object-cover"
						/>
					</Link>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<Link
								to={`/profile/${author.id}`}
								className="rounded font-medium text-north-900 hover:text-north-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-north-500"
							>
								{author.fullName}
							</Link>
							{feedMetadata}
						</div>
						<p className="mt-0.5 text-xs text-north-500">
							{new Date(article.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			)}
			{isFeed && (!showAuthor || !author) && feedMetadata && (
				<div className="mb-3">{feedMetadata}</div>
			)}
			<Link
				to={`/article/${article.id}`}
				className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-north-500 focus-visible:ring-offset-4"
			>
				<h2 className="mb-1.5 font-serif text-xl font-bold text-north-800 transition-colors hover:text-north-600 sm:text-2xl">
					{article.title}
				</h2>
				<p className={`leading-6 text-north-600 ${isFeed ? "line-clamp-2" : "mb-4"}`}>
					{description}
				</p>
			</Link>

			{!isFeed && (community || primaryTopic) && (
				<div className="mb-4 flex flex-wrap items-center gap-2">
					{community && <CommunityPostBadge communityId={community.id} name={community.name} />}
					{article.tags.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</div>
			)}

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<div className="min-w-0">
					<ArticleReactionsControl
						article={article}
						users={users}
						currentUser={isFeed ? null : currentUser}
						onUpdated={isFeed ? undefined : (updated) => onArticleUpdated?.(updated)}
						richHover={false}
					/>
				</div>
				<div className="ml-auto flex items-center gap-4 text-sm text-north-400">
					<span className="flex items-center gap-1">
						<span className="sr-only">Просмотры:</span>
						<Eye size={16} aria-hidden="true" /> {article.views}
					</span>
					<span className="flex items-center gap-1">
						<span className="sr-only">Комментарии:</span>
						<MessageSquare size={16} aria-hidden="true" /> {article.commentsCount}
					</span>
				</div>
			</div>
		</article>
	);
};

export default ArticleCard;
