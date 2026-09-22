import type { ImageMetadata } from "astro";
import agileSamurai from "./covers/agile-samurai.jpg";
import domainDrivenDesignIntro from "./covers/domain-driven-design-intro.jpg";
import goodCodeBadCode from "./covers/good-code-bad-code.jpg";
import practicalGo from "./covers/practical-go.jpg";

export type Book = {
	/** モーダルのDOM idとトリガーの対応付けに使う */
	id: string;
	title: string;
	cover: ImageMetadata;
	url: string;
	/** モーダルに表示する短い感想メモ */
	memo: string;
};

export const books: Book[] = [
	{
		id: "domain-driven-design-intro",
		title: "ドメイン駆動設計入門",
		cover: domainDrivenDesignIntro,
		url: "https://www.shoeisha.co.jp/book/detail/9784798150727",
		memo:
			"初めて読んだ設計本。視野を広げてくれた印象的な一冊。コードが書けるだけじゃ足りないというのを知ることができた。" +
			"かなり読みやすかった。著者の成瀬さんがおもしろくて好き。",
	},
	{
		id: "good-code-bad-code",
		title: "良いコード悪いコードで学ぶ設計入門",
		cover: goodCodeBadCode,
		url: "https://gihyo.jp/book/2022/978-4-297-12783-1",
		memo:
			"実務的な設計観点がまとまった良い本。現実のプロジェクトでどう設計改善を実現するかまで書かれている。" +
			"自分で要点をまとめたノートを定期的に読み返したくなる。",
	},
	{
		id: "practical-go",
		title: "実用Go言語",
		cover: practicalGo,
		url: "https://www.oreilly.co.jp/books/9784873119694/",
		memo:
			"特定の言語にフォーカスした本はこれが初めて。学びにはなったが、正直、具体的な技術のキャッチアップは、本より、" +
			"実際に手を動かして学ぶ方が良さそうだと思った。Go言語はバージョンアップが速いので、内容が一部古くなっていたと思う。" +
			"最近はAIコーディングが主流なのもあって具体より抽象の本が役に立ちそう。",
	},
	{
		id: "agile-samurai",
		title: "アジャイルサムライ",
		cover: agileSamurai,
		url: "https://www.ohmsha.co.jp/book/9784274068560/",
		memo:
			"初めて読んだマネジメントの本。タスクの分け方や、スケジュールの立て方に疎かったので、かなり学びが多かった。" +
			"『ドメイン駆動設計入門』と同じく視野を広げてくれた一冊。特にポイントでの見積もり、期待をマネジメントする考え方が印象に残っている。",
	},
];
