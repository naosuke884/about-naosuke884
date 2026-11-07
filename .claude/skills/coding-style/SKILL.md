---
name: coding-style
description: このリポジトリのコード方針（コンポーネント配置・スタイリング・クライアントJS・ファイルのコロケーション）。コンポーネント・スタイル・クライアントJSを書く/編集する前に必ず読む。
---

# コード方針

about-naosuke884 — 自己紹介サイト。Astro 6 + TypeScript、Cloudflare Pages（@astrojs/cloudflare）にデプロイ。

- ディレクトリはページ(feature)単位で分ける: トップページ専用は `src/home/`、ブログ専用は `src/blog/`、複数ルートで使う実績のあるものだけ `src/components/` に置く。`src/pages/` はルーティングのみ
- ページ内の複数セクションで共有するコンポーネントは、そのページのディレクトリ直下の `components/` に置く（例: `src/home/components/Section.astro`）
- コンポーネントは複数箇所で再利用する必要が出てから `src/components/` に切り出す。それまではページのディレクトリ（`src/home/` / `src/blog/`）にコロケーションして可読性を優先する
- スタイリングは素のCSSで書く（Tailwind・daisyUIなどのCSSフレームワークは使わない）。1か所でしか使わないスタイルは使用元の `.astro` のスコープド `<style>` に書く
- `src/styles/` には `global.css` のみ置く。中身はテーマの色（`--color-*`）とトークン（`--text-*` など）、リセット、要素の既定スタイル、複数のコンポーネントで共有するクラス（`.text-heading`、`.btn`、`.row-list` など）に限る
- 色・文字サイズ・角丸は `global.css` のCSS変数を使い、値を直書きしない。テキストのトーンは `--color-base-content`（見出し）と `--color-muted`（本文・補足）の2段
- 子コンポーネント（`<Image>` やSVGのimportなど）が出力する要素はスコープが付かないため、`:global()` で当てる
- JSで見た目を切り替えるときはクラスではなく `data-*` 属性を付け外しし、見た目はCSS側で属性セレクタに当てる
- `.astro` ファイルの `<script>` タグにロジックを直書きしない。クライアントJSは `.ts` ファイルに切り出してコロケーションし、`<script>` 内は import と関数呼び出しのみにする（Biomeはscriptタグ内を処理できないため）
- クライアントJSやSVGアイコンなどの関連ファイルは使用元の `.astro` とコロケーションする。関連ファイルが1〜2個なら同じディレクトリに `<使用元名>-<内容>.ts` のようにprefix付きで置き（例: `sections/books-carousel-dots.ts`）、増えてきたら使用元ごとのディレクトリを掘ってまとめる（例: `components/section/` に `Section.astro` / `copy-link.ts` / `check.svg`。ディレクトリ内ではprefix不要）
