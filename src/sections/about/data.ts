export type AboutTag = {
	id: string;
	label: string;
	description: string;
};

export const aboutTags: AboutTag[] = [
	{
		id: "software-engineer",
		label: "ソフトウェアエンジニア",
		description:
			"Webアプリケーションを作っています。自分が欲しいものを個人開発で形にするのが好きです。",
	},
	{
		id: "training",
		label: "筋トレ",
		description: "ジム通いを継続中です。体を動かすとコードも書ける気がします。",
	},
	{
		id: "lol",
		label: "League of Legends",
		description: "長く遊んでいるオンラインゲームです。",
	},
	{
		id: "movies",
		label: "映画",
		description: "ジャンルを問わず観ます。",
	},
	{
		id: "manga",
		label: "漫画",
		description: "気になった作品はまとめ読みしがちです。",
	},
	{
		id: "tv-series",
		label: "海外ドラマ",
		description: "面白いシリーズを見つけると一気見してしまいます。",
	},
];
