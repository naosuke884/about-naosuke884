import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/blog/content" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		// 記事ページのmeta description・og:description。記事ごとの説明文を必ず出すため必須にする
		description: z.string(),
		// OG画像に載せる絵文字(1グリフ)
		emoji: z.string().default("📝"),
		// 外部記事を紹介する場合のリンク先。未指定なら自分の記事
		externalUrl: z.url().optional(),
	}),
});

export const collections = { blog };
