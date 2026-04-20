#!/usr/bin/env bash
# Shul TV kiosk — bulletproof launcher
# Key fixes vs prior version:
#  - Fresh --user-data-dir in /tmp each boot (no profile corruption carries over)
#  - No --incognito (broke in Chromium 147: "Requested load of chrome://newtab/ for incorrect profile type")
#  - --app= instead of --kiosk URL (hard-binds URL, can't be overridden by NTP)
#  - Logs to /tmp/kiosk.log for post-mortem

export DISPLAY="${DISPLAY:-:0}"
URL="https://shul-screen2.vercel.app/"

unclutter -idle 0.5 -root &
xset s off     2>/dev/null || true
xset -dpms     2>/dev/null || true
xset s noblank 2>/dev/null || true

rm -rf /tmp/chromium-kiosk-* 2>/dev/null
PROFILE_DIR="/tmp/chromium-kiosk-$$"
mkdir -p "$PROFILE_DIR"

LOG="/tmp/kiosk.log"
: > "$LOG"

while true; do
  echo "[$(date -Iseconds)] launching chromium" >> "$LOG"
  chromium \
    --user-data-dir="$PROFILE_DIR" \
    --password-store=basic \
    --use-mock-keychain \
    --no-sandbox \
    --test-type \
    --disable-dev-shm-usage \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI \
    --no-first-run \
    --start-fullscreen \
    --check-for-update-interval=31536000 \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    --app="$URL" \
    >> "$LOG" 2>&1
  echo "[$(date -Iseconds)] chromium exited code=$?" >> "$LOG"
  sleep 3
done
