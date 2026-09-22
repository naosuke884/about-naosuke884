// @ts-check

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig, fontProviders } from "astro/config";
import { defineHastPlugin } from "satteri";

// 記事本文の外部リンクを別タブで開く
const externalLinksPlugin = defineHastPlugin({
	name: "external-links",
	element: {
		filter: ["a"],
		visit(node, ctx) {
			const href = node.properties?.href;
			if (typeof href === "string" && /^https?:\/\//.test(href)) {
				ctx.setProperty(node, "target", "_blank");
				ctx.setProperty(node, "rel", "noopener noreferrer");
			}
		},
	},
});

// https://astro.build/config
export default defineConfig({
	// OGP等の絶対URL生成に使う
	site: "https://hayashi-naoki.com",

	adapter: cloudflare({
		// 全ページ静的なのでランタイム変換(Cloudflare Images)ではなくビルド時に画像を変換する
		imageService: "compile",
		// prerenderをデフォルトのworkerdではなくNodeで実行する。
		// OG画像生成(og.png.ts)がネイティブモジュール(@resvg/resvg-js)を使うため。
		// 全ページ静的なので、workerdで動かない事故をビルドで検出できなくなるデメリットは実質ない
		prerenderEnvironment: "node",
	}),

	markdown: {
		// コードブロックをライト/ダーク両テーマに対応させる(切替CSSはblog/[slug].astro側)
		shikiConfig: {
			themes: { light: "github-light", dark: "github-dark" },
		},
		processor: satteri({ hastPlugins: [externalLinksPlugin] }),
	},

	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-inter",
			weights: ["400 700"],
			styles: ["normal"],
			subsets: ["latin"],
		},
	],

	vite: {
		plugins: [tailwindcss()],
		// build/check(pre-commitフック含む)がデーモン稼働中のdevサーバーと
		// Viteキャッシュを共有すると無効化されて全リクエスト500になるため、
		// dev以外はキャッシュディレクトリを分離する
		cacheDir: process.argv.includes("dev")
			? undefined
			: "node_modules/.vite-tools",
	},
});
