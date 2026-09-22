import type { CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";
import { getBlogStaticPaths } from "../../../blog/entries";
import { renderBlogOgImage } from "../../../blog/og-image";

// OG画像生成の実体はsrc/blog/og-image.tsに置き、ここはルーティングのみ。
// resvgのネイティブモジュールを使うため、prerenderはNodeで実行する
// (astro.config.mjsのprerenderEnvironment: "node"と対)

export const getStaticPaths = getBlogStaticPaths;

export const GET: APIRoute<{ entry: CollectionEntry<"blog"> }> = async ({
	props,
}) => {
	const { title, emoji } = props.entry.data;
	const png = await renderBlogOgImage(title, emoji);
	return new Response(png, {
		headers: { "Content-Type": "image/png" },
	});
};
