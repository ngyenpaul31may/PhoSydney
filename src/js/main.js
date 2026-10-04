/**
 * Phở Sydney - Main Application Scripts
 * Interactive Categories Carousel & Menu Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🍜 Phở Sydney Website initialized.');

  // 1. Categories Carousel Navigation
  const track = document.getElementById('categoriesTrack');
  const prevBtn = document.getElementById('catPrevBtn');
  const nextBtn = document.getElementById('catNextBtn');

  if (track && nextBtn) {
    const updateArrows = () => {
      if (prevBtn) {
        prevBtn.style.display = track.scrollLeft > 20 ? 'flex' : 'none';
      }
      if (nextBtn) {
        const maxScroll = track.scrollWidth - track.clientWidth - 20;
        nextBtn.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
      }
    };

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: 340, behavior: 'smooth' });
      setTimeout(updateArrows, 320);
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -340, behavior: 'smooth' });
        setTimeout(updateArrows, 320);
      });
    }

    track.addEventListener('scroll', updateArrows);
    updateArrows();
  }

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
});
