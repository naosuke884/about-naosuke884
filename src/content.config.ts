import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/blog/content" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		// 公開後に内容を変えた日。dateとともにpre-commit(scripts/stamp-blog-dates.ts)が書き込む
		updated: z.coerce.date().optional(),
		// 記事ページのmeta description・og:description。記事ごとの説明文を必ず出すため必須にする
		description: z.string(),
		// OG画像に載せる絵文字(1グリフ)
		emoji: z.string().default("📝"),
		// 外部記事を紹介する場合のリンク先。未指定なら自分の記事
		externalUrl: z.url().optional(),
		// 本文の前にh2・h3の目次を出す。短い記事では邪魔になるため記事ごとに選ぶ
		toc: z.boolean().default(false),
	}),
});

export const collections = { blog };
