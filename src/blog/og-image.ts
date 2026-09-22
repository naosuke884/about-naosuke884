import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { SITE_NAME } from "../site";

// ブログ記事のOG画像(X等のシェアプレビュー)をビルド時に生成する。
// 記事frontmatterのemojiをTwemojiのSVGで大きく載せたカードデザイン。
// フォント・絵文字はnpmパッケージ同梱のファイルから読み、ビルド時に
// 外部サービスへアクセスしない(issue #55)。壊れるのは収録外の絵文字を
// 使ったときだけなので、ローカル/CIのビルドで検出できる。

const require = createRequire(import.meta.url);

// satoriはJSXなしでも {type, props} のオブジェクトツリーを受け取れる
type Element = {
	type: string;
	props: Record<string, unknown> & { children?: Element[] | string };
};

// 全記事共通なのでモジュールスコープで一度だけ読む(静的TTF・約5.5MB)
const fontPromise = readFile(
	require.resolve(
		"@expo-google-fonts/noto-sans-jp/700Bold/NotoSansJP_700Bold.ttf",
	),
);

// Twemojiのファイル名規則: ZWJシーケンスでなければVS16(fe0f)を落とす
function emojiToCodePoints(emoji: string): string {
	const codes = [...emoji].map((c) => c.codePointAt(0)?.toString(16) ?? "");
	return (
		emoji.includes("\u200d") ? codes : codes.filter((c) => c !== "fe0f")
	).join("-");
}

async function loadEmojiDataUri(emoji: string): Promise<string> {
	let svgPath: string;
	try {
		svgPath = require.resolve(`@twemoji/svg/${emojiToCodePoints(emoji)}.svg`);
	} catch {
		throw new Error(
			`絵文字 "${emoji}" は@twemoji/svgに収録されていない。記事のemojiを変えるかパッケージを更新する`,
		);
	}
	const svg = await readFile(svgPath, "utf8");
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// 配色はglobal.cssのlightテーマと同じトーンで固定する
const COLORS = {
	gradientFrom: "#486289",
	gradientTo: "#89aed0",
	card: "#f8f7f4",
	title: "#2d2d2d",
	siteName: "#486289",
};

function ogTemplate(title: string, emojiDataUri: string): Element {
	return {
		type: "div",
		props: {
			style: {
				width: "100%",
				height: "100%",
				display: "flex",
				padding: "40px",
				background: `linear-gradient(135deg, ${COLORS.gradientFrom}, ${COLORS.gradientTo})`,
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							flex: 1,
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							background: COLORS.card,
							borderRadius: "24px",
							padding: "56px 64px",
						},
						children: [
							{
								type: "img",
								props: { src: emojiDataUri, width: 140, height: 140 },
							},
							{
								type: "div",
								props: {
									style: {
										fontSize: "56px",
										fontWeight: 700,
										lineHeight: 1.4,
										color: COLORS.title,
										// 長いタイトルは3行で省略する
										display: "block",
										lineClamp: 3,
									},
									children: title,
								},
							},
							{
								type: "div",
								props: {
									style: {
										fontSize: "32px",
										fontWeight: 700,
										color: COLORS.siteName,
									},
									children: SITE_NAME,
								},
							},
						],
					},
				},
			],
		},
	};
}

export async function renderBlogOgImage(
	title: string,
	emoji: string,
): Promise<Uint8Array<ArrayBuffer>> {
	const [font, emojiDataUri] = await Promise.all([
		fontPromise,
		loadEmojiDataUri(emoji),
	]);

	const svg = await satori(ogTemplate(title, emojiDataUri), {
		width: 1200,
		height: 630,
		fonts: [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }],
	});

	return new Uint8Array(new Resvg(svg).render().asPng());
}
