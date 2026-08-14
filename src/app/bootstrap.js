import { createRouter } from './router.js';
import { bindShell } from '../shared/js/shell.js';
import { createStore } from '../shared/js/store.js';
import { showToast } from '../shared/js/ui.js';

const outlet = document.getElementById('pageOutlet');
const store = createStore();
const router = createRouter({ outlet, store, showToast });

window.WeepleRouter = router;
window.WeepleStore = store;

try {
  await router.loadViews();
  await import('../shared/js/legacy-runtime.js');
  bindShell(router);
  router.start();
} catch (error) {
  console.error(error);
  outlet.innerHTML = `
    <section class="page-load-error" role="alert">
      <h1>Weeple could not load this workspace.</h1>
      <p>Run the project through a local HTTP server and refresh the page.</p>
    </section>`;
}
