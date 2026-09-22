# about-naosuke884

ソフトウェアエンジニア Hayashi Naoki の自己紹介サイトです。自己紹介・作ったもの・読んだ本と、ブログを載せています。

https://hayashi-naoki.com

## 技術スタック

- [Astro](https://astro.build/) + TypeScript(全ページ静的生成)
- [Tailwind CSS](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)(`@astrojs/cloudflare`)で配信
- ブログ記事の OG 画像は satori + resvg でビルド時に生成
- Lint・フォーマットは [Biome](https://biomejs.dev/)、pre-commit フックは lefthook

## 開発

Node.js 22.12 以上が必要です。

```sh
npm install
npm run dev      # 開発サーバー(http://localhost:4321)
npm run build    # 本番ビルド(dist/ に出力)
npm run preview  # ビルド結果のプレビュー
```

### チェック

```sh
npm run check      # Biome(lint + フォーマット)
npm run check:fix  # Biome の自動修正
npx astro check    # 型チェック
```

コミット時には lefthook で Biome と `astro check` が実行されます。CI では加えてビルドまで確認します。

## ディレクトリ構成

ページ(feature)単位でディレクトリを分け、そのページでしか使わないコンポーネント・クライアント JS・画像などは使用元の近くに置く(コロケーション)方針です。

```
src/
├── pages/       # ルーティングのみ
├── home/        # トップページ専用
│   ├── components/  # トップページの複数セクションで共有するもの
│   └── sections/    # セクションごと(about / works / books)にコンポーネント・データ・JSをまとめる
├── blog/        # ブログ専用(記事の Markdown は blog/content/、OG 画像生成など)
├── components/  # 複数ページで使うコンポーネント
├── layouts/     # 共通レイアウト(ヘッダー・フッター)
├── assets/      # 複数ページで使う画像
└── styles/      # global.css のみ(テーマ・タイポグラフィのトークン)
```

## ブログ記事の追加

`src/blog/content/` に Markdown を置くと `/blog/<ファイル名>/` として公開されます。frontmatter の項目は `src/content.config.ts` を参照してください。

```md
---
title: 記事タイトル
date: 2026-01-01
description: 検索結果やシェア時に出る記事の説明文
emoji: 📝 # 省略可。OG 画像に載せる絵文字
externalUrl: https://example.com # 省略可。外部の記事を紹介する場合のリンク先
---
```
