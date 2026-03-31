#!/bin/bash
# mainに戻り、マージ済みブランチをすべて削除する

git checkout main && git pull && git branch --merged main | grep -v '^\* main$' | grep -v '^  main$' | xargs -r git branch -d
