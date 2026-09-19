import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const share = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/share" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		// 外部記事を共有する場合のリンク先。未指定なら自分のメモ
		externalUrl: z.string().url().optional(),
	}),
});

export const collections = { share };
