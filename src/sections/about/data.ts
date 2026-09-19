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
			"2026年から約200人規模のSIerで保守開発などをやっています。仕事とは別で個人開発も少しやっています。",
	},
	{
		id: "training",
		label: "筋トレ",
		description:
			"ジムでゆるく筋トレ始めました。いつかマッチョになれますように。",
	},
	{
		id: "lol",
		label: "League of Legends",
		description: "たまーにやってます。",
	},
	{
		id: "movies",
		label: "映画",
		description:
			"SF・ファンタジー・ホラーが好きです。インターステラーとヴィジットがおすすめ。",
	},
	{
		id: "manga",
		label: "漫画",
		description:
			"雑にいろいろ見てます。ファンタジー系と泣ける系と怖い系とグロい系が好きかもです。",
	},
	{
		id: "tv-series",
		label: "海外ドラマ",
		description:
			"面白いシリーズを見つけると一気見してしまいます。最近は三体という海外ドラマが気になっています。",
	},
];
