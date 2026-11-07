---
title: Claude Codeの/voiceを使ってみた
date: 2026-11-08
description: Handyで音声入力をしていたけど誤検出が多かった。Claude Code内蔵の/voiceを使ったら割とうまくいった。
emoji: 🎤
---

[音声入力アプリのHandy](/blog/handy)で音声入力をしていたけど、どうしても誤検出が多かった。滑舌の問題もあるけど、Handyは何の話をしているかという文脈を知らないので、技術用語やリポジトリ名が別の単語に化けてしまう。

そこでClaude Code内蔵の `/voice` を使ってみたら、割とうまくいった。`/voice` でオンにして、スペースキーを押しながら話すだけ。

## /voiceの実装でわかっていること

[公式ドキュメント](https://code.claude.com/docs/en/voice-dictation)などからわかるのはこのあたり。

- 音声はAnthropicのサーバーに送って文字に起こす（ローカルでは処理しない）
- 開発用語に寄せて調整されている
- プロジェクト名とgitのブランチ名を、認識のヒントとして自動で渡している
- claude.aiのアカウントでのログインが必要

文脈のヒントを渡しているのが、Handyとの一番の違いだと思う。

## 他のADEの音声入力の対応状況

2026年11月時点で、公式ドキュメントや変更履歴から確認できた範囲。

| ツール | 音声入力 | 文脈を使うか |
| --- | --- | --- |
| [Claude Code](https://code.claude.com/docs/en/voice-dictation) | ○ | ○ プロジェクト名・ブランチ名 |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/voice-input) | ○ | × |
| [VS Code + Copilot Chat](https://code.visualstudio.com/docs/configure/accessibility/voice) | ○ | △ |
| [Gemini CLI](https://geminicli.com/docs/changelogs/) | ○ | 記載なし |
| [Kiro CLI](https://kiro.dev/docs/cli/voice/) | ○ | ○ 直近の会話 |
| [Google Antigravity](https://antigravity.google/docs/voice-mode/) | ○ | ○ 画面とチャット履歴 |
| [Cursor](https://cursor.com/changelog/3-1) | ○ | 記載なし |
| [Cline](https://cline.bot/blog/cline-3-38) | ○ | 記載なし |
| [OpenAI Codex CLI](https://github.com/openai/codex/releases) | △ 音声会話のみ | 記載なし |
| [Zed](https://github.com/zed-industries/zed/issues/16410) | × | - |

こんな便利機能に今まで気づかなかったなんて、なんて情弱なんだ...。
