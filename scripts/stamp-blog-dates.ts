// pre-commit(lefthook.yml)から呼ばれ、コミットするブログ記事のfrontmatterに日付を書き込む。
// 新しく追加する記事は date(公開日)を、変更した記事は updated(更新日)を今日にする。
// 書き始めた日のまま公開したり、更新日を書き忘れたりしないよう、手で書かせずコミット時に決める。
// git logからビルド時に読む方式にしなかったのは、デプロイ先のビルドが浅いcloneだと履歴が取れないため
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CONTENT_DIR = "src/blog/content/";

// コンテナや CI の TZ は UTC のことがあるため、日本時間の日付に固定する
const today = new Intl.DateTimeFormat("sv-SE", {
	timeZone: "Asia/Tokyo",
}).format(new Date());

const staged = execFileSync(
	"git",
	["diff", "--cached", "--name-status", "--no-renames", "--", CONTENT_DIR],
	{ encoding: "utf8" },
)
	.split("\n")
	.filter(Boolean)
	.map((line) => {
		const [status, path] = line.split("\t");
		return { status, path };
	})
	.filter(({ path }) => path.endsWith(".md"));

for (const { status, path } of staged) {
	if (status !== "A" && status !== "M") continue;

	const text = readFileSync(path, "utf8");
	const match = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!match) continue;
	const frontmatter = match[1];

	let next: string;
	if (status === "A") {
		next = setField(frontmatter, "date", today);
	} else {
		// 公開した当日の手直しは更新として扱わない
		if (getField(frontmatter, "date") === today) continue;
		next = setField(frontmatter, "updated", today);
	}
	if (next === frontmatter) continue;

	writeFileSync(path, text.replace(frontmatter, next));
	console.log(`${path}: ${status === "A" ? "date" : "updated"} を ${today} にしました`);
}

function getField(frontmatter: string, key: string): string | undefined {
	return frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1].trim();
}

// 既存の行は置き換え、無ければdateの直後(updated)か末尾(date)に足す
function setField(frontmatter: string, key: string, value: string): string {
	const line = `${key}: ${value}`;
	const pattern = new RegExp(`^${key}:.*$`, "m");
	if (pattern.test(frontmatter)) return frontmatter.replace(pattern, line);
	if (key === "updated" && /^date:.*$/m.test(frontmatter)) {
		return frontmatter.replace(/^date:.*$/m, (dateLine) => `${dateLine}\n${line}`);
	}
	return `${frontmatter}\n${line}`;
}
