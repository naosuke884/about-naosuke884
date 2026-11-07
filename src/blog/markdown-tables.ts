import type { Element, ElementContent } from "hast";
import { defineHastPlugin } from "satteri";

// この文字数を超えるセルが1つでもある列を「文章の列」とみなす。
// 「事前準備」「候補を集める」のようなラベルの列は下回り、説明文の入る列は上回る値
const WIDE_COLUMN_MIN_LENGTH = 20;

// 記事本文の表を、列の中身の長さに応じて組む。
// CSSだけでは列ごとの文字数を知れず、全セル一律の下限だと短い列まで空白を抱えるため、ビルド時に数えて印を付ける。
// 文章の列のセルには.table-wideを付け(折り返して最小幅を確保する)、
// それ以外は中身の幅に詰める。表はdiv.table-scrollで包み、横スクロールはdiv側に任せる
export const markdownTablesPlugin = defineHastPlugin({
	name: "markdown-tables",
	element: {
		filter: ["table"],
		visit(table, ctx) {
			const rows = childElements(table).flatMap((section) =>
				section.tagName === "tr" ? [section] : childElements(section),
			);
			const rowCells = rows.map((row) =>
				childElements(row).filter(
					(cell) => cell.tagName === "th" || cell.tagName === "td",
				),
			);

			const columnLengths: number[] = [];
			for (const cells of rowCells) {
				cells.forEach((cell, index) => {
					const length = ctx.textContent(cell).trim().length;
					columnLengths[index] = Math.max(columnLengths[index] ?? 0, length);
				});
			}

			for (const cells of rowCells) {
				cells.forEach((cell, index) => {
					if ((columnLengths[index] ?? 0) > WIDE_COLUMN_MIN_LENGTH) {
						ctx.setProperty(cell, "className", ["table-wide"]);
					}
				});
			}

			ctx.wrapNode(table, {
				type: "element",
				tagName: "div",
				properties: { className: ["table-scroll"] },
				children: [],
			});
		},
	},
});

function childElements(node: Element): Element[] {
	return node.children.filter(
		(child: ElementContent): child is Element => child.type === "element",
	);
}
