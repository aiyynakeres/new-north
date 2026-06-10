import { ArrowLeft, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import type { Community, User as UserType } from "../types";

const CommunityMembers: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [community, setCommunity] = useState<Community | null>(null);
	const [users, setUsers] = useState<UserType[]>([]);

	useEffect(() => {
		if (!id) return;
		(async () => {
			const [c, users] = await Promise.all([api.getCommunityById(id), api.getUsers()]);
			setCommunity(c ?? null);
			setUsers(users);
		})();
	}, [id]);

	if (!id || !community) {
		return (
			<div className="flex justify-center p-20">
				<Loader2 className="animate-spin text-north-400" />
			</div>
		);
	}

	const members = community.memberIds
		.map((uid) => users.find((u) => u.id === uid))
		.filter((u): u is UserType => !!u)
		.sort((a, b) => a.fullName.localeCompare(b.fullName, "ru"));

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<Link
				to={`/community/${community.id}`}
				className="inline-flex items-center text-north-500 hover:text-north-800 mb-6 transition-colors text-sm"
			>
				<ArrowLeft size={18} className="mr-2" /> Назад к сообществу
			</Link>
			<h1 className="font-serif text-2xl font-bold text-north-900 mb-1">
				Участники: {community.name}
			</h1>
			<p className="text-north-500 text-sm mb-6">Всего: {members.length}</p>
			<ul className="bg-white rounded-xl border border-north-200 divide-y divide-north-100">
				{members.map((u) => (
					<li key={u.id}>
						<Link
							to={`/profile/${u.id}`}
							className="flex items-center gap-3 px-4 py-3 hover:bg-north-50/80 transition-colors"
						>
							<img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
							<div className="min-w-0">
								<p className="font-medium text-north-900 truncate">{u.fullName}</p>
								<p className="text-xs text-north-500 truncate">@{u.telegramHandle}</p>
							</div>
							{community.creatorId === u.id && (
								<span className="ml-auto text-xs text-north-400 shrink-0">создатель</span>
							)}
							{community.adminIds.includes(u.id) && community.creatorId !== u.id && (
								<span className="ml-auto text-xs text-north-400 shrink-0">админ</span>
							)}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default CommunityMembers;
