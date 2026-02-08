#!/usr/bin/env bash
set -euo pipefail

: "${DOGHEAD_ADVISOR_APPID:?Missing DOGHEAD_ADVISOR_APPID}"
: "${DOGHEAD_ADVISOR_APPSECRET:?Missing DOGHEAD_ADVISOR_APPSECRET}"

resp="$(curl -s "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${DOGHEAD_ADVISOR_APPID}&secret=${DOGHEAD_ADVISOR_APPSECRET}")"

# 检查是否返回 error
if echo "$resp" | grep -q '"errcode"'; then
  echo "Error: $resp" >&2
  exit 1
fi

echo "$resp"
