let mounted = false;

export async function mount({ outlet }) {
  mounted = true;
  outlet.classList.add('page--import-data');
  window.WeepleLegacy.openPrimaryView('data', false);
}

export async function unmount() {
  if (!mounted) return;
  mounted = false;
  document.getElementById('pageOutlet')?.classList.remove('page--import-data');
}
