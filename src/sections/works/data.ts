export type Work = {
	id: string;
	title: string;
	summary: string;
	description: string;
	demo: { src: string; label: string };
	links: { label: string; url: string; icon?: "github" }[];
};

export const works: Work[] = [
	{
		id: "poi",
		title: "poi",
		summary: "30日で消えるメモ帳Webアプリ。",
		description:
			"書いたものが30日後に自動で消える1画面のメモ帳です。ログインすると1枚のボードにMarkdown記法でメモが書けます。\n\n初めてちゃんと作ったアプリです。自分で欲しいなと思ったものを作りました。Markdown編集時の挙動に気を使いました。",
		demo: {
			// poi側(public/demo.mp4)で配信している実物のデモ動画を参照し、常に最新に保つ
			src: "https://poinote.app/demo.mp4",
			label:
				"poiのデモ動画。Markdownでメモを書くと、セクションごとに「あと30日」などの残り日数が表示される",
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
