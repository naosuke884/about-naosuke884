import { getImage, inferRemoteSize } from "astro:assets";

// 紹介先サイトのOGPをビルド時に取得して、記事ページのリンクカードに使う。
// 取得・解析・画像変換のどれかに失敗しても例外は投げずに情報を欠けさせるだけにし、
// 外部サイトの障害や仕様変更でビルドが落ちないようにする(issue #55 の方針)。
// カード側は欠けた情報を出さないだけで、URLとホスト名は常に表示できる。

export type LinkPreview = {
	title?: string;
	description?: string;
	siteName?: string;
	image?: { src: string; width: number; height: number };
};

const FETCH_TIMEOUT_MS = 5000;
// カードの画像表示幅(PCでmax-w-3xlの約4割・モバイルで画面幅)に2倍密度でも足りる幅
const PREVIEW_IMAGE_WIDTH = 640;

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
	let html: string;
	try {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			headers: { "user-agent": "Mozilla/5.0 (compatible; link-preview)" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		html = await res.text();
	} catch (error) {
		console.warn(`[link-preview] ${url} の取得に失敗: ${error}`);
		return {};
	}

	const meta = parseMetaTags(html);
	const imageUrl = meta.get("og:image") ?? meta.get("twitter:image");
	return {
		title:
			meta.get("og:title") ??
			meta.get("twitter:title") ??
			decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? ""),
		description:
			meta.get("og:description") ??
			meta.get("twitter:description") ??
			meta.get("description"),
		siteName: meta.get("og:site_name"),
		image: imageUrl ? await optimizeImage(imageUrl, url) : undefined,
	};
}

// og:image はビルド時にダウンロードしてサイト内の画像として配信する。
// 閲覧時に紹介先サーバーへリクエストが飛ばず、あとで画像が消えても表示が壊れない
async function optimizeImage(
	imageUrl: string,
	pageUrl: string,
): Promise<LinkPreview["image"] | undefined> {
	try {
		// og:image は相対パスで書かれていることもある
		const src = new URL(imageUrl, pageUrl).href;
		// inferSize と width を併用すると元の高さが残って縦横比が崩れるので、
		// 元サイズから縮小後の高さを自分で計算する
		const original = await inferRemoteSize(src);
		const width = Math.min(PREVIEW_IMAGE_WIDTH, original.width);
		const height = Math.round((original.height * width) / original.width);
		const image = await getImage({ src, width, height, format: "webp" });
		return { src: image.src, width, height };
	} catch (error) {
		console.warn(`[link-preview] ${imageUrl} の画像変換に失敗: ${error}`);
		return undefined;
	}
}

// <meta property|name="..." content="..."> を属性の順不同で拾う。
// 同じキーが複数あれば最初のものを使う
function parseMetaTags(html: string): Map<string, string> {
	const meta = new Map<string, string>();
	for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
		const attrs = new Map(
			[...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
				([, name, dq, sq]) => [name.toLowerCase(), dq ?? sq],
			),
		);
		const key = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase();
		const content = decodeEntities(attrs.get("content") ?? "");
		if (key && content && !meta.has(key)) {
			meta.set(key, content);
		}
	}
	return meta;
}

function decodeEntities(text: string): string | undefined {
	const decoded = text
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
			String.fromCodePoint(Number.parseInt(hex, 16)),
		)
		.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.trim();
	return decoded || undefined;
}
