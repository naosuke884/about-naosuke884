---
name: coding-style
description: このリポジトリのコード方針（コンポーネント配置・スタイリング・クライアントJS・ファイルのコロケーション）。コンポーネント・スタイル・クライアントJSを書く/編集する前に必ず読む。
---

# コード方針

about-naosuke884 — 自己紹介サイト。Astro 6 + TypeScript、Cloudflare Pages（@astrojs/cloudflare）にデプロイ。

- ディレクトリはページ(feature)単位で分ける: トップページ専用は `src/home/`、ブログ専用は `src/blog/`、ページ横断で使うものだけ `src/components/` に置く。`src/pages/` はルーティングのみ
- コンポーネントは複数箇所で再利用する必要が出てから `src/components/` に切り出す。それまではページのディレクトリ（`src/home/` / `src/blog/`）にコロケーションして可読性を優先する
- `src/styles/` には `global.css` のみ置く。スタイリングはTailwindのユーティリティクラスとAstroのスコープド `<style>` で完結させる
- UIはdaisyUIのコンポーネントクラス（avatar, badge, card, menu など）を積極的に使う。素のTailwindだけで同等のUIを組むのは、daisyUIに該当コンポーネントがない場合のみ
- `.astro` ファイルの `<script>` タグにロジックを直書きしない。クライアントJSは `.ts` ファイルに切り出してコロケーションし、`<script>` 内は import と関数呼び出しのみにする（Biomeはscriptタグ内を処理できないため）
- クライアントJSやSVGアイコンなどの関連ファイルは使用元の `.astro` とコロケーションする。関連ファイルが1〜2個なら同じディレクトリに `<使用元名>-<内容>.ts` のようにprefix付きで置き（例: `sections/books-carousel-dots.ts`）、増えてきたら使用元ごとのディレクトリを掘ってまとめる（例: `components/section/` に `Section.astro` / `copy-link.ts` / `check.svg`。ディレクトリ内ではprefix不要）
