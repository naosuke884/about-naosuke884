# CLAUDE.md

## プロジェクト概要

about-me — 自己紹介サイト。

## ブランチ戦略

- 機能ごとにブランチを切り、mainにPRを送る
- PRは **Squash merge** でマージする
- mainへの直コミットは許可（typo修正、CLAUDE.md更新など軽微な変更）

### ブランチ命名規則

- `feat/<内容>` — 機能追加
- `fix/<内容>` — バグ修正
- `chore/<内容>` — CI、設定、依存関係など雑務

## コミットメッセージ

- 日本語で書く

## 技術スタック

- **フレームワーク**: Astro 6
- **デプロイ先**: Cloudflare Pages（@astrojs/cloudflare）
- **言語**: TypeScript

## コード方針

- コンポーネントは複数箇所で再利用する必要が出てから `src/components/` に切り出す。それまではページ内にコロケーションして可読性を優先する
- `src/styles/` には `global.css` のみ置く。スタイリングはTailwindのユーティリティクラスとAstroのスコープド `<style>` で完結させる