/* tOM 무드 시안 공통 — 헤더·가방 영수증·폰 메뉴·영상 그레인 (2026-10-16) */
(function(){
  var page=document.body.getAttribute('data-page')||'';
  var NAV=[['exclusive.html','Exclusive'],['arrivals.html','Arrivals'],['brands.html','Brands'],['paper.html','Paper'],['store.html','Store']];
  var n=0;try{n=parseInt(sessionStorage.getItem('tomMoodBag')||'0',10)||0}catch(e){}
  var pad=function(x){return (x<10?'0':'')+x};

  var h=document.createElement('header');h.className='h';
  h.innerHTML='<div class="l"><button data-menu>Menu</button>'+NAV.map(function(x){return '<a class="hide'+(page===x[0]?' on':'')+'" href="'+x[0]+'">'+x[1]+'</a>'}).join('')+'</div>'+
    '<a class="logo" href="index.html"><img src="img/tom-logo.svg" alt="tOM"></a>'+
    '<div class="r"><a class="hide" href="#">Account</a><button data-bag>Bag [ <span data-n>'+n+'</span> ]</button></div>';
  document.body.insertBefore(h,document.body.firstChild);

  var mm=document.createElement('div');mm.className='mm';
  mm.innerHTML='<div class="t"><button data-close>× Close</button><button data-bag>Bag [ '+n+' ]</button></div><nav><a href="index.html">tOM</a>'+
    NAV.map(function(x){return '<a href="'+x[0]+'">'+x[1]+'</a>'}).join('')+'</nav>';
  document.body.appendChild(mm);

  var bag=document.createElement('aside');bag.className='bag';
  function receipt(){var body=n>0?'<i>'+pad(n)+' CHOSEN.</i>\n<i>GOOD EYE.</i>':'<i>29 YEARS OF CHOOSING.</i>\n<i>NOTHING CHOSEN — YET.</i>';
    return '<div class="bh"><span>Bag [ '+n+' ]</span><button data-bclose>× Close</button></div><div class="rc">        tOM  HANNAM\n   Hannam-dong, Seoul\n     — since 1997 —\n------------------------\nPIECES                '+pad(n)+'\n------------------------\n'+body+'\n------------------------\n     thank you, come by</div>'}
  bag.innerHTML=receipt();document.body.appendChild(bag);
  function openBag(o){if(o)bag.innerHTML=receipt();bag.classList.toggle('open',o);mm.classList.remove('open')}
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-bag],[data-bclose],[data-menu],[data-close],[data-add]');if(!t)return;
    if(t.hasAttribute('data-bag')){e.preventDefault();openBag(true)}
    else if(t.hasAttribute('data-bclose'))openBag(false);
    else if(t.hasAttribute('data-menu'))mm.classList.add('open');
    else if(t.hasAttribute('data-close'))mm.classList.remove('open');
    else if(t.hasAttribute('data-add')){e.preventDefault();n++;try{sessionStorage.setItem('tomMoodBag',n)}catch(_){}
      document.querySelectorAll('[data-n]').forEach(function(s){s.textContent=n});openBag(true)}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){openBag(false);mm.classList.remove('open')}});

  var tag=document.createElement('div');tag.className='tag';tag.textContent='무드 시안 — 사진·영상은 AI로 만든 예시이며 실제 상품이 아닙니다';document.body.appendChild(tag);

  /* 영상 위 그레인 */
  var S=2,still=matchMedia('(prefers-reduced-motion: reduce)').matches,G=[];
  document.querySelectorAll('video').forEach(function(v){var c=document.createElement('canvas');c.className='grain';v.parentNode.insertBefore(c,v.nextSibling);G.push({c:c,f:[]})});
  function size(){G.forEach(function(g){var r=g.c.parentNode.getBoundingClientRect(),w=Math.max(1,Math.ceil(r.width/S)),hh=Math.max(1,Math.ceil(r.height/S)),x=g.c.getContext('2d');
    g.c.width=w;g.c.height=hh;g.f=[];for(var k=0;k<6;k++){var d=x.createImageData(w,hh),p=d.data;for(var j=0;j<p.length;j+=4){var v=(Math.random()*255)|0;p[j]=p[j+1]=p[j+2]=v;p[j+3]=255}g.f.push(d)}})}
  if(G.length){size();addEventListener('resize',size);var i=0;
    (function loop(){i=(i+1)%6;G.forEach(function(g){g.c.getContext('2d').putImageData(g.f[i],0,0)});if(!still)setTimeout(function(){requestAnimationFrame(loop)},50)})();}
})();
