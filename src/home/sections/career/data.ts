export type Career = {
	/** 表示用の期間。例: "2024.04 – 現在" */
	period: string;
	organization: string;
	role: string;
	description?: string;
};

/** 新しい順に並べる */
export const careers: Career[] = [
	{
		period: "2026.04 – 現在",
		organization: "中規模SIer",
		role: "ソフトウェアエンジニア",
		description: "Webサイトの保守開発を担当。",
	},
	{
		period: "2020.04 – 2026.03",
		// 大学名は載せず、分野だけを示す
		organization: "大学",
		role: "情報科学を専攻",
	},
];
