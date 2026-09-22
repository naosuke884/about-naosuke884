import { getCollection } from "astro:content";

// 記事ページ([slug].astro)とOG画像(og.png.ts)は1対1なので、同じパス集合を共有する
export async function getBlogStaticPaths() {
	const entries = await getCollection("blog");
	return entries.map((entry) => ({
		params: { slug: entry.id },
		props: { entry },
	}));
}

// 記事日付の表示形式(YYYY-MM-DD)
export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
