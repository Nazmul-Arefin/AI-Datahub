/** Shared UI helpers (toast, etc.). */

export function createToastController() {
  const toast = document.getElementById('toast');
  const toastAction = document.getElementById('toastAction');
  let toastTimer = 0;
  let toastActionHandler = null;

  function showToast(message, options = {}) {
    if (!toast) return;
    const span = toast.querySelector('span');
    if (span) span.textContent = message;
    toastActionHandler = typeof options.onAction === 'function' ? options.onAction : null;
    if (toastAction) {
      toastAction.hidden = !toastActionHandler;
      toastAction.textContent = options.actionLabel || 'Undo';
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
      toastActionHandler = null;
      if (toastAction) toastAction.hidden = true;
    }, options.duration || 2100);
  }

  toastAction?.addEventListener('click', () => {
    if (toastActionHandler) toastActionHandler();
  });

  return { showToast };
}
