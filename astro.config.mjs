// @ts-check

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// 全ページ静的なのでランタイム変換(Cloudflare Images)ではなくビルド時に画像を変換する
	adapter: cloudflare({ imageService: "compile" }),

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
	},
});
