# CLAUDE.md

## プロジェクト概要

about-me — 自己紹介サイト。

## ブランチ戦略

- 基本はmainに直接コミットしてpushする
- コミットは意味のある単位に分ける（機能追加・修正・雑務を1コミットに混ぜない）
- レビューしたい大きめの変更のみブランチを切ってPRを送り、**Squash merge** でマージする

### ブランチ命名規則（PRを送る場合）

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
- UIはdaisyUIのコンポーネントクラス（avatar, badge, card, menu など）を積極的に使う。素のTailwindだけで同等のUIを組むのは、daisyUIに該当コンポーネントがない場合のみ