/**
 * Phở Sydney - Main Application Scripts
 * Interactive Categories Carousel & Menu Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🍜 Phở Sydney Website initialized.');

  // Popular Categories are displayed in a responsive grid (no horizontal scroll needed)

  // 2. Menu Filtering Logic
  const pills = document.querySelectorAll('.cat-pill');
  const dishCards = document.querySelectorAll('.dish-card');

  function filterMenu(category) {
    pills.forEach((p) => {
      if (p.dataset.category === category) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    dishCards.forEach((dish) => {
      const dishCat = dish.dataset.category;
      if (category === 'all' || dishCat === category) {
        dish.style.display = '';
        dish.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        dish.style.display = 'none';
      }
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category || 'all';
      filterMenu(cat);
    });
  });

  // 3. Full Menu Collapsible Toggle Logic
  const toggleBtn = document.getElementById('toggleFullMenuBtn');
  const fullMenu = document.getElementById('fullMenuCollapsible');

  if (toggleBtn && fullMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = fullMenu.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      const chevron = toggleBtn.querySelector('.toggle-chevron');
      if (chevron) chevron.textContent = isOpen ? '▴' : '▾';
      const label = toggleBtn.querySelector('span:not(.toggle-icon):not(.toggle-chevron)');
      if (label) {
        label.textContent = isOpen
          ? 'Hide Complete Menu'
          : 'Explore Complete Categorized Menu (75+ Dishes)';
      }
    });
  }

  // 4. Category Cards in Carousel Click -> Open Full Menu & Filter
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const cat = card.dataset.category;
      if (cat) {
        if (fullMenu && !fullMenu.classList.contains('is-open')) {
          fullMenu.classList.add('is-open');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            const chevron = toggleBtn.querySelector('.toggle-chevron');
            if (chevron) chevron.textContent = '▴';
            const label = toggleBtn.querySelector('span:not(.toggle-icon):not(.toggle-chevron)');
            if (label) label.textContent = 'Hide Complete Menu';
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
});
