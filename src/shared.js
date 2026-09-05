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

  /* Water art for the option cards that have no photography yet (swim spa, pool) */
  document.querySelectorAll('canvas.water').forEach(function(c){
    var ctx=c.getContext('2d'), W,H, t=0, kind=c.dataset.kind||'pool';
    function size(){ W=c.width=c.offsetWidth*1; H=c.height=c.offsetHeight*1; }
    size(); window.addEventListener('resize',size);
    function frame(){
      t+=reduce?0:.012;
      var g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#0B4F86'); g.addColorStop(1,'#1FA8E0');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      /* caustic ripples */
      ctx.globalAlpha=.22; ctx.strokeStyle='#CFF1FF'; ctx.lineWidth=1.2;
      for(var r=0;r<9;r++){
        ctx.beginPath();
        for(var x=0;x<=W;x+=6){
          var y = H*(0.12+r*0.1) + Math.sin(x*0.02 + t*1.6 + r)*6 + Math.cos(x*0.011 - t + r*2)*5;
          x? ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha=1;
      if(kind==='swimspa'){
        /* the shell edge and a current line, the thing that makes a swim spa a swim spa */
        ctx.fillStyle='rgba(8,14,31,.55)'; ctx.fillRect(0,0,W,H*.14); ctx.fillRect(0,H*.86,W,H*.14);
        ctx.fillStyle='rgba(255,255,255,.75)';
        for(var i=0;i<W;i+=28){ var o=(t*40)%28; ctx.fillRect(i-o,H*.5-1.5,14,3); }
        ctx.fillStyle='#F2A33C'; ctx.beginPath(); ctx.arc(W*.16, H*.5, 7,0,Math.PI*2); ctx.fill();
      } else {
        /* pool coping and tile line */
        ctx.fillStyle='#E6DFD2'; ctx.fillRect(0,0,W,H*.11); ctx.fillRect(0,0,W*.09,H); 
        ctx.fillStyle='#1B3A6B'; ctx.fillRect(W*.09,H*.11,W,4);
        for(var k=0;k<W;k+=18){ ctx.fillStyle=(k/18)%2?'#1B3A6B':'#CFF1FF'; ctx.fillRect(W*.09+k,H*.11,18,4); }
      }
      if(!reduce) requestAnimationFrame(frame);
    }
    frame();
  });

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

  /* Demo submit: swap in the confirmation. Wire action= to the CRM before launch. */
  document.querySelectorAll('form.lead').forEach(function(f){
    f.addEventListener('submit', function(e){
      if(f.getAttribute('action')==='#'){
        e.preventDefault();
        var code='KS-1238-'+Math.random().toString(36).slice(2,6).toUpperCase();
        var c=f.querySelector('.code'); if(c) c.textContent=code;
        Array.prototype.forEach.call(f.children,function(ch){ if(!ch.classList.contains('done')) ch.style.display='none'; });
        f.querySelector('.done').classList.add('show');
        f.scrollIntoView({behavior: reduce?'auto':'smooth', block:'center'});
      }
    });
  });
})();
