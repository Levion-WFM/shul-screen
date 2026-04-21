#!/bin/bash
# Polls shul-screen API for reloadNonce changes and hard-kills chromium when it
# changes. kiosk.sh's respawn loop then relaunches chromium against the live URL,
# which fetches the latest deploy from Vercel.
#
# Install (run once on the Pi):
#   mkdir -p /home/jackson21/bin
#   install -m 755 reload-watcher.sh /home/jackson21/bin/reload-watcher.sh
#   mkdir -p /home/jackson21/.config/systemd/user
#   install -m 644 reload-watcher.service /home/jackson21/.config/systemd/user/reload-watcher.service
#   systemctl --user daemon-reload
#   systemctl --user enable --now reload-watcher
#
# Troubleshoot:
#   journalctl --user -u reload-watcher -f
#   cat /home/jackson21/.cache/reload-nonce

set -u

URL="${KIOSK_API_URL:-https://shul-screen2.vercel.app/api/get-data}"
STATE_FILE="${KIOSK_NONCE_FILE:-/home/jackson21/.cache/reload-nonce}"
POLL_SECS="${KIOSK_POLL_SECS:-30}"

mkdir -p "$(dirname "$STATE_FILE")"

extract_nonce() {
    # Pull reloadNonce out of the JSON response. Handles numeric, string, and null.
    # Returns empty string on any failure.
    grep -oE '"reloadNonce"[[:space:]]*:[[:space:]]*[^,}]+' \
        | head -1 \
        | sed -E 's/.*:[[:space:]]*//; s/[[:space:]]*$//; s/^"//; s/"$//'
}

echo "[reload-watcher] polling $URL every ${POLL_SECS}s"

while true; do
    # -sS: silent but show errors; -m 10: 10s timeout; --retry 2 for flaky wifi
    resp=$(curl -sS -m 10 --retry 2 "$URL" 2>/dev/null || true)
    if [ -n "$resp" ]; then
        nonce=$(printf '%s' "$resp" | extract_nonce)
        if [ -n "$nonce" ] && [ "$nonce" != "null" ]; then
            last=""
            [ -f "$STATE_FILE" ] && last=$(cat "$STATE_FILE" 2>/dev/null || true)
            if [ -z "$last" ]; then
                # First observation — seed without restart.
                printf '%s' "$nonce" > "$STATE_FILE"
                echo "[reload-watcher] seeded nonce=$nonce"
            elif [ "$last" != "$nonce" ]; then
                echo "[reload-watcher] nonce changed $last -> $nonce, killing chromium"
                printf '%s' "$nonce" > "$STATE_FILE"
                pkill -9 -f chromium || true
            fi
        fi
    fi
    sleep "$POLL_SECS"
done
