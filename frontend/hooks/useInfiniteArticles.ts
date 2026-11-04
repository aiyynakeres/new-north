import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Article, ArticlePage } from "../types";

export const ARTICLES_PAGE_SIZE = 10;

type Fetcher = (limit: number, offset: number) => Promise<ArticlePage>;

type Result = {
	articles: Article[];
	hasMore: boolean;
	loading: boolean;
	loadMore: () => Promise<void>;
	reload: () => Promise<void>;
	setArticles: Dispatch<SetStateAction<Article[]>>;
};

/**
 * Loads article pages one at a time. The `key` identifies the list being
 * viewed, so changing it (route/user) reloads from the first page.
 */
export function useInfiniteArticles(key: string, fetcher: Fetcher): Result {
	const [articles, setArticles] = useState<Article[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(true);
	const offsetRef = useRef(0);
	const loadingRef = useRef(false);
	const generationRef = useRef(0);
	const fetcherRef = useRef(fetcher);
	fetcherRef.current = fetcher;
	const lastKeyRef = useRef<string | null>(null);
	const hasMoreRef = useRef(hasMore);
	hasMoreRef.current = hasMore;

	const reload = useCallback(async () => {
		const generation = ++generationRef.current;
		offsetRef.current = 0;
		loadingRef.current = true;
		setLoading(true);
		setHasMore(true);
		setArticles([]);
		try {
			const page = await fetcherRef.current(ARTICLES_PAGE_SIZE, 0);
			if (generationRef.current !== generation) return;
			offsetRef.current = page.items.length;
			setArticles(page.items);
			setHasMore(page.hasMore);
			hasMoreRef.current = page.hasMore;
		} catch {
			if (generationRef.current !== generation) return;
			setArticles([]);
			setHasMore(false);
			hasMoreRef.current = false;
		} finally {
			if (generationRef.current === generation) {
				loadingRef.current = false;
				setLoading(false);
			}
		}
	}, []);

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !hasMoreRef.current) return;
		const generation = generationRef.current;
		loadingRef.current = true;
		setLoading(true);
		try {
			const page = await fetcherRef.current(ARTICLES_PAGE_SIZE, offsetRef.current);
			if (generationRef.current !== generation) return;
			offsetRef.current += page.items.length;
			setArticles((prev) => [...prev, ...page.items]);
			setHasMore(page.hasMore);
			hasMoreRef.current = page.hasMore;
		} catch {
			if (generationRef.current === generation) {
				setHasMore(false);
				hasMoreRef.current = false;
			}
		} finally {
			if (generationRef.current === generation) {
				loadingRef.current = false;
				setLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		if (lastKeyRef.current === key) return;
		lastKeyRef.current = key;
		reload();
	}, [key, reload]);

	return { articles, hasMore, loading, loadMore, reload, setArticles };
}
