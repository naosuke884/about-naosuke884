export type Book = {
	title: string;
	cover: string;
	url: string;
};

export const books: Book[] = [
	{
		title: "ドメイン駆動設計入門",
		cover: "/books/domain-driven-design-intro.jpg",
		url: "https://www.shoeisha.co.jp/book/detail/9784798150727",
	},
	{
		title: "良いコード悪いコードで学ぶ設計入門",
		cover: "/books/good-code-bad-code.jpg",
		url: "https://gihyo.jp/book/2022/978-4-297-12783-1",
	},
	{
		title: "実用Go言語",
		cover: "/books/practical-go.jpg",
		url: "https://www.oreilly.co.jp/books/9784873119694/",
	},
	{
		title: "アジャイルサムライ",
		cover: "/books/agile-samurai.jpg",
		url: "https://www.ohmsha.co.jp/book/9784274068560/",
	},
];
