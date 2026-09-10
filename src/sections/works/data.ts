import type { ImageMetadata } from "astro";
import poiScreenshot from "./screenshots/poi.png";

export type Work = {
	id: string;
	title: string;
	summary: string;
	description: string;
	screenshot: { src: ImageMetadata; alt: string };
	links: { label: string; url: string; icon?: "github" }[];
};

export const works: Work[] = [
	{
		id: "poi",
		title: "poi",
		summary: "30日で消えるメモ帳Webアプリ。",
		description:
			"書いたものが30日後に自動で消える1画面のメモ帳です。ログインすると1枚のボードにMarkdown記法でメモが書けます。\n\n初めてちゃんと作ったアプリです。自分で欲しいなと思ったものを作りました。TanStack Routerを使用したSPAで技術的には軽めの構成です。Markdown編集時の挙動に気を使いました。",
		screenshot: {
			src: poiScreenshot,
			alt: "poiのメモ画面。Markdownで書いたセクションごとに「あと7日」などの残り日数が表示されている",
		},
		links: [
			{ label: "poinote.app", url: "https://poinote.app/" },
			{
				label: "GitHub",
				url: "https://github.com/naosuke884/poi",
				icon: "github",
			},
		],
	},
];
