export type Work = {
	id: string;
	title: string;
	summary: string;
	description: string;
	techs: string[];
	links: { label: string; url: string; icon?: "github" }[];
};

export const works: Work[] = [
	{
		id: "poi",
		title: "poi",
		summary: "30日で消えるメモ帳Webアプリ。",
		description:
			"書いたものが30日後に自動で消える1画面のメモ帳。Googleでログインすると1枚のボードが使え、書いた内容はそのまま自動保存される。メモは空行2つでセクションに分かれ、それぞれ書いた時点から30日で期限切れになる。メモ向けに絞ったMarkdownの装飾表示、セクションのコピー・PNGエクスポート、PWAとしてのオフライン閲覧に対応。",
		techs: [
			"Cloudflare Workers",
			"D1",
			"Hono",
			"Better Auth",
			"Drizzle ORM",
			"React",
			"TanStack Router",
			"Mantine",
			"CodeMirror 6",
			"Vite + PWA",
		],
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
