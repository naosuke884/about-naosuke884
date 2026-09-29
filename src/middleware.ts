import { defineMiddleware } from "astro:middleware";
import { HTMLProcessor, loadDefaultJapaneseParser } from "budoux";
import { parseHTML } from "linkedom";

const budouxParser = loadDefaultJapaneseParser();

// 全ページの本文テキストにBudouXを適用し、文節の途中で折り返さないようにする。
// 文節の区切りには<wbr>を入れる(ZWSPだとコピーやページ内検索のテキストに混ざるため)。
// 適用した要素には.budouxを付け、折り返しの指定はglobal.css側で行う。
// <wbr>は折り返し位置の候補を示すだけなので、1行に収まるテキストの表示は変わらない
export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	if (!response.headers.get("Content-Type")?.startsWith("text/html")) {
		return response;
	}

	const { document } = parseHTML(await response.text());
	new HTMLProcessor(budouxParser, {
		className: "budoux",
		separator: document.createElement("wbr"),
	}).applyToElement(document.body);
	wrapPhrasesInSpan(document);

	return new Response(document.toString(), response);
});

// flex/gridコンテナ(.btnやflexの見出しなど)の直下では、<wbr>で区切ったテキストが
// 別々のflexアイテムになり、文節の間にgapの隙間が空いてしまう。
// <wbr>を含む連続したテキストと<wbr>をspanにまとめ、元のテキストと同じ1つのアイテムに戻す
function wrapPhrasesInSpan(document: Document) {
	const parents = new Set(
		[...document.querySelectorAll("wbr")].map((wbr) => wbr.parentNode),
	);
	for (const parent of parents) {
		if (!parent) continue;
		let run: ChildNode[] = [];
		const flush = () => {
			if (run.some((node) => node.nodeName === "WBR")) {
				const span = document.createElement("span");
				run[0].before(span);
				span.append(...run);
			}
			run = [];
		};
		for (const node of [...parent.childNodes]) {
			if (node.nodeType === node.TEXT_NODE || node.nodeName === "WBR") {
				run.push(node);
			} else {
				flush();
			}
		}
		flush();
	}
}
