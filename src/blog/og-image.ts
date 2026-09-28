import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import { loadDefaultJapaneseParser } from "budoux";
import satori from "satori";
import { formatDate } from "./entries";

// ブログ記事のOG画像(X等のシェアプレビュー)をビルド時に生成する。
// 記事frontmatterのemojiをTwemojiのSVGで大きく載せ、タイトルと投稿日を並べたカードデザイン。
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

const budouxParser = loadDefaultJapaneseParser();

// 「技術ス/タック」のような語の途中での折り返しを防ぐため、タイトルを文節ごとの
// spanに分けてflexWrapで並べる(satoriはZWSP+wordBreak: keep-allだと行幅を超えて描画する)
function splitIntoPhrases(text: string): Element[] {
	return budouxParser
		.parse(text)
		.map((phrase) => ({ type: "span", props: { children: phrase } }));
}

// 配色はglobal.cssのlightテーマと同じトーンで固定する
const COLORS = {
	// 外枠はlightテーマのprimary
	frame: "#486289",
	card: "#f8f7f4",
	title: "#2d2d2d",
	// base-contentの70%(ページ上の日付表示と同じ濃さ)をcardの上で合成した色
	date: "#6a6a69",
};

function ogTemplate(
	title: string,
	emojiDataUri: string,
	date: string,
): Element {
	return {
		type: "div",
		props: {
			style: {
				width: "100%",
				height: "100%",
				display: "flex",
				padding: "40px",
				background: COLORS.frame,
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							flex: 1,
							display: "flex",
							flexDirection: "column",
							// 記事ページの見出し(絵文字・タイトル・日付を縦に中央寄せ)と揃える
							justifyContent: "center",
							alignItems: "center",
							gap: "32px",
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
										display: "flex",
										flexWrap: "wrap",
										justifyContent: "center",
										// 長いタイトルは3行までで切る(flexではlineClampが効かない)
										maxHeight: `${56 * 1.4 * 3}px`,
										overflow: "hidden",
									},
									children: splitIntoPhrases(title),
								},
							},
							{
								type: "div",
								props: {
									style: {
										fontSize: "32px",
										fontWeight: 700,
										color: COLORS.date,
									},
									children: date,
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
	date: Date,
): Promise<Uint8Array<ArrayBuffer>> {
	const [font, emojiDataUri] = await Promise.all([
		fontPromise,
		loadEmojiDataUri(emoji),
	]);

	const svg = await satori(ogTemplate(title, emojiDataUri, formatDate(date)), {
		width: 1200,
		height: 630,
		fonts: [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }],
	});

	return new Uint8Array(new Resvg(svg).render().asPng());
}
