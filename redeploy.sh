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
rm -rf font && cp -R "$SRC/font" font    # 커버 웹폰트 — 빠지면 윈도우에서 Times 로 떨어진다
rm -rf js && cp -R "$SRC/js" js        # 측정 스크립트 — 빠지면 스테이징에서만 이벤트가 안 잡힌다

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

# 2-2) 커버의 자리표시 경고를 스테이징에서는 항상 켠다 (2026-08-26 Neo)
# ⚠ 스테이징 전용이다. 본선(tom-proto)에는 넣지 않는다 — 실제 오픈 사이트에 이 띠가 뜨면 안 된다.
# 켜는 것은 커버의 브랜드 명단 경고 하나뿐이다. 상품·브랜드 페이지의 내부 메모는 그대로 ?review 로 남긴다
# (그 안에 「캠페인 이미지 사용 허가 확인 필요」처럼 톰에게 그대로 보이면 곤란한 문장이 있다).
python3 - <<'EOF'
import pathlib
MARK = "STAGING:COVER-REVNOTE"
SNIPPET = ('<script>/* ' + MARK + ' — 스테이징에서는 자리표시 경고를 늘 띄운다. '
           'redeploy.sh 가 넣는다 */document.documentElement.classList.add("review");</script>\n')
p = pathlib.Path("index.html")
t = p.read_text(encoding="utf-8")
if MARK in t:
    print("커버 경고: 이미 켜져 있음")
else:
    assert "</body>" in t, "index.html 에 </body> 가 없다"
    p.write_text(t.replace("</body>", SNIPPET + "</body>", 1), encoding="utf-8")
    print("커버 경고: 항상 켜기 주입 완료")
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
