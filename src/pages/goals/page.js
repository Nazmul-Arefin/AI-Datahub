let mounted = false;

export async function mount({ outlet }) {
  mounted = true;
  outlet.classList.add('page--goals');
  window.WeepleLegacy.openPrimaryView('goals', false);
}

export async function unmount() {
  if (!mounted) return;
  mounted = false;
  document.getElementById('pageOutlet')?.classList.remove('page--goals');
}
