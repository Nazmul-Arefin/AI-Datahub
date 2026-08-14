export function showToast(message, options = {}) {
  if (window.WeepleLegacy?.showToast) {
    window.WeepleLegacy.showToast(message, options);
    return;
  }

  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), options.duration || 2100);
}
