
// Promo fade & shine activation
const promo = document.getElementById('promo');
function promoTick(){ if(!promo) return; if(scrollY<=2) promo.classList.remove('hidden'); else promo.classList.add('hidden'); }
promoTick(); addEventListener('scroll', promoTick, {passive:true});
function onScroll(){ if(scrollY>10) document.body.classList.add('scrolled'); else document.body.classList.remove('scrolled'); }
onScroll(); addEventListener('scroll', onScroll, {passive:true});

// 3) Reviews carousel: center one, peek neighbors, working arrows

(function(){
  const viewport = document.querySelector('.rev-viewport');
  const track = document.querySelector('.rev-track');
  if(!viewport || !track) return;
  const slides = Array.from(track.querySelectorAll('.rev'));
  if(!slides.length) return;

  let index = 0;
  let timer = null;

  function xFor(i){
    const prev = track.style.transform;
    track.style.transform = 'translate3d(0,0,0)';
    const vp = viewport.getBoundingClientRect();
    const sl = slides[i].getBoundingClientRect();
    const x = (vp.left + vp.width/2) - (sl.left + sl.width/2);
    track.style.transform = prev || '';
    return x;
  }
  function apply(i){
    track.style.transform = `translate3d(${xFor(i)}px,0,0)`;
    slides.forEach((s,k)=>s.classList.toggle('active', k===i));
  }
  function go(n){ index = (n + slides.length) % slides.length; apply(index); }

  document.querySelector('.rev-next')?.addEventListener('click', ()=>{ go(index+1); restart(); });
  document.querySelector('.rev-prev')?.addEventListener('click', ()=>{ go(index-1); restart(); });

  // swipe
  let sx=null,id=null;
  track.addEventListener('pointerdown', e=>{ sx=e.clientX; id=e.pointerId; track.setPointerCapture(id); });
  track.addEventListener('pointerup', e=>{
    if(sx==null) return;
    const dx=e.clientX - sx;
    if(Math.abs(dx)>40) go(index + (dx<0?1:-1));
    sx=null; id=null; restart();
  });

  if('ResizeObserver' in window){ new ResizeObserver(()=>apply(index)).observe(viewport); }
  else { addEventListener('resize', ()=>apply(index)); addEventListener('orientationchange', ()=>apply(index)); }

  function play(){ timer = setInterval(()=>go(index+1), 6000); }
  function restart(){ if(timer){ clearInterval(timer); } play(); }

  requestAnimationFrame(()=>{ apply(0); play(); });
})()
;

// 4) Service page lightbox viewer
(function(){
  const links = Array.from(document.querySelectorAll('.lb-link'));
  if(!links.length) return;
  const lb = document.querySelector('.lightbox');
  const media = lb.querySelector('.lb-media');
  let i = 0;
  function show(k){
    i = k;
    media.style.backgroundImage = `url('${links[i].dataset.image}')`;
    lb.style.display = 'flex';
  }
  function close(){ lb.style.display = 'none'; }
  function next(){ i=(i+1)%links.length; show(i); }
  function prev(){ i=(i-1+links.length)%links.length; show(i); }
  links.forEach((a,idx)=>a.addEventListener('click', e=>{e.preventDefault(); show(idx); }));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-next').addEventListener('click', next);
  lb.querySelector('.lb-prev').addEventListener('click', prev);
  lb.addEventListener('click', e=>{ if(e.target===lb) close(); });
})();





// --- Precise jump-to-Services offset (Mk28 no-drift) ---
(function(){
  const svc = document.getElementById('services');
  if(!svc) return;
  const target = svc.querySelector('h2') || svc;
  const topBar = document.querySelector('header.top');
  const promoBar = document.getElementById('promo');
  const EXTRA = 30; // fine-tune that matched your screenshot

  function constantOffset(){
    const topH = topBar ? topBar.offsetHeight : 0;
    const promoH = promoBar ? promoBar.offsetHeight : 0; // always include
    return topH + promoH;
  }

  function scrollToServices(evt){
    if(evt) evt.preventDefault();
    const absTop = target.getBoundingClientRect().top + window.scrollY;
    const y = absTop - (constantOffset() - EXTRA);
    window.scrollTo({top: Math.max(0, Math.round(y)), behavior: 'smooth'});
  }

  const selectors = ['a[href$="#services"]','a[href*="index.html#services"]'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(a => {
      a.addEventListener('click', function(e){
        const href = (a.getAttribute('href')||'').trim();
        const samePage = href.startsWith('#') || href.includes('index.html#');
        if(samePage) scrollToServices(e);
      }, {passive:false});
    });
  });

  if(location.hash === '#services'){
    setTimeout(scrollToServices, 0);
  }
})();
// --- end precise jump (Mk28) ---


// A11Y: Keyboard support for reviews carousel
(function(){
  const viewport = document.querySelector('.rev-viewport');
  const prev = document.querySelector('.reviews .rev-prev');
  const next = document.querySelector('.reviews .rev-next');
  if(!viewport) return;
  if(!viewport.hasAttribute('tabindex')) viewport.tabIndex = 0;
  viewport.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ e.preventDefault(); prev && prev.click(); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); next && next.click(); }
  });
})();
\n

// === Forced motion helpers ===
function __setTranslateXImportant__(el, px){
  try{ el.style.setProperty('transform', 'translateX(' + px + 'px)', 'important'); }
  catch(e){ el.style.transform = 'translateX(' + px + 'px)'; }
}
function __setMarginLeftImportant__(el, px){
  try{ el.style.setProperty('margin-left', px + 'px', 'important'); }
  catch(e){ el.style.marginLeft = px + 'px'; }
}
\n

// === Mobile reviews: dual-motion (transform + margin-left) ===
(function(){
  var root = document.querySelector('.reviews');
  if(!root) return;
  var viewport = root.querySelector('.rev-viewport');
  var track = root.querySelector('.rev-track');
  var cards = track ? Array.from(track.children) : [];
  var ctrls = root.querySelectorAll('.rev-ctrl');
  var prevBtn = ctrls && ctrls.length ? ctrls[0] : null;
  var nextBtn = ctrls && ctrls.length > 1 ? ctrls[1] : null;
  if(!viewport || !track || cards.length === 0) return;

  var index = 0;
  function getGap(){
    var s = window.getComputedStyle(track);
    var g = parseFloat(s.gap || s.columnGap || '24') || 24;
    return g;
  }
  function cardWidth(){ return cards[0].getBoundingClientRect().width; }
  function clamp(i){ return Math.max(0, Math.min(i, cards.length - 1)); }

  function applyOffset(px){
    __setTranslateXImportant__(track, px);
    __setMarginLeftImportant__(track, px);
  }
  function slideTo(i){
    index = clamp(i);
    var offset = -index * (cardWidth() + getGap());
    applyOffset(offset);
  }
  if(prevBtn) prevBtn.addEventListener('click', function(){ slideTo(index-1); }, {passive:true});
  if(nextBtn) nextBtn.addEventListener('click', function(){ slideTo(index+1); }, {passive:true});

  if('ResizeObserver' in window){
    new ResizeObserver(function(){ slideTo(index); }).observe(viewport);
  }else{
    window.addEventListener('resize', function(){ slideTo(index); });
    window.addEventListener('orientationchange', function(){ slideTo(index); });
  }
  requestAnimationFrame(function(){ slideTo(index); });
})();
