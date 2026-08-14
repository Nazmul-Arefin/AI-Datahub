let mounted = false;

export async function mount({ outlet }) {
  mounted = true;
  outlet.classList.add('page--use-memory');
  window.WeepleLegacy.openPrimaryView('memory', false);
}

export async function unmount() {
  if (!mounted) return;
  mounted = false;
  document.getElementById('pageOutlet')?.classList.remove('page--use-memory');
}
