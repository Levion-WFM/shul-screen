#!/bin/bash
# Run this on the Pi once to install the reload watcher.
# Assumes reload-watcher.sh and reload-watcher.service are in the same dir as this script.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p /home/jackson21/bin
install -m 755 "$HERE/reload-watcher.sh" /home/jackson21/bin/reload-watcher.sh
mkdir -p /home/jackson21/.config/systemd/user
install -m 644 "$HERE/reload-watcher.service" /home/jackson21/.config/systemd/user/reload-watcher.service

# Let user services run at boot without a login session
sudo loginctl enable-linger jackson21 || true

systemctl --user daemon-reload
systemctl --user enable --now reload-watcher

echo "---"
systemctl --user status reload-watcher --no-pager | head -15
