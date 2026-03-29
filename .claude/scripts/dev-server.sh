#!/bin/bash
# Start Astro dev server in background and log output
LOG_FILE="/tmp/astro-dev-server.log"
PID_FILE="/tmp/astro-dev-server.pid"

# Kill existing dev server if running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null
    sleep 1
  fi
fi

# Start dev server in background
cd "$(dirname "$0")/../.."
> "$LOG_FILE"
npm run dev > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
