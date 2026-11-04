import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";

type Props = {
	hasMore: boolean;
	loading: boolean;
	onLoadMore: () => void;
};

const InfiniteScrollSentinel: React.FC<Props> = ({ hasMore, loading, onLoadMore }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element || !hasMore || loading) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) onLoadMore();
			},
			{ rootMargin: "300px" },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [hasMore, loading, onLoadMore]);

	if (!hasMore) {
		return <p className="py-6 text-center text-xs text-north-400">Это все публикации</p>;
	}

	return (
		<div ref={ref} className="flex justify-center py-6">
			{loading && <Loader2 className="animate-spin text-north-400" size={22} />}
		</div>
	);
};

export default InfiniteScrollSentinel;
