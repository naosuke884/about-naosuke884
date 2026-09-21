// ブログ記事のOG画像(X等のシェアプレビュー)を生成してdist/blog/<slug>/og.pngに書き出す。
// 記事frontmatterのemojiをTwemojiのSVGで大きく載せたカードデザイン。
//
// Astroのエンドポイントにしない理由: このプロジェクトはprerenderもworkerd(miniflare)内で
// 実行されるため、resvgのネイティブモジュールが使えない。astro buildの後にNodeで実行する
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const CONTENT_DIR = "src/content/blog";
// 静的アセットはdist/client/から配信される(dist/client/wrangler.jsonのassets.directory)
const DIST_DIR = "dist/client";
const SITE_NAME = "about-naosuke884";
const DEFAULT_EMOJI = "📝";

// 配色はglobal.cssのlightテーマと同じトーンで固定する
const COLORS = {
	gradientFrom: "#486289",
	gradientTo: "#89aed0",
	card: "#f8f7f4",
	title: "#2d2d2d",
	siteName: "#486289",
};

/**
 * frontmatterから必要なキーだけを取り出す(値にコロンを含むtitleにも対応)
 * @param {string} markdown
 * @returns {{ title: string, emoji: string }}
 */
function parseFrontmatter(markdown) {
	const block = markdown.match(/^---\n([\s\S]*?)\n---/)?.[1];
	if (!block) {
		throw new Error("frontmatterが見つからない");
	}
	/** @type {Record<string, string>} */
	const data = {};
	for (const line of block.split("\n")) {
		const m = line.match(/^(\w+):\s*(.*)$/);
		if (m) {
			data[m[1]] = m[2].replace(/^["']|["']$/g, "");
		}
	}
	if (!data.title) {
		throw new Error("frontmatterにtitleがない");
	}
	return { title: data.title, emoji: data.emoji || DEFAULT_EMOJI };
}

/**
 * タイトルに使う文字だけをGoogle Fontsからサブセット取得する
 * (UAヘッダなしのリクエストにはwoff2ではなくsatoriが読めるTTFのURLが返る)
 * @param {string} text
 * @returns {Promise<ArrayBuffer>}
 */
async function fetchFontSubset(text) {
	const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(cssUrl)).text();
	const fontUrl = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
	if (!fontUrl) {
		throw new Error(`OG画像用フォントの取得に失敗: ${cssUrl}`);
	}
	return (await fetch(fontUrl)).arrayBuffer();
}

/**
 * Twemojiのファイル名規則: ZWJシーケンスでなければVS16(fe0f)を落とす
 * @param {string} emoji
 */
function emojiToCodePoints(emoji) {
	const codes = [...emoji].map((c) => c.codePointAt(0)?.toString(16) ?? "");
	return (
		emoji.includes("\u200d") ? codes : codes.filter((c) => c !== "fe0f")
	).join("-");
}

/**
 * @param {string} emoji
 * @returns {Promise<string>} SVGのdata URI
 */
async function fetchEmojiDataUri(emoji) {
	const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/svg/${emojiToCodePoints(emoji)}.svg`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Twemojiの取得に失敗(${res.status}): ${url}`);
	}
	return `data:image/svg+xml,${encodeURIComponent(await res.text())}`;
}

// satoriはJSXなしでも {type, props} のオブジェクトツリーを受け取れる
/**
 * @param {string} title
 * @param {string} emojiDataUri
 */
function ogTemplate(title, emojiDataUri) {
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

/**
 * @param {string} slug
 * @param {string} title
 * @param {string} emoji
 */
async function generate(slug, title, emoji) {
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
	const dir = join(DIST_DIR, "blog", slug);
	await mkdir(dir, { recursive: true });
	await writeFile(join(dir, "og.png"), png);
	console.log(`OG画像を生成: /blog/${slug}/og.png (${emoji} ${title})`);
}

const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith(".md"));
await Promise.all(
	files.map(async (file) => {
		const slug = file.replace(/\.md$/, "");
		const { title, emoji } = parseFrontmatter(
			await readFile(join(CONTENT_DIR, file), "utf8"),
		);
		await generate(slug, title, emoji);
	}),
);
