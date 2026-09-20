import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		// 外部記事を紹介する場合のリンク先。未指定なら自分の記事
		externalUrl: z.string().url().optional(),
	}),
});

export const collections = { blog };
