---
title: TypeScriptでDBファーストな技術スタックを組む
date: 2026-09-27
description: dbmate・kysely-codegen・Kysely・DBのViewを組み合わせて、SQLのスキーマを正としてTypeScriptの型を作る構成について。
emoji: 🗄️
---

TypeScriptでDBを扱うなら、PrismaやDrizzleを使ってTypeScript側でスキーマを書くのが定番だ。

ただ、これが合わない場面もある。

**スキーマは素のSQLで書きたい。** 複数のサービスで1つのDBスキーマを共有したいときや、DB固有の記法を使いたいときがそうだ。

**クエリもSQLに近い形で書きたい。** Prismaの `findMany({ where: ... })` のようなORM独自のAPIは、SQLを隠してくれる代わりに、実際にどんなSQLが発行されるのかが見えにくい。SQLの句の順にメソッドを並べるクエリビルダーなら、コードを読めば発行されるSQLがわかる。

この2つを満たす技術スタックを、AIに聞きながら調べた（実際に組んではいない）。DBはPostgreSQLを前提にしている。

行き着いたのは、次の4つの組み合わせだ。

- [dbmate](https://github.com/amacneil/dbmate)：マイグレーション
- [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen)：DBから型を生成
- [Kysely](https://kysely.dev/)：型安全なクエリビルダー
- DBのView：DB固有の機能を使う読み取りクエリを置く

先にDBを決めて、アプリをそれに合わせる構成だ。全体の流れは次のとおり。

1. dbmateでSQLのマイグレーションを書いて適用する
1. kysely-codegenが、適用後のDBを読んで型を生成する
1. Kyselyがその型を使ってクエリを型チェックする

型はいつも実際のDBから作られる。マイグレーションのたびに型を作り直していれば、スキーマと型がずれることはない。

## dbmate：マイグレーションを素のSQLで書く

dbmateは言語やORMに依存しないマイグレーションツールだ。マイグレーションはただのSQLファイルとして書く。

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

SQLで書くので、制約・インデックス・ViewといったDBの機能をそのまま使える。

また、dbmateは適用のたびにスキーマ全体を `db/schema.sql` に書き出す。これをコミットしておけば、今のスキーマをSQLのまま読めて、変更もdiffでレビューできる。

## kysely-codegen：DBから型を作る

Kyselyは自分では型を生成しないので、kysely-codegenを使う。接続したDBを読み取り、Kysely用の型定義を出力するツールだ。

```sh
kysely-codegen --out-file src/db/types.ts
```

dbmateもkysely-codegenも接続先を環境変数 `DATABASE_URL` から読むので、両方が同じDBを見る。マイグレーションと型生成はセットで実行する。

```json
{
  "scripts": {
    "db:migrate": "dbmate up && kysely-codegen --out-file src/db/types.ts"
  }
}
```

## Kysely：型安全にSQLを書く

Kyselyは、`selectFrom` や `where` のようにSQLの句に対応したメソッドを並べて書くクエリビルダーだ。生成した型を渡すと、テーブル名・カラム名・結果の型がチェックされる。

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
  .select(["title"])
  .where("published_at", "is not", null)
  .execute();
// posts: { title: string }[]
```

スキーマを変えて型を作り直せば、影響を受けるクエリは型エラーとして見つかる。

## DBのView：DB固有の機能を使う読み取りをSQLに逃がす

KyselyでもDB固有の関数は `eb.fn` で呼べる。ただ、戻り値の型は手書きになる。

```ts
import { sql } from "kysely";

const months = await db
  .selectFrom("posts")
  .select((eb) =>
    eb.fn<Date>("date_trunc", [sql.lit("month"), "published_at"]).as("month"),
  )
  .execute();
```

この `<Date>` はDBと照合されない。こうした手書きの型が増えると、DBから型を作る意味が薄れる。

そこで、DB固有の関数を使う読み取りは、素のSQLでViewにしておく。kysely-codegenはViewも読み取るので、関数の結果の型もDBから生成される。

例として、ユーザーごとの直近12か月の月別記事数を出すViewを作る。

```sql
-- migrate:up
create view monthly_post_counts as
select
  u.id as user_id,
  m.month,
  count(p.id)::int as post_count
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

アプリからは、テーブルと同じようにKyselyで型チェックしながら使える。

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
// counts: { name: string; month: Date | null; post_count: number | null }[]
```

ただし、Viewのカラムの型はすべて `| null` 付きになる。PostgreSQLがViewのカラムの `NOT NULL` を把握していないためだ。`--overrides` で型を上書きする手もあるが、上書きした型はDBと照合されないので、nullは呼び出し側で扱う。

Viewにはもう1つ利点がある。クエリがDBの中にあるので、同じDBを使う別のサービスからもそのまま使える。

普段のクエリはKyselyで書き、DB固有の機能が要る読み取りだけをViewに逃がす。こう使い分けておけば、アプリのコードに手書きの型を持ち込まずに済む。
