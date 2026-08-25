/* tOM 측정 자리 (2026-08-25)
 *
 * 지금은 어디로도 보내지 않는다. 이벤트 이름과 값만 표준 형태(GA4 이름)로 만들어 둔다.
 * 카페24·GA4를 붙일 때는 이 파일 아래쪽 send() 안의 「보내는 곳」 한 군데만 고친다.
 * 페이지 HTML에는 손을 대지 않는다 — 값은 화면에 이미 있는 요소에서 읽는다.
 *
 * 재는 것 (진행기록 「측정 자리 심기」)
 *   방문      page_view       전 페이지
 *   상품조회   view_item       product.html
 *   장바구니   add_to_cart     product.html 「장바구니에 담기」
 *   결제시작   begin_checkout  order.html 도달
 *   (덤) 주문완료 purchase      order-done.html 도달 · 실결제 아님(demo:true)
 *   (덤) 목록에서 상품 클릭 select_item  new·exclusive·brand 의 카드
 *
 * ⚠ 개인정보 — 여기서는 쿠키를 굽지 않고 개인을 식별하지 않는다.
 *   실제 수집을 켜는 순간 개인정보처리방침의 쿠키·수집항목 문구가 함께 필요하다(톰 확정 대기).
 */
(function () {
  'use strict';

  var STORE_KEY = 'tom_events';
  var Q = (window.tomDataLayer = window.tomDataLayer || []);

  function page() {
    var f = (location.pathname.split('/').pop() || 'index.html');
    return f.replace(/\.html$/, '') || 'index';
  }

  function num(s) {
    var d = String(s || '').replace(/[^0-9]/g, '');
    return d ? parseInt(d, 10) : null;
  }

  function text(sel) {
    var el = document.querySelector(sel);
    return el ? el.textContent.trim() : null;
  }

  function send(name, params) {
    var e = { event: name, page: page(), ts: new Date().toISOString() };
    if (params) { for (var k in params) { if (params[k] !== null && params[k] !== undefined) e[k] = params[k]; } }

    Q.push(e);

    // 확인용 — 세션 안에서만 남고 서버로 가지 않는다
    try {
      var log = JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]');
      log.push(e);
      sessionStorage.setItem(STORE_KEY, JSON.stringify(log.slice(-100)));
    } catch (_) {}

    // 주소 뒤에 ?track 을 붙이면 콘솔에 찍힌다
    if (location.search.indexOf('track') > -1 && window.console) console.log('[tOM]', e);

    // ── 보내는 곳 — 지금은 비어 있다 ────────────────────────────
    // GA4:     if (window.gtag) gtag('event', name, params || {});
    // 카페24:   GTM 을 쓰면 window.dataLayer 로 그대로 넘어간다
    if (window.dataLayer && window.dataLayer.push) { try { window.dataLayer.push(e); } catch (_) {} }
    // ───────────────────────────────────────────────────────────
  }

  window.tomTrack = send;

  function item() {
    return {
      item_brand: text('.info .brand'),
      item_name: text('.info h1'),
      price: num(text('.info .price')),
      currency: 'KRW'
    };
  }

  function start() {
    var p = page();

    send('page_view', { title: document.title });

    if (p === 'product') send('view_item', item());
    if (p === 'order') send('begin_checkout', {});
    if (p === 'order-done') send('purchase', { demo: true });

    // 장바구니 담기
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('#addbag,[data-track="add_to_cart"]') : null;
      if (t) send('add_to_cart', item());
    }, true);

    // 목록에서 상품 클릭
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest) return;
      var card = ev.target.closest('.card a, .card');
      if (!card) return;
      var fig = card.closest ? card.closest('.card') : null;
      if (!fig) return;
      send('select_item', {
        list: p,
        item_brand: (fig.querySelector('.brand') || {}).textContent ? fig.querySelector('.brand').textContent.trim() : null,
        item_name: (fig.querySelector('.name') || {}).textContent ? fig.querySelector('.name').textContent.trim() : null
      });
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
