// @ts-check

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// 全ページ静的なのでランタイム変換(Cloudflare Images)ではなくビルド時に画像を変換する
	adapter: cloudflare({ imageService: "compile" }),

	markdown: {
		// コードブロックをライト/ダーク両テーマに対応させる(切替CSSはblog/[slug].astro側)
		shikiConfig: {
			themes: { light: "github-light", dark: "github-dark" },
		},
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
