#!/bin/bash
# Astro devサーバーを起動する。
# Astro 7のdevサーバーはデーモンとして起動し、ログは自身が .astro/dev.log に書く。
# 既に起動済みなら "already running" を表示して何もしない。
# 停止は `npx astro dev stop`。
# NOTE: npm run build を実行するとdevサーバーが停止する。
#       ビルド後は必ずこのスクリプトを再実行してdevサーバーを起動すること。
cd "$(dirname "$0")/../.."
npm run dev
