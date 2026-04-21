#!/bin/bash
echo "==RESOLUTION=="
DISPLAY=:0 xrandr 2>&1 | head -20
echo "==CONFIG_TXT_HDMI=="
grep -E "^hdmi|^disable_overscan|^config_hdmi|^dtoverlay|^framebuffer" /boot/firmware/config.txt 2>&1
echo "==TV_MODE=="
DISPLAY=:0 xrandr | grep -E "\*|connected" | head -5
exit 0
