/**
 * Phở Sydney - Main Application Scripts
 * Interactive Categories Carousel & Menu Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🍜 Phở Sydney Website initialized.');

  // Popular Categories are displayed in a responsive grid (no horizontal scroll needed)

  // 2. Interactive 3D Flipbook Menu Logic
  const pills = document.querySelectorAll('.cat-pill');
  const spreads = document.querySelectorAll('.menu-book-spread');
  const bookCover = document.getElementById('menuBookCover');
  const prevSpreadBtn = document.getElementById('menuPrevSpreadBtn');
  const nextSpreadBtn = document.getElementById('menuNextSpreadBtn');
  const spreadIndicator = document.getElementById('menuSpreadIndicator');
  let currentSpread = 0;

  function flipToSpread(targetIndex) {
    if (!spreads.length) return;
    const total = spreads.length;
    const nextIdx = ((targetIndex % total) + total) % total;
    const direction = nextIdx >= currentSpread ? 'next' : 'prev';

    // Spawn 3D page-turning leaf effect when changing spreads
    if (nextIdx !== currentSpread && bookCover) {
      const leaf = document.createElement('div');
      leaf.className =
        'menu-turning-leaf ' +
        (direction === 'next' ? 'turn-forward' : 'turn-backward');
      bookCover.appendChild(leaf);
      setTimeout(() => leaf.remove(), 580);
    }

    currentSpread = nextIdx;
    const activeSpread = spreads[currentSpread];
    const activeCat = activeSpread ? activeSpread.dataset.category : 'pho';

    spreads.forEach((sp, idx) => {
      sp.classList.remove('is-active', 'flip-next-anim', 'flip-prev-anim');
      if (idx === currentSpread) {
        sp.classList.add(
          'is-active',
          direction === 'next' ? 'flip-next-anim' : 'flip-prev-anim'
        );
      }
    });

    pills.forEach((p) => {
      p.classList.toggle('active', p.dataset.category === activeCat);
    });

    if (spreadIndicator && activeSpread) {
      const p1 = currentSpread * 2 + 1;
      const p2 = currentSpread * 2 + 2;
      const title = activeSpread.dataset.title || '';
      spreadIndicator.textContent = `Trang ${p1}–${p2} / ${total * 2} • ${title}`;
    }
  }

  function filterMenu(category) {
    const idx = Array.from(spreads).findIndex(
      (sp) => sp.dataset.category === category
    );
    flipToSpread(idx >= 0 ? idx : 0);
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

  if (prevSpreadBtn) {
    prevSpreadBtn.addEventListener('click', () => {
      flipToSpread(currentSpread - 1);
    });
  }

  if (nextSpreadBtn) {
    nextSpreadBtn.addEventListener('click', () => {
      flipToSpread(currentSpread + 1);
    });
  }

  // Allow clicking right/left page edges or using Left/Right arrow keys when menu is open
  const toggleBtn = document.getElementById('toggleFullMenuBtn');
  const fullMenu = document.getElementById('fullMenuCollapsible');

  document.addEventListener('keydown', (e) => {
    if (!fullMenu || !fullMenu.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') flipToSpread(currentSpread + 1);
    if (e.key === 'ArrowLeft') flipToSpread(currentSpread - 1);
  });

  // 3. Full Menu Collapsible Toggle Logic
  if (toggleBtn && fullMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = fullMenu.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      const chevron = toggleBtn.querySelector('.toggle-chevron');
      if (chevron) chevron.textContent = isOpen ? '▴' : '▾';
      const label = toggleBtn.querySelector(
        'span:not(.toggle-icon):not(.toggle-chevron)'
      );
      if (label) {
        label.textContent = isOpen
          ? 'Hide Complete Menu Book'
          : 'Explore Complete Categorized Menu (75+ Dishes)';
      }
    });
  }

  // 4. Category Cards in Carousel Click -> Open Full Menu & Flip to Chapter
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
