/* Shared behaviour: reveal, steam, water art, sticky bar, UTM capture, demo submit */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal: only elements below the first viewport get parked, so the page is readable at rest */
  var rv = document.querySelectorAll('.rv');
  if(!reduce && 'IntersectionObserver' in window){
    var vh = window.innerHeight;
    rv.forEach(function(el){ if(el.getBoundingClientRect().top > vh*0.92) el.classList.add('pre'); });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.remove('pre'); e.target.classList.add('in'); io.unobserve(e.target);} });
    },{threshold:.12});
    rv.forEach(function(el){ io.observe(el); });
    /* Safety net: nothing stays hidden if the observer never fires */
    setTimeout(function(){ rv.forEach(function(el){ el.classList.remove('pre'); el.classList.add('in'); }); }, 2500);
  }

  /* Steam in the hero: slow rising wisps, 104 degrees on a cool evening */
  var sc = document.getElementById('steam');
  if(sc && !reduce){
    var ctx = sc.getContext('2d'), W, H, puffs=[];
    function size(){ W = sc.width = sc.offsetWidth; H = sc.height = sc.offsetHeight; }
    size(); window.addEventListener('resize', size);
    for(var i=0;i<26;i++) puffs.push(mk(true));
    function mk(init){ return { x: Math.random()*W, y: init? Math.random()*H : H+60, r: 60+Math.random()*140, v: .12+Math.random()*.25, a: 0, max: .05+Math.random()*.07, drift:(Math.random()-.5)*.25, life:0 }; }
    function tick(){
      ctx.clearRect(0,0,W,H);
      puffs.forEach(function(p,i){
        p.y -= p.v; p.x += p.drift + Math.sin(p.life/90)*.2; p.life++;
        p.a = Math.min(p.max, p.a + .0006);
        if(p.y < -p.r){ puffs[i] = mk(false); return; }
        var g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
        g.addColorStop(0,'rgba(180,215,255,'+p.a+')'); g.addColorStop(1,'rgba(180,215,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* Sticky bar appears once the hero CTA has scrolled away */
  var bar=document.querySelector('.bar'), hero=document.querySelector('.hero');
  if(bar && hero){
    var onS=function(){ bar.classList.toggle('on', window.scrollY > hero.offsetHeight*0.85); };
    window.addEventListener('scroll', onS, {passive:true}); onS();
  }

  /* Attribution: keep whatever Meta or the geofencing vendor appended on the URL */
  var q=new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid'].forEach(function(k){
    var v=q.get(k); if(!v) return;
    document.querySelectorAll('input[name="'+k+'"]').forEach(function(i){ i.value=v; });
  });
  var ref=document.querySelector('input[name="referrer"]'); if(ref) ref.value=document.referrer||'';

  /* Option card links pre-select the interest in the form */
  document.querySelectorAll('[data-pick]').forEach(function(a){
    a.addEventListener('click', function(){
      var r=document.querySelector('input[name="interest"][value="'+a.dataset.pick+'"]'); if(r) r.checked=true;
    });
  });

  /* Demo submit: hand off to the thank-you page with what they told us. In production, set the
     CRM form's redirect to the thank-you URL and pass the same parameters. */
  document.querySelectorAll('form.lead').forEach(function(f){
    f.addEventListener('submit', function(e){
      if(f.getAttribute('action')==='#'){
        e.preventDefault();
        if(!f.checkValidity()){ f.reportValidity(); return; }
        var code='KS-1238-'+Math.random().toString(36).slice(2,6).toUpperCase();
        var g=function(n){ var el=f.querySelector('[name="'+n+'"]:checked') || f.querySelector('[name="'+n+'"]'); return el? el.value : ''; };
        var p=new URLSearchParams({ from: f.querySelector('[name="page"]').value==='post-nashville-home-show'?'post':'event',
          name:g('first_name'), interest:g('interest'), day:g('visit_day'), model:g('model'), code:code });
        location.href = f.dataset.thanks + '?' + p.toString();
      }
    });
  });
})();
