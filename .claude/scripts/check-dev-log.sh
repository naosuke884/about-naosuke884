#!/bin/bash
# Stop hook: .astro/dev.log に前回チェック以降の新しいエラーがあれば
# exit 2 + stderr で Claude にフィードバックする
LOG=".astro/dev.log"
STATE=".astro/.claude-devlog-offset"

[ -f "$LOG" ] || exit 0

size=$(wc -c < "$LOG")
inode=$(stat -c %i "$LOG")

# 状態ファイル: inode:先頭ハッシュ対象バイト数:先頭ハッシュ:前回サイズ
last=0
last_inode=""
plen=0
phash=""
[ -f "$STATE" ] && IFS=: read -r last_inode plen phash last < "$STATE"
case "$last" in '' | *[!0-9]*) last=0 ;; esac
case "$plen" in '' | *[!0-9]*) plen=0 ;; esac

# ログが作り直されていたら先頭から読む。inodeは即座に再利用されうるので
# 先頭バイトのハッシュ比較でも検知する
if [ "$size" -lt "$last" ] || [ "$inode" != "$last_inode" ] ||
	[ "$(head -c "$plen" "$LOG" | cksum)" != "$phash" ]; then
	last=0
fi

plen=$((size < 256 ? size : 256))
phash=$(head -c "$plen" "$LOG" | cksum)
echo "$inode:$plen:$phash:$size" > "$STATE"
[ "$size" -le "$last" ] && exit 0

# wc実行後に追記された分は次回に回すため、size時点までしか読まない
errors=$(tail -c +"$((last + 1))" "$LOG" | head -c "$((size - last))" | grep '"level":"error"' | cut -c 1-500 | tail -n 5)
[ -z "$errors" ] && exit 0

{
	echo "Astro devサーバーのログ(.astro/dev.log)に新しいエラーが出ています:"
	echo "$errors"
} >&2
exit 2
