/**
 * Phở Sydney - Main Application Scripts
 * Interactive Categories Carousel & Menu Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🍜 Phở Sydney Website initialized.');

  // Popular Categories are displayed in a responsive grid (no horizontal scroll needed)

  // 2. Interactive 3D Sketchbook Menu Logic (MengToSketchbook Engine)
  const pills = document.querySelectorAll('.cat-pill');
  const spreads = Array.from(document.querySelectorAll('.menu-book-spread'));
  const stage = document.getElementById('sbStage');
  const sb3d = document.getElementById('sb3d');
  const bookCover = document.getElementById('menuBookCover');
  const book = document.getElementById('sbBook');
  const prevSpreadBtn = document.getElementById('menuPrevSpreadBtn');
  const nextSpreadBtn = document.getElementById('menuNextSpreadBtn');
  const sbLeft = document.getElementById('sbLeft');
  const sbRight = document.getElementById('sbRight');
  const spreadIndicator = document.getElementById('menuSpreadIndicator');
  const menuIndexBtn = document.getElementById('menuIndexBtn');
  const hint = document.getElementById('sbHint');
  const toggleBtn = document.getElementById('toggleFullMenuBtn');
  const fullMenu = document.getElementById('fullMenuCollapsible');
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const M = spreads.length;
  const N = 14;         /* nested strips for smooth curved paper arc */
  const SPAN = 0.5;     /* gutter -> outer page edge of #sbBook      */
  const BETA = 0.60;    /* peak curl of the arc in radians           */
  let idx = 0;
  let turn = null;      /* { dir, from, to, t }                      */
  let strips = [];
  let turnLayer = null;

  function el(t, c) {
    const e = document.createElement(t);
    if (c) e.className = c;
    return e;
  }

  function halfEl(pos, spreadIdx) {
    const isEmptyLeft = pos === 'left' && spreadIdx === 0;
    const d = el('div', 'sb-half ' + pos + (isEmptyLeft ? ' is-empty' : ''));
    const srcPage = spreads[spreadIdx]?.querySelector(
      pos === 'left' ? '.menu-page-left' : '.menu-page-right'
    );
    if (srcPage) d.appendChild(srcPage.cloneNode(true));
    if (!isEmptyLeft) {
      d.appendChild(el('div', 'gutter-shade ' + pos));
    }
    return d;
  }

  function buildPageSlice(spreadIdx, side, stripIndex) {
    const slice = el('div', 'strip-page-slice');
    const srcPage = spreads[spreadIdx]?.querySelector(
      side === 'left' ? '.menu-page-left' : '.menu-page-right'
    );
    if (srcPage) {
      const cloned = srcPage.cloneNode(true);
      cloned.style.width = '100%';
      cloned.style.height = '100%';
      slice.appendChild(cloned);
    }
    const stripOffsetIndex = side === 'right' ? stripIndex : N - 1 - stripIndex;
    slice.style.left = `calc(-1 * ${stripOffsetIndex} * (var(--bw, 0px) * ${SPAN} / ${N}))`;
    return slice;
  }

  function buildCurl(dir, from, to) {
    strips = [];
    const c = el('div', 'curl ' + dir);
    c.style.setProperty('--n', N);
    c.style.setProperty('--span', SPAN);
    let host = c;
    for (let i = 0; i < N; i++) {
      const s = el('div', 'strip');
      s.style.setProperty('--i', i);
      const f = el('div', 'face front');
      const b = el('div', 'face back');

      if (dir === 'next') {
        f.appendChild(buildPageSlice(from, 'right', i));
        b.appendChild(buildPageSlice(to, 'left', i));
      } else {
        f.appendChild(buildPageSlice(from, 'left', i));
        b.appendChild(buildPageSlice(to, 'right', i));
      }

      f.appendChild(el('div', 'sh'));
      f.appendChild(el('div', 'gl'));
      b.appendChild(el('div', 'sh'));
      b.appendChild(el('div', 'gl'));
      s.appendChild(f);
      s.appendChild(b);
      if (i === N - 1) s.classList.add('edge');
      host.appendChild(s);
      host = s;
      strips.push(s);
    }
    return c;
  }

  function setOpenVars(openVal, boardOpenVal) {
    if (!sb3d) return;
    sb3d.style.setProperty('--open', openVal.toFixed(3));
    sb3d.style.setProperty('--board-open', boardOpenVal.toFixed(3));
  }

  function applyTurn(t) {
    if (!sb3d) return;
    const th = Math.PI * t;
    const beta = BETA * Math.sin(Math.PI * t);
    const D = 180 / Math.PI;
    const tt = th + beta;
    const td = (2 * beta) / N;
    sb3d.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg');
    sb3d.style.setProperty('--td', (td * D).toFixed(3) + 'deg');
    sb3d.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));

    if (turn) {
      let openVal = 1;
      if (turn.from === 0) openVal = Math.max(0, Math.min(1, t));
      else if (turn.to === 0) openVal = Math.max(0, Math.min(1, 1 - t));
      const boardOpen =
        turn.from === 0 || turn.to === 0
          ? Math.max(0, -Math.cos(Math.PI * openVal))
          : 1;
      setOpenVars(openVal, boardOpen);
    }
    for (let i = 0; i < strips.length; i++) {
      const l1 = Math.abs(Math.cos(tt - i * td));
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      const st = strips[i].style;
      st.setProperty('--lit', l1.toFixed(3));
      st.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
      st.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
    }
  }

  function layout() {
    if (!sb3d || !book) return;
    sb3d.style.setProperty('--bw', (book.offsetWidth || book.clientWidth) + 'px');
  }
  window.addEventListener('resize', layout);

  function updateMeta() {
    const cur = turn ? turn.to : idx;
    const activeSpread = spreads[cur];
    const activeCat = activeSpread ? activeSpread.dataset.category : 'cover';

    pills.forEach((p) => {
      p.classList.toggle('active', p.dataset.category === activeCat);
    });

    if (spreadIndicator && activeSpread) {
      const title = activeSpread.dataset.title || '';
      if (cur === 0) {
        spreadIndicator.textContent = `Sách Đang Đóng • ${title}`;
      } else if (cur === 1) {
        spreadIndicator.textContent = `${title}`;
      } else {
        const p1 = (cur - 2) * 2 + 1;
        const p2 = (cur - 2) * 2 + 2;
        spreadIndicator.textContent = `Pages ${p1}–${p2} / ${(M - 2) * 2} • ${title}`;
      }
    }

    if (menuIndexBtn) {
      const labelSpan = menuIndexBtn.querySelector('span:last-child');
      if (labelSpan) {
        labelSpan.textContent = cur === 0 ? 'Mở Mục Lục' : cur === 1 ? 'Đóng Sách' : 'Mục Lục';
      }
    }

    if (sbLeft) {
      sbLeft.style.opacity = cur === 0 ? '0.25' : '';
      sbLeft.style.pointerEvents = cur === 0 ? 'none' : '';
    }
    if (prevSpreadBtn) {
      prevSpreadBtn.disabled = cur === 0;
      prevSpreadBtn.style.opacity = cur === 0 ? '0.45' : '';
    }
  }

  function paint() {
    if (!book || !sb3d) return;
    layout();
    if (turnLayer) {
      turnLayer.remove();
      turnLayer = null;
    }

    // Ensure hit zones exist once inside #sbBook
    let zPrev = book.querySelector('.sb-zone.sb-prev');
    let zNext = book.querySelector('.sb-zone.sb-next');
    if (!zPrev) {
      zPrev = el('button', 'sb-zone sb-prev');
      zPrev.type = 'button';
      zPrev.setAttribute('aria-label', 'Previous page');
      book.appendChild(zPrev);
    }
    if (!zNext) {
      zNext = el('button', 'sb-zone sb-next');
      zNext.type = 'button';
      zNext.setAttribute('aria-label', 'Next page');
      book.appendChild(zNext);
    }

    if (!turn) {
      spreads.forEach((sp, i) => {
        sp.classList.toggle('is-active', i === idx);
      });
      sb3d.style.setProperty('--shade', '0');
      const openState = idx === 0 ? 0 : 1;
      setOpenVars(openState, openState);
    } else {
      spreads.forEach((sp) => sp.classList.remove('is-active'));
      turnLayer = el('div', 'sb-turn-layer');
      const next = turn.dir === 'next';
      turnLayer.appendChild(halfEl('left', next ? turn.from : turn.to));
      turnLayer.appendChild(halfEl('right', next ? turn.to : turn.from));
      turnLayer.appendChild(buildCurl(turn.dir, turn.from, turn.to));
      book.appendChild(turnLayer);
      applyTurn(turn.t);
    }

    updateMeta();
  }

  /* ---- Spring Physics Loop ---- */
  let spring = null;
  let raf = null;
  let last = 0;

  function animateTo(target, onDone, stiff, damp) {
    spring = { v: 0, target, done: onDone, k: stiff || 160, c: damp || 24 };
    kick();
  }

  function tick(now) {
    raf = null;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    if (spring && turn) {
      const s = spring;
      const x = turn.t - s.target;
      s.v += (-s.k * x - s.c * s.v) * dt;
      turn.t += s.v * dt;
      if (Math.abs(turn.t - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
        turn.t = s.target;
        spring = null;
        applyTurn(turn.t);
        const d = s.done;
        if (d) d();
      } else {
        applyTurn(turn.t);
      }
    }
    const vmoved = viewSpring();
    if ((spring || vmoved) && raf === null) {
      raf = requestAnimationFrame(tick);
    }
  }

  function kick() {
    if (raf === null) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  /* ---- Subtle Tilt & Zoom Controls ---- */
  const TILT_X = 2.0;
  const TILT_Y = 3.0;
  const ZOOM_MIN = 0.9;
  const ZOOM_MAX = 1.45;
  const view = { rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 };
  let lastZ = 1;

  function applyView() {
    if (!sb3d) return;
    sb3d.style.setProperty('--rx', view.rx.toFixed(2) + 'deg');
    sb3d.style.setProperty('--ry', view.ry.toFixed(2) + 'deg');
    sb3d.style.setProperty('--zoom', view.z.toFixed(3));
  }

  function viewSpring() {
    const e = 0.14;
    let moved = false;
    for (const [k, t] of [
      ['rx', 'trx'],
      ['ry', 'try_'],
      ['z', 'tz'],
    ]) {
      const d = view[t] - view[k];
      if (Math.abs(d) > 0.0006) {
        view[k] += d * e;
        moved = true;
      } else {
        view[k] = view[t];
      }
    }
    if (moved) applyView();
    return moved;
  }

  function setView(rx, ry, z) {
    view.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
    view.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
    view.tz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    kick();
  }

  let drag = null;
  function hideHint() {
    if (hint) hint.classList.add('gone');
  }

  if (stage && book) {
    stage.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'touch' || drag) return;
        const r = book.getBoundingClientRect();
        if (!r.width) return;
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.62)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
        setView(-ny * TILT_X, nx * TILT_Y, view.tz);
      },
      { passive: true }
    );
    stage.addEventListener('pointerleave', () => setView(0, 0, view.tz));
    stage.addEventListener('dblclick', () => setView(0, 0, 1));

    /* ---- Interactive Chapter Index Click Inside Book ---- */
    book.addEventListener('click', (e) => {
      const gotoBtn = e.target.closest('[data-goto-spread]');
      if (!gotoBtn) return;
      e.preventDefault();
      e.stopPropagation();
      hideHint();
      const targetSpread = Number(gotoBtn.dataset.gotoSpread);
      if (!Number.isNaN(targetSpread)) {
        flipToSpread(targetSpread);
      }
    });

    /* ---- Pointer Drag-to-Turn ---- */
    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('[data-goto-spread]')) return;
      const onBook = e.target.closest('#sbBook');
      if (!onBook) return;
      const r = book.getBoundingClientRect();
      const relX = (e.clientX - r.left) / (r.width || 1);
      // When book is closed (idx === 0), only the right half (relX >= 0.45) is the cover, and clicking/dragging it always opens ('next')
      if (idx === 0 && !turn && relX < 0.45) return;
      e.preventDefault();
      stage.setPointerCapture(e.pointerId);
      hideHint();
      const dir = idx === 0 ? 'next' : relX > 0.5 ? 'next' : 'prev';
      startTurn(dir, 0);
      drag = { dir, x0: e.clientX, w: r.width, moved: 0, vel: 0, tPrev: performance.now() };
    });

    stage.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      const activeDir = turn ? turn.dir : drag.dir;
      const raw = (activeDir === 'next' ? -dx : dx) / (drag.w * 0.62);
      const t = Math.max(0, Math.min(1, raw));
      const now = performance.now();
      drag.vel = (t - (turn ? turn.t : 0)) / Math.max(0.001, (now - drag.tPrev) / 1000);
      drag.tPrev = now;
      if (turn) {
        turn.t = t;
        applyTurn(t);
      }
    });

    function endDrag() {
      if (!drag) return;
      const d = drag;
      drag = null;
      if (!turn) return;
      if (d.moved < 6) {
        commit();
        return;
      }
      const go = turn.t > 0.38 || d.vel > 1.0;
      if (go) commit();
      else cancel();
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
  }

  function startTurn(dir, t) {
    spring = null;
    if (turn) {
      idx = turn.to;
      turn = null;
    }
    const from = idx;
    if (from === 0 && dir === 'prev') return;
    const to = dir === 'next' ? (from + 1) % M : (from - 1 + M) % M;
    const actualDir = to === 0 ? 'prev' : from === 0 ? 'next' : dir;
    turn = {
      dir: actualDir,
      from,
      to,
      t: t || 0,
    };
    paint();
  }

  function commit() {
    if (!turn) return;
    if (REDUCED || window.innerWidth <= 992) {
      idx = turn.to;
      turn = null;
      paint();
      return;
    }
    animateTo(
      1,
      () => {
        idx = turn.to;
        turn = null;
        paint();
      },
      170,
      26
    );
  }

  function cancel() {
    if (!turn) return;
    animateTo(
      0,
      () => {
        turn = null;
        paint();
      },
      150,
      24
    );
  }

  function step(dir) {
    if (turn) {
      idx = turn.to;
      turn = null;
    }
    if (dir === 'prev' && idx === 0) return;
    if (dir === 'next' && idx === M - 1) {
      flipToSpread(0);
      return;
    }
    startTurn(dir, 0);
    commit();
  }

  function flipToSpread(targetIndex) {
    if (!M) return;
    const nextIdx = ((targetIndex % M) + M) % M;
    if (nextIdx === idx && !turn) return;
    if (turn) {
      idx = turn.to;
      turn = null;
    }
    const dir = nextIdx > idx ? 'next' : 'prev';
    turn = { dir, from: idx, to: nextIdx, t: 0 };
    paint();
    commit();
  }

  function filterMenu(category) {
    const found = spreads.findIndex((sp) => sp.dataset.category === category);
    flipToSpread(found >= 0 ? found : 0);
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const spreadIdx = Number(pill.dataset.spread);
      if (!Number.isNaN(spreadIdx)) {
        flipToSpread(spreadIdx);
      } else {
        filterMenu(pill.dataset.category || 'pho');
      }
    });
  });

  if (prevSpreadBtn) prevSpreadBtn.addEventListener('click', () => step('prev'));
  if (menuIndexBtn) {
    menuIndexBtn.addEventListener('click', () => {
      const cur = turn ? turn.to : idx;
      flipToSpread(cur === 1 ? 0 : 1);
    });
  }
  if (nextSpreadBtn) nextSpreadBtn.addEventListener('click', () => step('next'));
  if (sbLeft) sbLeft.addEventListener('click', () => step('prev'));
  if (sbRight) sbRight.addEventListener('click', () => step('next'));

  document.addEventListener('keydown', (e) => {
    if (!fullMenu || !fullMenu.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') step('next');
    if (e.key === 'ArrowLeft') step('prev');
  });

  paint();

  // 3. Category Cards in Carousel Click -> Open Full Menu & Flip to Chapter
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      if (cat) {
        if (fullMenu && !fullMenu.classList.contains('is-open')) {
          fullMenu.classList.add('is-open');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            const chevron = toggleBtn.querySelector('.toggle-chevron');
            if (chevron) chevron.textContent = '▴';
            const label = toggleBtn.querySelector(
              'span:not(.toggle-icon):not(.toggle-chevron)'
            );
            if (label) label.textContent = 'Hide Complete Menu Book';
          }
        }
        filterMenu(cat);
        const menuElem = document.getElementById('menu-showcase');
        if (menuElem) {
          menuElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 5. Testimonials Interactive Carousel Logic
  const testimonials = [
    {
      name: 'James Carter',
      role: 'Food Blogger',
      quote:
        '“The food was absolutely amazing! Every bite was fresh, flavorful, and perfectly cooked. I\'ll definitely be coming back with great satisfaction, happiness, and memorable experience.”',
      image: 'assets/images/testimonial-james-carter.jpg',
      alt: 'James Carter - Food Blogger',
    },
    {
      name: 'Minh Vu',
      role: 'Executive Food Critic',
      quote:
        '“As someone who grew up with Saigon street food, Phở Sydney captures the real soul of Vietnamese cuisine. The 24-hour beef bone broth has exceptional depth and intoxicating aroma.”',
      image: 'assets/images/testimonial-minh-vu.jpg',
      alt: 'Minh Vu - Executive Food Critic',
    },
    {
      name: 'Sophia Nguyen',
      role: 'Culinary Travel Writer',
      quote:
        '“A gem in Atlantic City! From their crispy lemongrass bánh mì to the savory broken rice platter, every dish honors Vietnamese culinary heritage while serving modern, vibrant comfort.”',
      image: 'assets/images/testimonial-sophia-nguyen.jpg',
      alt: 'Sophia Nguyen - Culinary Travel Writer',
    },
  ];

  let currentTestiIndex = 0;
  const mainImg = document.getElementById('testimonialMainImg');
  const quoteEl = document.getElementById('testimonialQuote');
  const authorEl = document.getElementById('testimonialAuthor');
  const roleEl = document.getElementById('testimonialRole');
  const thumbImg = document.getElementById('testimonialThumbImg');
  const prevTestiBtn = document.getElementById('testiPrevBtn');
  const nextTestiBtn = document.getElementById('testiNextBtn');
  const nextPreview = document.getElementById('testiNextPreview');

  function renderTestimonial(index) {
    if (!mainImg || !quoteEl) return;
    const current = testimonials[index];
    const nextIndex = (index + 1) % testimonials.length;
    const upcoming = testimonials[nextIndex];

    mainImg.style.opacity = '0';
    quoteEl.style.opacity = '0';
    if (thumbImg) thumbImg.style.opacity = '0';

    setTimeout(() => {
      mainImg.src = current.image;
      mainImg.alt = current.alt;
      quoteEl.textContent = current.quote;
      if (authorEl) authorEl.textContent = current.name;
      if (roleEl) roleEl.textContent = current.role;

      if (thumbImg) {
        thumbImg.src = upcoming.image;
        thumbImg.alt = `Upcoming Reviewer: ${upcoming.name}`;
      }
      if (nextPreview) {
        nextPreview.setAttribute(
          'aria-label',
          `View next review from ${upcoming.name}`
        );
      }

      mainImg.style.opacity = '1';
      quoteEl.style.opacity = '1';
      if (thumbImg) thumbImg.style.opacity = '1';
    }, 200);
  }

  if (nextTestiBtn) {
    nextTestiBtn.addEventListener('click', () => {
      currentTestiIndex = (currentTestiIndex + 1) % testimonials.length;
      renderTestimonial(currentTestiIndex);
    });
  }

  if (prevTestiBtn) {
    prevTestiBtn.addEventListener('click', () => {
      currentTestiIndex =
        (currentTestiIndex - 1 + testimonials.length) % testimonials.length;
      renderTestimonial(currentTestiIndex);
    });
  }

  if (nextPreview) {
    nextPreview.addEventListener('click', () => {
      currentTestiIndex = (currentTestiIndex + 1) % testimonials.length;
      renderTestimonial(currentTestiIndex);
    });
    nextPreview.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        currentTestiIndex = (currentTestiIndex + 1) % testimonials.length;
        renderTestimonial(currentTestiIndex);
      }
    });
  }

  // 6. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Optional: collapse others or toggle
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isActive) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });
});
