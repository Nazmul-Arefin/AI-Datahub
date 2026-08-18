import { createRouter } from './router.js';
import { createStore } from '../shared/js/store.js';
import { createToastController } from '../shared/js/ui.js';
import { initShell } from '../shared/js/shell.js';
import * as runtime from '../shared/js/app-runtime.js';

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

void router.start().catch((error) => {
  console.error('Failed to start Weeple app', error);
  showToast('App failed to load');
});
