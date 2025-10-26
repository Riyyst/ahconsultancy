
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
  const cards = Array.from(track.querySelectorAll('.rev'));
  let idx = 0;
  const gap = 24;
  function cardWidth(){ return cards[0].getBoundingClientRect().width; }
  function set(){
    const cw = cardWidth();
    const vpw = viewport.clientWidth;
    const centerOffset = (vpw - cw)/2;
    const x = -idx*(cw+gap) + centerOffset;
    track.style.transform = `translateX(${x}px)`;
    cards.forEach((c,i)=>c.classList.toggle('active', i===idx));
  }
  function next(){ idx = (idx+1)%cards.length; set(); }
  function prev(){ idx = (idx-1+cards.length)%cards.length; set(); }
  document.querySelector('.rev-next')?.addEventListener('click', next);
  document.querySelector('.rev-prev')?.addEventListener('click', prev);
  addEventListener('resize', set);
  set();
  setInterval(next, 6000);
})();

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
