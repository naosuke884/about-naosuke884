export type Work = {
	id: string;
	title: string;
	/** カード見出しの冒頭に表示するアイコンのURL */
	icon: string;
	summary: string;
	/** 項目をクリックしたときに開くページのURL */
	url: string;
};

export const works: Work[] = [
	{
		id: "poi",
		title: "poi",
		// poi側で配信している実物のfaviconを参照し、常に最新に保つ
		icon: "https://poinote.app/icon.svg",
		summary: "30日で消えるメモ帳Webアプリ。",
		url: "https://poinote.app/",
	},
	{
		id: "roommate",
		title: "roommate",
		// roommate側で配信している実物のロゴを参照し、常に最新に保つ
		icon: "https://roommate.hayashi-naoki.com/logo.svg",
		summary: "同じ日に同じゲームを遊ぶ人と、スコアを競うブラウザゲーム。",
		url: "https://roommate.hayashi-naoki.com/",
	},
];
