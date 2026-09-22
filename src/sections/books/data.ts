import type { ImageMetadata } from "astro";
import agileSamurai from "./covers/agile-samurai.jpg";
import domainDrivenDesignIntro from "./covers/domain-driven-design-intro.jpg";
import goodCodeBadCode from "./covers/good-code-bad-code.jpg";
import practicalGo from "./covers/practical-go.jpg";

export type Book = {
	title: string;
	cover: ImageMetadata;
	url: string;
	/** モーダルに表示する短い感想メモ */
	memo: string;
};

export const books: Book[] = [
	{
		title: "ドメイン駆動設計入門",
		cover: domainDrivenDesignIntro,
		url: "https://www.shoeisha.co.jp/book/detail/9784798150727",
		memo: "（感想メモをあとで書く）",
	},
	{
		title: "良いコード悪いコードで学ぶ設計入門",
		cover: goodCodeBadCode,
		url: "https://gihyo.jp/book/2022/978-4-297-12783-1",
		memo: "（感想メモをあとで書く）",
	},
	{
		title: "実用Go言語",
		cover: practicalGo,
		url: "https://www.oreilly.co.jp/books/9784873119694/",
		memo: "（感想メモをあとで書く）",
	},
	{
		title: "アジャイルサムライ",
		cover: agileSamurai,
		url: "https://www.ohmsha.co.jp/book/9784274068560/",
		memo: "（感想メモをあとで書く）",
	},
];
