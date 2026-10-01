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
];
