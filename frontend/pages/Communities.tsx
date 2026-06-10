import { Users, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { api } from "../services/api";
import type { Community, User as UserType } from "../types";

type Props = {
	currentUser: UserType | null;
};

const Communities: React.FC<Props> = ({ currentUser }) => {
	const navigate = useNavigate();
	const [list, setList] = useState<Community[]>([]);
	const [createOpen, setCreateOpen] = useState(false);
	const [name, setName] = useState("");
	const [aboutShort, setAboutShort] = useState("");
	const [description, setDescription] = useState("");

	const refresh = async () => {
		setList(await api.getCommunitiesByMemberCount());
	};

	useEffect(() => {
		(async () => setList(await api.getCommunitiesByMemberCount()))();
	}, []);

	const openCreate = () => {
		if (!currentUser) {
			navigate("/login", { state: { from: "/communities" } });
			return;
		}
		setCreateOpen(true);
	};

	const closeCreate = () => {
		setCreateOpen(false);
		setName("");
		setAboutShort("");
		setDescription("");
	};

	const handleCreate = async () => {
		if (!currentUser) return;
		const n = name.trim();
		const short = aboutShort.trim();
		const desc = description.trim();
		if (!n || !short || !desc) return;
		const created = await api.createCommunity(
			{ name: n, aboutShort: short, description: desc },
			currentUser,
		);
		await refresh();
		closeCreate();
		navigate(`/community/${created.id}`);
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="font-serif text-3xl font-bold text-north-900 mb-2">Сообщества</h1>
					<p className="text-north-600 text-sm leading-relaxed max-w-xl">
						Здесь можно создать своё сообщество, посмотреть существующие группы, подписаться на
						интересные и публиковать посты внутри клубов.
					</p>
				</div>
				<Button type="button" onClick={openCreate} className="shrink-0 self-start">
					Создать сообщество
				</Button>
			</div>

			<ul className="space-y-4">
				{list.map((c) => (
					<li key={c.id}>
						<Link
							to={`/community/${c.id}`}
							className="flex gap-4 bg-white rounded-xl border border-north-200 p-4 hover:shadow-md transition-shadow"
						>
							<img src={c.coverUrl} alt="" className="w-24 h-16 rounded-lg object-cover shrink-0" />
							<div className="min-w-0 flex-1">
								<h2 className="font-bold text-north-900 truncate">{c.name}</h2>
								<p className="text-sm text-north-600 line-clamp-2 mt-1">{c.aboutShort}</p>
								<div className="mt-2 flex items-center gap-2">
									<span className="inline-flex items-center gap-1.5 rounded-full border border-north-300 bg-white px-2.5 py-1 text-xs font-medium text-north-600 tabular-nums shadow-sm">
										<Users size={14} className="text-north-400 shrink-0" strokeWidth={2} />
										{c.memberIds.length}
									</span>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>

			{createOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="create-community-title"
						className="bg-white rounded-2xl border border-north-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
					>
						<div className="flex items-center justify-between px-5 py-4 border-b border-north-100">
							<h2
								id="create-community-title"
								className="font-serif text-xl font-bold text-north-900"
							>
								Новое сообщество
							</h2>
							<button
								type="button"
								onClick={closeCreate}
								className="p-2 rounded-lg text-north-400 hover:text-north-800 hover:bg-north-50"
								aria-label="Закрыть"
							>
								<X size={20} />
							</button>
						</div>
						<div className="p-5 space-y-4">
							<p className="text-sm text-north-500">
								Укажите название и описание: краткое — для карточек и списков, подробное — на
								странице сообщества. После создания вы станете создателем и сможете назначать
								админов.
							</p>
							<div>
								<label
									htmlFor="community-name"
									className="block text-sm font-medium text-north-700 mb-1"
								>
									Название
								</label>
								<input
									id="community-name"
									type="text"
									className="w-full px-3 py-2 rounded-lg border border-north-200 text-sm focus:outline-none focus:ring-2 focus:ring-north-400"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Например, Dev Якутия"
								/>
							</div>
							<div>
								<label
									htmlFor="community-about"
									className="block text-sm font-medium text-north-700 mb-1"
								>
									Кратко о сообществе
								</label>
								<textarea
									id="community-about"
									className="w-full px-3 py-2 rounded-lg border border-north-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-north-400"
									rows={2}
									value={aboutShort}
									onChange={(e) => setAboutShort(e.target.value)}
									placeholder="Одно–два предложения для карточки в списке"
								/>
							</div>
							<div>
								<label
									htmlFor="community-desc"
									className="block text-sm font-medium text-north-700 mb-1"
								>
									Подробное описание
								</label>
								<textarea
									id="community-desc"
									className="w-full px-3 py-2 rounded-lg border border-north-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-north-400"
									rows={4}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="О чём клуб, для кого он, какие темы"
								/>
							</div>
							<div className="flex gap-2 justify-end pt-2">
								<Button type="button" variant="secondary" onClick={closeCreate}>
									Отмена
								</Button>
								<Button
									type="button"
									onClick={handleCreate}
									disabled={!name.trim() || !aboutShort.trim() || !description.trim()}
								>
									Создать
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Communities;
