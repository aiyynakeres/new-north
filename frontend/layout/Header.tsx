import { LogOut, PenTool } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import type { User } from "../types";

type Props = {
	user: User | null;
	onLogout: () => void;
};

const Header: React.FC<Props> = ({ user, onLogout }) => {
	return (
		<header className="sticky top-0 z-50 border-b border-north-200 bg-white">
			<div
				className={`${user ? "max-w-6xl" : "max-w-7xl"} mx-auto flex h-16 items-center justify-between px-4 sm:px-6`}
			>
				<Link to="/" className="flex items-center gap-2 group">
					<img
						src="/logo.png"
						alt=""
						aria-hidden="true"
						className="h-8 w-8 object-contain transition-transform duration-200 group-hover:-translate-y-0.5"
					/>
					<span className="font-serif text-xl font-bold tracking-tight text-north-800">
						New-North
					</span>
				</Link>

				<nav className="flex items-center gap-4">
					{user ? (
						<>
							<Link to="/write">
								<Button variant="secondary" className="hidden sm:flex text-sm">
									<PenTool size={16} /> Написать
								</Button>
							</Link>
							<div className="relative group">
								<Link to={`/profile/${user.id}`}>
									<img
										src={user.avatarUrl}
										alt={user.fullName}
										className="w-9 h-9 rounded-full object-cover border border-north-200 cursor-pointer"
									/>
								</Link>
							</div>
							<button
								type="button"
								onClick={onLogout}
								aria-label="Выйти"
								className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-north-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-north-800"
							>
								<LogOut size={20} />
							</button>
						</>
					) : (
						<div className="flex items-center gap-1 sm:gap-3">
							<Link to="/login">
								<Button variant="ghost" className="min-h-11 px-3 text-sm sm:px-4 sm:text-base">
									Вход
								</Button>
							</Link>
							<Link to="/register">
								<Button variant="primary" className="min-h-11 px-4 text-sm sm:px-5 sm:text-base">
									Вступить
								</Button>
							</Link>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
};

export default Header;
