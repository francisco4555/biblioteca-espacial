(() => {
  const data = window.BOOKS;
  const n = data.length;
  const stage = document.getElementById('stage');
  const info = document.getElementById('info');
  const hint = document.getElementById('hint');
  const pad = i => String(i + 1).padStart(2, '0');
  let mode = 'nube', picked = null, spin = 0;

  const cloudPos = data.map((_, i) => {
    const a = i * 2.399, r = 70 + Math.sqrt(i + 1) * 75;
    return [Math.cos(a) * r * 1.3, Math.sin(a) * r * .8, ((i * 71) % 180) - 90];
  });

  const els = data.map((b, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'bk';
    el.setAttribute('aria-label', `${b.title}, ${b.author}`);
    const cv = document.createElement('div');
    cv.className = 'cv';
    cv.style.background = b.cover ? `url("${b.cover}") center/cover` : b.bg;
    cv.style.color = b.fg;
    if (!b.cover) cv.innerHTML = `<small>${pad(i)}</small><b></b>`, cv.querySelector('b').textContent = b.title;
    el.appendChild(cv);
    el.addEventListener('click', () => { if (!dragged) select(i); });
    stage.appendChild(el);
    return el;
  });

  function layout() {
    const scale = Math.min(1, innerWidth / 900, innerHeight / 760);
    els.forEach((el, i) => {
      let x = 0, y = 0, z = 0, s = 1, rx = 0, ry = 0, blur = 0, op = 1, zi = 10;
      if (picked !== null) {
        let o = i - picked;
        if (o > n / 2) o -= n; if (o < -n / 2) o += n;
        const a = Math.abs(o);
        if (!o) { s = 3.6; zi = 40; }
        else { y = Math.sign(o) * (215 + (a - 1) * 70); s = .75 - a * .06; z = -a * 60; blur = (a - 1) * 1.4; op = a > 4 ? 0 : 1 - a * .13; zi = 30 - a; }
      } else if (mode === 'anillo') {
        const t = (i / n) * Math.PI * 2 - Math.PI / 2 + spin;
        x = Math.cos(t) * 230; y = Math.sin(t) * 230; ry = Math.cos(t) * -25; rx = Math.sin(t) * 20;
      } else if (mode === 'pila') {
        x = (i - (n - 1) / 2) * 34 + spin * 120; ry = -62; z = -i * 4; s = 1.4;
      } else {
        [x, y, z] = cloudPos[i];
        ry = ((i * 37) % 30) - 15 + spin * 40; rx = ((i * 53) % 20) - 10;
      }
      el.style.transform = `translate3d(${x * scale}px,${y * scale}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s * scale})`;
      el.style.filter = `blur(${blur}px)`;
      el.style.opacity = op;
      el.style.zIndex = zi;
      el.style.pointerEvents = op ? '' : 'none';
      el.classList.toggle('sel', i === picked);
    });
    info.hidden = picked === null;
    hint.textContent = picked === null ? 'TOCA UN LIBRO PARA ENFOCARLO' : 'TOCA OTRO LIBRO · ESC PARA CERRAR';
    if (picked !== null) {
      const b = data[picked];
      document.getElementById('i-n').textContent = `${pad(picked)}/${pad(n - 1)}`;
      document.getElementById('i-author').textContent = b.author;
      document.getElementById('i-year').textContent = b.year;
      document.getElementById('i-genre').textContent = b.genre;
      document.getElementById('i-open').href = b.url || '#';
    }
  }

  // Sonido de hoja de papel (generado con Web Audio, sin archivos)
  let actx = null;
  function playFlip() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime, dur = 0.32;
      const buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
      const d = buf.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
      const src = actx.createBufferSource(); src.buffer = buf;
      const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
      bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(3800, t + dur);
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(g).connect(actx.destination);
      src.start(t); src.stop(t + dur);
      // pequeño "toc" grave al final
      const o = actx.createOscillator(), og = actx.createGain();
      o.frequency.setValueAtTime(180, t + 0.05); o.frequency.exponentialRampToValueAtTime(90, t + 0.15);
      og.gain.setValueAtTime(0.0001, t + 0.05); og.gain.exponentialRampToValueAtTime(0.18, t + 0.06); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(og).connect(actx.destination); o.start(t + 0.05); o.stop(t + 0.2);
    } catch (e) {}
  }

  function select(i) { if (i !== picked) playFlip(); picked = i; layout(); }
  function close() { picked = null; layout(); }

  document.querySelectorAll('.modes button').forEach(btn => btn.addEventListener('click', () => {
    mode = btn.dataset.mode; picked = null; spin = 0;
    document.querySelectorAll('.modes button').forEach(b => b.classList.toggle('on', b === btn));
    layout();
  }));
  document.getElementById('close').addEventListener('click', close);
  addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (picked !== null && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) select((picked + 1) % n);
    if (picked !== null && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) select((picked - 1 + n) % n);
  });

  // Arrastrar para girar la vista (o navegar cuando hay un libro enfocado)
  let startX = 0, startY = 0, startSpin = 0, down = false, dragged = false;
  stage.addEventListener('pointerdown', e => { down = true; dragged = false; startX = e.clientX; startY = e.clientY; startSpin = spin; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) dragged = true;
    if (picked === null && dragged) { spin = startSpin + dx / 300; els.forEach(el => el.style.transition = 'transform .15s'); layout(); }
  });
  addEventListener('pointerup', e => {
    if (!down) return; down = false;
    els.forEach(el => el.style.transition = '');
    if (picked !== null && dragged) {
      const dy = e.clientY - startY;
      if (Math.abs(dy) > 40) select((picked + (dy < 0 ? 1 : -1) + n) % n);
    }
    setTimeout(() => dragged = false, 0);
  });
  addEventListener('wheel', e => {
    if (picked !== null) { if (Math.abs(e.deltaY) > 20) select((picked + (e.deltaY > 0 ? 1 : -1) + n) % n); }
    else { spin += e.deltaY / 1200; layout(); }
  }, { passive: true });
  addEventListener('resize', layout);
  layout();
})();
