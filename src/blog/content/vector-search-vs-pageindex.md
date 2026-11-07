---
title: ベクトル検索RAGとツリー検索RAGを比較してみた
date: 2026-11-07
description: ベクトル検索を使ったRAGと、LLMに文書の目次ツリーを上からたどらせるツリー検索RAGを、検索性能・料金・速度で比較してみた。
emoji: 🔍
toc: true
---

ベクトル検索RAGとツリー検索RAGをローカル環境で実装して比較してみた。その結果と感想をまとめる。

なお、今回比較したのは**検索部分だけ**で、回答の正しさは評価していない。

以下を前提知識とする。

- [RAGの概要](https://naosuke884.github.io/blog/rag-overview.html)
- [ベクトル検索RAG vs ツリー検索RAG](https://naosuke884.github.io/blog/vector-rag-vs-tree-rag.html)

## 比較手法

比較する手法は以下の3つ。

**ベクトル**  
各ページを600文字前後のチャンクに分ける（前のチャンクと150文字重ねる）。各チャンクをベクトル空間に埋め込み、PostgreSQLのpgvectorに保存する。検索では、質問の埋め込み表現に近いチャンクを8件取得し、そのチャンクがあるページの全文を回答LLMに渡す。一般的なRAGの検索手法。インデックスは張らず、フルスキャンで検索した。

**ツリー**  
[PageIndex](https://pageindex.ai/)のOSS版で、資料ごとに目次の木構造を作り、各節に要約を持たせる。検索では、LLMにツリーを上から1段ずつたどらせて読む節を選ばせ、その節のページ（最大10ページ）を回答LLMに渡す。

**ベクトル（Jevリランキング）**  
1つ目の手法（ベクトル）の亜種。検索では、質問の埋め込み表現に近いチャンクを8件ではなく30件と広めに取る。その30件について、[Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)に「このチャンクに質問の答えが書かれているか」を確率で判定させ、その確率の高い順に並べ替える（リランク）。上位8件のチャンクがあるページを回答LLMに渡す。

ベンチマークにはオープンソースのデータセット[Allganize RAG-Evaluation-Dataset-JA](https://huggingface.co/datasets/allganize/RAG-Evaluation-Dataset-JA)を使った。金融・情報通信・製造・公共・流通小売の5業種の日本語PDFで、問題は300問ある。PDFが開けないなどの問題があったものを省いて、実際に利用した問題は**249問**。

利用したAIモデルは以下の表の通り。

| いつ | 処理 | ベクトル | ツリー | ベクトル（Jevリランキング） |
|---|---|---|---|---|
| 事前準備 | 検索用データの作成 | [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large)（チャンクを埋め込む） | [Claude Haiku 5.5](https://platform.claude.com/docs/en/about-claude/models/overview)（資料ごとに目次ツリーを作る） | [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large)（チャンクを埋め込む） |
| 質問のたび | 候補を集める | [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large)（近いチャンク8件） | [Claude Sonnet 5.5](https://platform.claude.com/docs/en/about-claude/models/overview)（ツリーを1段ずつたどって節を最大5つ選ぶ。1問あたり平均2.8回呼び出す） | [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large)（近いチャンク30件） |
| 質問のたび | 絞り込む | － | － | [Jev](https://typesafe.ai)（30件を判定して上位8件） |

## 結果

| 指標 | ベクトル | ツリー | ベクトル（Jevリランキング） |
|---|---|---|---|
| 正解ページを検索で取得できた割合 | 92% | 85% | **94%** |
| 検索のAPI料金（1問あたり） | **$0.00001** | $0.022 | $0.0007 |
| 検索にかかった時間（中央値） | **0.15秒** | 8.3秒 | 0.41秒 |
| 検索にかかった時間（95%の質問が収まる時間） | **0.32秒** | 15.1秒 | 0.67秒 |
| 1問あたりに取得したページ数（平均） | 5.2 | 5.3 | 4.9 |

## 感想

ツリーは期待したほどではなかった。API料金と検索時間が他よりかかるのは想定通りだったが、正解ページの取得率でもベクトルより7ポイント（約17問ぶん）低かったのは想定外だった。

取り逃した問題で一番多かったのは、正解の資料までは行けたのに別の節に進んでしまったケース。上の段の見出しや要約だけを見て枝を絞るので、早い段で正解の枝を捨てると戻れない。

ベクトル（Jevリランキング）とベクトルの差は+2ポイント（約5問ぶん）と小さかった。ただし中身を見ると、正解ページを取れるようになった問題が6問、取れなくなった問題は0問と、一方的に効いていた。料金もほとんどかからないので、**個人的には、ベクトル（Jevリランキング）がRAG実装の第一候補になりそう。**

今回の実験だけで、ベクトル検索RAGとツリー検索RAGの優劣が決まるわけではない。ツリーのノードの定義の仕方、データセットの性質、使用するLLMなどによって結果は変わるだろう。
