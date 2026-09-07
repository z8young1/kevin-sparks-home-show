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

  /* Option and model card links pre-select the form before the page scrolls to it */
  document.querySelectorAll('[data-pick],[data-pick-model]').forEach(function(a){
    a.addEventListener('click', function(){
      if(a.dataset.pick){
        var r=document.querySelector('input[name="interest"][value="'+a.dataset.pick+'"]');
        if(r) r.checked=true;
      }
      if(a.dataset.pickModel){
        var sel=document.querySelector('select[name="model"]');
        if(sel) sel.value=a.dataset.pickModel;
      }
    });
  });

  /* Submit: POST the lead to the GoHighLevel inbound webhook, then hand off to the
     thank-you page. GHL does not send CORS headers on hook endpoints, so a normal
     fetch usually fails to READ the response even when the POST lands. We therefore
     try a readable request first and fall back to an opaque no-cors send, which still
     delivers the body. Nothing redirects until one of the two resolves. */
  document.querySelectorAll('form.lead').forEach(function(f){
    var btn = f.querySelector('button[type="submit"]');
    var busy = false;

    function collect(){
      var d = {}, seen = {};
      Array.prototype.forEach.call(f.elements, function(el){
        if(!el.name || el.disabled) return;
        if((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        d[el.name] = el.value;
        seen[el.name] = true;
      });
      /* GHL-style names for the standard contact fields so the workflow mapping is obvious */
      return {
        firstName: d.first_name || '', lastName: d.last_name || '',
        email: d.email || '', phone: d.phone || '', postalCode: d.zip || '',
        timeline: d.timeline || '', interest: d.interest || '',
        visitDay: d.visit_day || '', model: d.model || '',
        page: d.page || '', pageUrl: location.href,
        code: 'KS-1238-' + Math.random().toString(36).slice(2,6).toUpperCase(),
        submittedAt: new Date().toISOString(),
        utmSource: d.utm_source || '', utmMedium: d.utm_medium || '',
        utmCampaign: d.utm_campaign || '', utmContent: d.utm_content || '',
        utmTerm: d.utm_term || '', fbclid: d.fbclid || '', gclid: d.gclid || '',
        referrer: d.referrer || ''
      };
    }

    function fail(msg){
      busy = false;
      if(btn){ btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit'; }
      var e = f.querySelector('.err');
      if(!e){ e = document.createElement('p'); e.className = 'fine err'; e.setAttribute('role','alert');
              e.style.color = '#F2A33C'; f.insertBefore(e, f.querySelector('.fine')); }
      e.textContent = msg;
    }

    function done(payload){
      var from = payload.page === 'nashville-home-show' ? 'event'
               : payload.page === 'hot-tubs'            ? 'tubs'
               : 'post';
      var p = new URLSearchParams({
        from: from,
        name: payload.firstName, interest: payload.interest,
        day: payload.visitDay, model: payload.model, code: payload.code
      });
      location.href = f.dataset.thanks + '?' + p.toString();
    }

    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(busy) return;
      if(!f.checkValidity()){ f.reportValidity(); return; }

      var hook = f.dataset.webhook || '';
      var payload = collect();

      /* No webhook configured yet: behave exactly as the review build always has */
      if(!hook){ done(payload); return; }

      busy = true;
      if(btn){ btn.dataset.label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending...'; }
      var body = JSON.stringify(payload);

      fetch(hook, { method:'POST', headers:{'Content-Type':'application/json'}, body: body })
        .then(function(r){
          if(!r.ok) throw new Error('http ' + r.status);
          done(payload);
        })
        .catch(function(){
          /* Opaque retry: we cannot read the result, but the body still reaches GHL */
          fetch(hook, { method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: body })
            .then(function(){ done(payload); })
            .catch(function(){
              fail('We could not send that. Please call 615.238.4144 and we will register you by phone.');
            });
        });
    });
  });
})();
