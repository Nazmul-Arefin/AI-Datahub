import { initAuthGateUi } from '../shared/js/auth-gate.js';
import { ensureAuthenticated } from '../shared/js/repositories/authRepository.js';
import { createRouter } from './router.js';
import { createStore } from '../shared/js/store.js';
import { createToastController } from '../shared/js/ui.js';
import { initShell } from '../shared/js/shell.js';

// Wire the visible gate before the heavy runtime module finishes work.
initAuthGateUi();

const store = createStore();
const { showToast } = createToastController();

let navigate = (routeId, options) => {
  window.location.hash = `#/${routeId}`;
};

const shell = initShell({
  navigate: (routeId, options) => navigate(routeId, options),
  showToast,
  store,
});

async function startApp() {
  try {
    await ensureAuthenticated();
    const runtime = await import('../shared/js/app-runtime.js');
    const router = createRouter({
      outlet: document.getElementById('page-outlet'),
      store,
      showToast,
      runtime,
      onRouteChange(route, params) {
        shell.onRouteChange(route, params);
      },
    });
    navigate = router.navigate;
    await router.start();
  } catch (error) {
    console.error('Failed to start Weeple app', error);
    showToast('App failed to load');
  }
}

void startApp();
