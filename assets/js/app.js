/* =========================================================
   Signal/Noise — app
   Theme toggle · Tweaks · Copy buttons · TOC · Progress
   ========================================================= */

(function(){
  const root = document.documentElement;
  const LS = {
    theme: 'blog:theme',
    accent: 'blog:accent',
    code: 'blog:code',
    toc: 'blog:toc',
  };

  /* ---------- Theme toggle ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(LS.theme, t); } catch(e){}
    syncTweaks();
    postEdit({theme: t});
  }
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme') || 'dark';
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });

  /* ---------- Accent & code palette ---------- */
  function setAccent(a){ root.setAttribute('data-accent', a); try{localStorage.setItem(LS.accent,a);}catch(e){}; syncTweaks(); postEdit({accent:a}); }
  function setCode(c){ root.setAttribute('data-code-theme', c); try{localStorage.setItem(LS.code,c);}catch(e){}; syncTweaks(); postEdit({code:c}); }
  function setTOC(v){ root.setAttribute('data-show-toc', v); try{localStorage.setItem(LS.toc,v);}catch(e){}; syncTweaks(); postEdit({toc:v}); }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll('.code-block .copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.code-block').querySelector('pre');
      const txt = pre.innerText;
      try {
        await navigator.clipboard.writeText(txt);
      } catch(e) {
        const ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); ta.remove();
      }
      btn.setAttribute('data-state','copied');
      const label = btn.querySelector('span');
      const orig = label ? label.textContent : 'Copy';
      if (label) label.textContent = 'Copied';
      setTimeout(() => {
        btn.removeAttribute('data-state');
        if (label) label.textContent = orig;
      }, 1400);
    });
  });

  /* ---------- Article progress + TOC ---------- */
  const progressBar = document.getElementById('progressBar');
  const body = document.getElementById('articleBody');
  const tocList = document.getElementById('tocList');

  if (body && tocList) {
    const heads = body.querySelectorAll('h2, h3');
    heads.forEach((h, i) => {
      if (!h.id) h.id = 'sec-' + i;
      if (h.tagName !== 'H2') return;
      const text = h.childNodes[h.childNodes.length-1]?.textContent?.trim() || h.textContent.trim();
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = text;
      li.appendChild(a); tocList.appendChild(li);
    });

    // scroll spy
    const links = tocList.querySelectorAll('a');
    function spy(){
      let cur = null;
      heads.forEach(h => {
        if (h.tagName !== 'H2') return;
        const r = h.getBoundingClientRect();
        if (r.top < 140) cur = h.id;
      });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    }
    window.addEventListener('scroll', spy, {passive:true});
    spy();
  }

  if (progressBar) {
    function onScroll(){
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      progressBar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* ---------- Tweaks panel ---------- */
  const tweaks = document.getElementById('tweaks');
  function openTweaks(){ tweaks && tweaks.classList.add('open'); syncTweaks(); }
  function closeTweaks(){ tweaks && tweaks.classList.remove('open'); }

  if (tweaks) {
    tweaks.querySelector('.tweaks-close').addEventListener('click', closeTweaks);
    tweaks.querySelectorAll('[data-seg]').forEach(seg => {
      const key = seg.getAttribute('data-seg');
      seg.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          const v = b.getAttribute('data-value');
          if (key==='theme') setTheme(v);
          else if (key==='accent') setAccent(v);
          else if (key==='code') setCode(v);
          else if (key==='toc') setTOC(v);
        });
      });
    });
  }

  function syncTweaks(){
    if (!tweaks) return;
    const map = {
      theme: root.getAttribute('data-theme'),
      accent: root.getAttribute('data-accent'),
      code: root.getAttribute('data-code-theme'),
      toc: root.getAttribute('data-show-toc'),
    };
    tweaks.querySelectorAll('[data-seg]').forEach(seg => {
      const key = seg.getAttribute('data-seg');
      seg.querySelectorAll('button').forEach(b => {
        b.setAttribute('data-on', (b.getAttribute('data-value') === map[key]) ? 'true' : 'false');
      });
    });
  }

  /* ---------- Edit-mode host protocol ---------- */
  window.addEventListener('message', (ev) => {
    const d = ev.data || {};
    if (d.type === '__activate_edit_mode') openTweaks();
    if (d.type === '__deactivate_edit_mode') closeTweaks();
  });
  function postEdit(edits){
    try { window.parent.postMessage({type:'__edit_mode_set_keys', edits: edits}, '*'); } catch(e){}
  }
  // Announce availability AFTER listener is registered
  try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch(e){}

  syncTweaks();
})();
