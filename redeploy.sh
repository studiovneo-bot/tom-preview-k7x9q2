#!/bin/bash
# tOM 스테이징 재배포 — 본선(tom-proto) 최신본을 스테이징에 반영
# 사용: bash redeploy.sh
# 하는 일: 본선 23페이지+이미지 복사 → 게이트·noindex 재주입 → 커밋 → 푸시
# 게이트 암호는 gate.html에 있으며 이 스크립트는 건드리지 않는다.
set -euo pipefail
cd "$(dirname "$0")"
SRC="../tom-proto"

# 1) 본선 복사 (실험 파일 v1~v3, README 제외)
# ⚠ 페이지를 새로 만들면 이 목록에 반드시 추가한다. 빠지면 스테이징에서 그 링크가 깨진다.
for f in index home brands new exclusive product paper paper-no35 store login signup \
         cart order order-done mypage search brand terms privacy shipping returns contact 404; do
  cp "$SRC/$f.html" "./$f.html"
done
rm -rf img && cp -R "$SRC/img" img

# 2) 게이트 + noindex 주입 (gate.html 제외 전 페이지)
python3 - <<'EOF'
import pathlib
SNIPPET = """<meta name="robots" content="noindex,nofollow">
<script>(function(){try{if(sessionStorage.getItem('tomkey')!=='ok')location.replace('gate.html');}catch(e){location.replace('gate.html');}})();</script>
"""
ANCHOR = '<meta name="viewport" content="width=device-width, initial-scale=1">'
n = 0
for p in pathlib.Path(".").glob("*.html"):
    if p.name == "gate.html":
        continue
    t = p.read_text(encoding="utf-8")
    if 'tomkey' in t:
        continue  # 이미 주입됨
    assert ANCHOR in t, p.name
    p.write_text(t.replace(ANCHOR, ANCHOR + "\n" + SNIPPET, 1), encoding="utf-8")
    n += 1
print(f"게이트 주입: {n}페이지")
EOF

# 3) 커밋·푸시
git add -A
if git diff --cached --quiet; then
  echo "변경 없음 — 스테이징이 이미 최신입니다."
else
  git commit -q -m "스테이징 최신화 $(date +%Y-%m-%d)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
  git push -q
  echo "푸시 완료 — 1~2분 뒤 반영: https://studiovneo-bot.github.io/tom-preview-k7x9q2/"
fi
