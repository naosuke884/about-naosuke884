---
title: ブログ記事のOG画像をsatoriでビルド時に生成する
date: 2026-10-04
description: このブログでは、記事をXなどでシェアしたときのOG画像をsatoriとresvgでビルド時に生成している。絵文字・フォントの扱いや、日本語タイトルの折り返しで工夫したことについて。
emoji: 🖼️
---

このブログの記事をXなどでシェアすると、記事ごとに違うカード画像が表示される。これはOG画像（`og:image`）で、記事ごとに手で作っているわけではなく、ビルド時に自動で生成している。

デザインはシンプルで、記事のfrontmatterに書いた絵文字を大きく載せ、その下にタイトルと投稿日を並べたカードだ。

```md
---
title: ブログ記事のOG画像をsatoriでビルド時に生成する
date: 2026-10-04
emoji: 🖼️
---
```

この記事なら🖼️が載る。

## 使っているもの

- [satori](https://github.com/vercel/satori)：HTML/CSS風の要素ツリーからSVGを作る
- [resvg-js](https://github.com/thx/resvg-js)：SVGをPNGに変換する
- [Twemoji](https://github.com/jdecked/twemoji)：絵文字のSVG
- [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)：日本語フォント
- [BudouX](https://github.com/google/budoux)：日本語の文節区切り

流れは「satoriでSVGを作る → resvgでPNGにする」の2段階だ。

## Astroのエンドポイントで画像を返す

サイトはAstroで作っている。`src/pages/blog/[slug]/og.png.ts` というエンドポイントを置き、記事ページと同じパスの一覧から画像を静的に生成している。

```ts
export const getStaticPaths = getBlogStaticPaths;

export const GET: APIRoute<{ entry: CollectionEntry<"blog"> }> = async ({
	props,
}) => {
	const { title, emoji, date } = props.entry.data;
	const png = await renderBlogOgImage(title, emoji, date);
	return new Response(png, {
		headers: { "Content-Type": "image/png" },
	});
};
```

記事ページとOG画像は1対1なので、`getStaticPaths` は記事ページと共通の関数を使っている。記事を追加すれば、OG画像も勝手に増える。

## JSXなしでsatoriを使う

satoriはJSXで書く例が多いけど、`{ type, props }` 形式のオブジェクトをそのまま渡しても動く。Reactを入れたくなかったので、オブジェクトで組んでいる。

```ts
{
	type: "div",
	props: {
		style: { display: "flex", fontSize: "56px" },
		children: title,
	},
}
```

少し冗長だけど、要素が数個のカードなので困ってはいない。

## ビルド時に外部サービスへアクセスしない

satoriにはフォントのバイナリを渡す必要があり、絵文字も画像として用意する必要がある。どちらもCDNから取ってくることもできるけど、それだとビルドが外部サービスの調子に左右される。

なので、フォントも絵文字もnpmパッケージに同梱されたファイルから読んでいる。

- フォント：`@expo-google-fonts/noto-sans-jp` のTTF
- 絵文字：`@twemoji/svg` のSVG

Twemojiのファイル名はコードポイントを `-` でつないだ形式（👋なら `1f44b.svg`）なので、絵文字の文字列からファイル名を組み立てる。異体字セレクタ（`U+FE0F`）の扱いに少しクセがあり、ZWJで結合した絵文字でなければ落とす必要がある。

収録されていない絵文字を指定すると、ファイルが見つからずビルドが落ちる。でも壊れるのはそのときだけで、ローカルやCIのビルドで気づけるので、それで良しとしている。

## 日本語タイトルの折り返し

一番ハマったのがここ。日本語には単語間のスペースがないので、そのまま描画すると「技術ス/タック」のように単語の途中で改行されてしまう。

そこでBudouXでタイトルを文節に区切り、文節ごとに `span` に分けて、`flexWrap: "wrap"` で並べるようにした。

```ts
function splitIntoPhrases(text: string): Element[] {
	return budouxParser
		.parse(text)
		.map((phrase) => ({ type: "span", props: { children: phrase } }));
}
```

これで、改行が文節の切れ目でしか起きなくなる。

ちなみにブラウザ向けには、ゼロ幅スペースを挟んで `word-break: keep-all` にするのが定番だ。でもsatoriでこれをやると、折り返されずに行幅をはみ出して描画されてしまった。

なお、flexでは `line-clamp` が効かないので、長いタイトルは `maxHeight` と `overflow: hidden` で3行までに切っている。

## Cloudflareでネイティブモジュールを動かす

サイトはCloudflareにデプロイしていて、Astroのビルド時の事前レンダリングはデフォルトでCloudflareのランタイム（workerd）で動く。でもresvg-jsはネイティブモジュールなので、workerdでは動かない。

全ページ静的に生成しているので、事前レンダリングをNodeで動かす設定にして回避した。

```js
adapter: cloudflare({
	prerenderEnvironment: "node",
}),
```

本来は「workerdで動かないコードをビルド時に検出できる」のがデフォルトの利点だけど、実行時に動くコードがないのでデメリットは実質ない。

## おわりに

記事を書くたびにOG画像を作るのは面倒なので、frontmatterに絵文字を1つ書くだけで済むのは楽だ。絵文字選びは地味に楽しい。
