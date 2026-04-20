#!/bin/bash
chmod +x /home/jackson21/bin/kiosk.sh
pkill -9 -f chromium 2>/dev/null
pkill -f kiosk.sh 2>/dev/null
sleep 2
nohup /home/jackson21/bin/kiosk.sh >/tmp/kiosk-launcher.log 2>&1 &
disown
sleep 5
pgrep -af chromium | head -2
echo DONE
exit 0
