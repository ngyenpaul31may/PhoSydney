/**
 * Phở Sydney — Concept 1 (Impossible Foods Style)
 * Interactive features: Category filtering, quick actions, smooth transitions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCategoryFilters();
  initOrderActions();
});

/**
 * Filter product cards by category
 */
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-pill');
  const productCards = document.querySelectorAll('.product-card');

  if (!filterButtons.length || !productCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-category');

      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Handle Order button feedback
 */
function initOrderActions() {
  const orderButtons = document.querySelectorAll('.btn-order-trigger');
  
  orderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.product-card');
      const dishTitle = card ? card.querySelector('.product-title').textContent : 'Món ăn';
      
      // Temporary button state
      const originalText = btn.innerHTML;
      btn.innerHTML = 'ĐÃ CHỌN ✓';
      btn.style.backgroundColor = '#4f0423';
      btn.style.borderColor = '#ffffff';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
      }, 1500);

      // Toast feedback
      showToast(`Đã thêm ${dishTitle} vào danh sách đặt món!`);
    });
  });
}

/**
 * Simple minimal toast notification in brand style
 */
function showToast(message) {
  let toast = document.getElementById('brand-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'brand-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = '#e10600';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '15px';
    toast.style.fontFamily = "'Inter', sans-serif";
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 2200);
}
