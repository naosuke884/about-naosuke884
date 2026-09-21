import { type CollectionEntry, getCollection } from "astro:content";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import satori from "satori";

// ブログ記事のOG画像(X等のシェアプレビュー)をビルド時に生成する。
// 記事frontmatterのemojiをTwemojiのSVGで大きく載せたカードデザイン。
// resvgのネイティブモジュールを使うため、prerenderはNodeで実行する
// (astro.config.mjsのprerenderEnvironment: "node"と対)

export async function getStaticPaths() {
	const entries = await getCollection("blog");
	return entries.map((entry) => ({
		params: { slug: entry.id },
		props: { entry },
	}));
}

// satoriはJSXなしでも {type, props} のオブジェクトツリーを受け取れる
type Element = {
	type: string;
	props: Record<string, unknown> & { children?: Element[] | string };
};

// タイトルに使う文字だけをGoogle Fontsからサブセット取得する
// (UAヘッダなしのリクエストにはwoff2ではなくsatoriが読めるTTFのURLが返る)
async function fetchFontSubset(text: string): Promise<ArrayBuffer> {
	const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(cssUrl)).text();
	const fontUrl = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
	if (!fontUrl) {
		throw new Error(`OG画像用フォントの取得に失敗: ${cssUrl}`);
	}
	return (await fetch(fontUrl)).arrayBuffer();
}

// Twemojiのファイル名規則: ZWJシーケンスでなければVS16(fe0f)を落とす
function emojiToCodePoints(emoji: string): string {
	const codes = [...emoji].map((c) => c.codePointAt(0)?.toString(16) ?? "");
	return (
		emoji.includes("\u200d") ? codes : codes.filter((c) => c !== "fe0f")
	).join("-");
}

async function fetchEmojiDataUri(emoji: string): Promise<string> {
	const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/svg/${emojiToCodePoints(emoji)}.svg`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Twemojiの取得に失敗(${res.status}): ${url}`);
	}
	return `data:image/svg+xml,${encodeURIComponent(await res.text())}`;
}

// 配色はglobal.cssのlightテーマと同じトーンで固定する
const COLORS = {
	gradientFrom: "#486289",
	gradientTo: "#89aed0",
	card: "#f8f7f4",
	title: "#2d2d2d",
	siteName: "#486289",
};

const SITE_NAME = "about-naosuke884";

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

export const GET: APIRoute<{ entry: CollectionEntry<"blog"> }> = async ({
	props,
}) => {
	const { title, emoji } = props.entry.data;

	const [font, emojiDataUri] = await Promise.all([
		fetchFontSubset(title + SITE_NAME),
		fetchEmojiDataUri(emoji),
	]);

	const svg = await satori(ogTemplate(title, emojiDataUri), {
		width: 1200,
		height: 630,
		fonts: [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }],
	});

	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), {
		headers: { "Content-Type": "image/png" },
	});
};
