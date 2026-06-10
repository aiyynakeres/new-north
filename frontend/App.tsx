import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
	useSearchParams,
} from "react-router-dom";
import Footer from "./layout/Footer";
import Header from "./layout/Header";
import ArticleView from "./pages/ArticleView";
import Authors from "./pages/Authors";
import Communities from "./pages/Communities";
import CommunityMembers from "./pages/CommunityMembers";
import CommunityView from "./pages/CommunityView";
import Editor from "./pages/Editor";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import { api } from "./services/api";
import type { User as UserType } from "./types";

function WriteRoute({ user }: { user: UserType | null }) {
	const [searchParams] = useSearchParams();
	const community = searchParams.get("community");
	if (!user) {
		const qs = community ? `?community=${encodeURIComponent(community)}` : "";
		return <Navigate to="/login" replace state={{ from: `/write${qs}` }} />;
	}
	return <Editor currentUser={user} />;
}

export default function App() {
	const [user, setUser] = useState<UserType | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const session = await api.getSession();
			if (session) setUser(session);
			setLoading(false);
		})();
	}, []);

	const handleLogout = () => {
		api.clearSession();
		setUser(null);
	};

	if (loading)
		return (
			<div className="h-screen flex items-center justify-center bg-north-50">
				<Loader2 className="animate-spin text-north-400" size={32} />
			</div>
		);

	return (
		<Router>
			<div className="min-h-screen bg-north-50 font-sans text-north-800 flex flex-col">
				<Header user={user} onLogout={handleLogout} />
				<div className="flex-1">
					<Routes>
						<Route path="/" element={<Feed currentUser={user} />} />
						<Route path="/register" element={<Register onLogin={setUser} />} />
						<Route path="/login" element={<Login onLogin={setUser} />} />
						<Route path="/article/:id" element={<ArticleView currentUser={user} />} />
						<Route path="/profile/:id" element={<Profile currentUser={user} />} />
						<Route path="/authors" element={<Authors />} />
						<Route path="/communities" element={<Communities currentUser={user} />} />
						<Route path="/community/:id/members" element={<CommunityMembers />} />
						<Route path="/community/:id" element={<CommunityView currentUser={user} />} />
						<Route path="/people" element={<Navigate to="/authors" replace />} />
						<Route path="/write" element={<WriteRoute user={user} />} />
						<Route
							path="/edit/:id"
							element={user ? <Editor currentUser={user} /> : <Navigate to="/login" />}
						/>
					</Routes>
				</div>
				<Footer />
			</div>
		</Router>
	);
}
