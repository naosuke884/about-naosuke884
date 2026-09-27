---
title: TypeScriptでDBファーストな技術スタックを組む
date: 2026-09-27
description: dbmate・kysely-codegen・Kysely・DBのViewを組み合わせて、SQLのスキーマを正としてTypeScriptの型を作る構成について。
emoji: 🗄️
---

## はじめに

TypeScriptでDBを扱うとき、PrismaやDrizzleのようにTypeScript側でスキーマを書く方法がよく使われる。

しかし、以下のように素のSQLでDBのスキーマを定義したいというケースがある。

- 複数サービス間で単一のDBスキーマを共有したい
- DB固有の記法を使いたい

PrismaやDrizzleにもDBからスキーマを取り込む機能はある。ただ、取り込んだ先はPrismaのスキーマファイルやTypeScriptのコードで、アプリはそちらを正として動く。SQLで書いたスキーマを正にしたいなら、DBから直接型を作るほうが素直だ。

TypeScriptで、このDBファーストなニーズに応えるための技術スタックをAIに聞きながら調べて整理した。実際に組んで試したわけではなく、調べた範囲でのまとめになる。DBはPostgreSQLを前提にしている。以下の4つの要素を組み合わせるのが良さそうだ。

- [dbmate](https://github.com/amacneil/dbmate)：マイグレーション
- [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen)：DBから型を生成
- [Kysely](https://kysely.dev/)：型安全なクエリビルダー
- DBのView：DB固有の機能を使う読み取りクエリを置く

## 構成

流れはこう。

1. dbmateでSQLのマイグレーションを書いて適用する
1. kysely-codegenが、適用後のDBを読んで型を生成する
1. Kyselyがその型を使ってクエリを型チェックする

型の元は常に実際のDBなので、マイグレーションのたびに型を再生成していればスキーマと型がずれない。

### dbmate：マイグレーションを素のSQLで書く

dbmateはGo製のマイグレーションツールで、特定の言語やORMに依存しない。マイグレーションはただのSQLファイルで、`-- migrate:up` と `-- migrate:down` で上げる処理と戻す処理を書く。

```sql
-- migrate:up
create table users (
  id bigint generated always as identity primary key,
  name text not null
);

create table posts (
  id bigint generated always as identity primary key,
  user_id bigint not null references users (id),
  title text not null,
  published_at timestamptz
);

-- migrate:down
drop table posts;
drop table users;
```

SQLで書くので、制約やインデックス、Viewなど、DBの機能をそのまま使える。

また、dbmateはマイグレーションを適用するたびに、その時点のスキーマ全体を `db/schema.sql` に書き出す（PostgreSQLでは `pg_dump` を使う）。これをコミットしておけば、マイグレーションを順に追わなくても今のスキーマをSQLのまま読めるし、スキーマの変更もこのファイルのdiffとしてレビューできる。

### kysely-codegen：DBから型を作る

Kyselyは型を自分では生成しない。[公式ドキュメント](https://kysely.dev/docs/generating-types)でも、型の生成にはkysely-codegenなどの外部ツールを使うよう案内されている。

kysely-codegenは、接続したDBのテーブルやカラムを読み取り、Kysely用の型定義を出力する。

```sh
kysely-codegen --out-file src/db/types.ts
```

dbmateもkysely-codegenも接続先を環境変数 `DATABASE_URL` から読むので、`DATABASE_URL` を一つ設定しておけば両方が同じDBを見る。マイグレーションと型生成はセットで実行するようにしておく。

```json
{
  "scripts": {
    "db:migrate": "dbmate up && kysely-codegen --out-file src/db/types.ts"
  }
}
```

`dbmate rollback` でマイグレーションを戻したときも、同じように型を再生成する。

CIでは `--verify` を付けて実行し、コミットされた型が最新かを確かめるとよい。

```sh
kysely-codegen --out-file src/db/types.ts --verify
```

### Kysely：型安全にSQLを書く

KyselyはORMではなくクエリビルダーで、`selectFrom` や `where` のようにSQLの句に対応したメソッドを並べて書く。生成した型を渡すと、テーブル名やカラム名、結果の型がチェックされる。

```ts
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "./types";

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});

const posts = await db
  .selectFrom("posts")
  .select(["id", "title"])
  .where("published_at", "is not", null)
  .execute();
// posts: { id: string; title: string }[]
```

`id` が `string` になっているのは、PostgreSQL用のドライバ（pg）が `bigint` をJavaScriptの `number` の範囲に収まらない可能性があるものとして文字列で返すため。kysely-codegenの型もそれに合わせている。

存在しないカラムを書けばコンパイルエラーになる。スキーマを変えて型を再生成すれば、影響するクエリも型エラーとして見つかる。

### DBのView：DB固有の機能を使う読み取りをSQLに逃がす

クエリが複雑になるのはたいてい読み取りで、書き込みでクエリビルダーに困ることは少ない。

KyselyはCTE（`.with()`）やウィンドウ関数（`.over()`）にも対応していて、大抵のクエリは書ける。DB固有の関数も `eb.fn` で呼べて、引数のカラム名は型チェックされる。ただ、型付きのヘルパーが用意されているのは `count` や `sum` などの汎用的な関数だけで、`date_trunc` のようなDB固有の関数は、戻り値の型を手で書くことになる。

```ts
import { sql } from "kysely";

const months = await db
  .selectFrom("posts")
  .select((eb) =>
    eb.fn<Date>("date_trunc", [sql.lit("month"), "published_at"]).as("month"),
  )
  .execute();
```

`<Date>` は手で書いた型なので、DBの実際の型と合っているかは検証されない。また、`eb.fn` の引数に文字列を渡すとカラム名として扱われるため、`'month'` のような値は `sql.lit` で包む必要がある。

こうした手書きの型がアプリのコードに散らばると、DBから型を作っている意味が薄れる。なので、DB固有の関数に頼る読み取りクエリは、最初から素のSQLでViewとして定義しておく。Viewにしておけば、関数の結果の型もDBが決め、kysely-codegenがそれを型にする。

たとえば「ユーザーごとの直近12か月の月別公開記事数（記事がない月も0件として含める）」は、PostgreSQLの `generate_series` で月の一覧を作るとこう書ける。

```sql
-- migrate:up
create view monthly_post_counts as
select
  u.id as user_id,
  m.month,
  count(p.id) as post_count
from users u
cross join generate_series(
  date_trunc('month', (now() at time zone 'Asia/Tokyo') - interval '11 months'),
  date_trunc('month', now() at time zone 'Asia/Tokyo'),
  interval '1 month'
) as m (month)
left join posts p
  on p.user_id = u.id
  and date_trunc('month', p.published_at at time zone 'Asia/Tokyo') = m.month
group by u.id, m.month;

-- migrate:down
drop view monthly_post_counts;
```

`at time zone 'Asia/Tokyo'` を付けているのは、`timestamptz` のまま `date_trunc` すると、月の区切りが接続ごとのタイムゾーン設定（`TimeZone`）で変わってしまうため。複数のサービスから同じViewを読むなら、タイムゾーンはView側で固定しておくほうが結果がぶれない。

この構成とViewの相性がいいのは、kysely-codegenがViewも読み取って型を作るから。`month` の型も、`generate_series` の結果の型からDBが決めたものが生成される。DB固有の部分はSQLに任せつつ、アプリからはテーブルと同じようにKyselyで型チェックしながら扱える。

```ts
const counts = await db
  .selectFrom("monthly_post_counts")
  .innerJoin("users", "users.id", "monthly_post_counts.user_id")
  .select([
    "users.name",
    "monthly_post_counts.month",
    "monthly_post_counts.post_count",
  ])
  .orderBy("monthly_post_counts.month")
  .execute();
// counts: { name: string; month: Date | null; post_count: string | null }[]
```

ただし、Viewの型にはテーブルと違う点が一つある。PostgreSQLはViewのカラムに `NOT NULL` の情報を持たないため、kysely-codegenが生成するViewのカラムの型はすべて `| null` 付きになる。元のテーブルで `not null` のカラムでも、Viewを通すとnullableとして扱われる。

kysely-codegenには `--overrides` でカラムごとに型を上書きする機能もあるが、上書きした型はDBと照合されないので、Viewの定義を変えたときにずれても気づけない。nullableな型は「DBがNULLにならないことを保証していない」という事実をそのまま表しているので、手で書き換えずに呼び出し側でnullを扱う。

また、`post_count` が `string` なのは `count` の結果が `bigint` だから。数値で受け取りたければ、Viewの側で `count(p.id)::int` のようにキャストしておけば `number` になる。

Viewにはもう一つ利点がある。クエリがDBの中にあるので、同じDBを使う別のサービスからもそのまま使える。冒頭に挙げた「複数サービス間で単一のDBスキーマを共有したい」というケースでは、読み取りのロジックもサービスごとに書き直さずに共有できる。

普段のクエリはKyselyで書き、DB固有の機能が要る読み取りだけViewに逃がす、という使い分けにしておくと、アプリのコードに手書きの型を持ち込まずに済む。

## まとめ

- スキーマはdbmateで素のSQLとして書く
- 型はkysely-codegenで実際のDBから生成する
- クエリはKyselyで、SQLに近い書き味のまま型チェックする
- DB固有の機能を使う読み取りはViewに逃がし、それも型になる（ただしカラムはnullable）

DBを正にしておくと、DBの機能をそのまま使えて、型もずれない。ORMのやり方に合わせてDBを設計するのではなく、DBを先に決めてアプリをそれに合わせる、という考え方で組んだ構成。
