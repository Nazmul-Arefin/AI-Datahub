import { ROUTES } from '../../app/routes.js';

/**
 * Shell chrome: clock, weather, nav active state, activity dock, onboarding hooks.
 */
export function initShell({ navigate, showToast, store }) {
  const osShell = document.querySelector('.os-shell');
  const SHELL_CLASSES = ['goals-page', 'data-page', 'use-page'];

  function setShellClass(shellClass) {
    SHELL_CLASSES.forEach((c) => osShell?.classList.remove(c));
    if (shellClass) osShell?.classList.add(shellClass);
  }

  function setActiveNav(routeId) {
    document.querySelectorAll('[data-route]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-route') === routeId);
    });
  }

  document.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-route');
      if (id && ROUTES[id]) navigate(id);
    });
  });

  document.querySelectorAll('[data-home]').forEach((btn) => {
    btn.addEventListener('click', () => navigate('overview'));
  });

  // Clock
  const deviceTime = document.getElementById('deviceTime');
  const deviceDate = document.getElementById('deviceDate');
  function tickClock() {
    const now = new Date();
    if (deviceTime) {
      deviceTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (deviceDate) {
      deviceDate.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }
  tickClock();
  window.setInterval(tickClock, 30000);

  // Weather (Open-Meteo) — best effort
  const weatherTemperature = document.getElementById('weatherTemperature');
  const weatherCondition = document.getElementById('weatherCondition');
  async function loadWeather() {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current=temperature_2m,weather_code');
      const data = await res.json();
      if (weatherTemperature) weatherTemperature.textContent = `${Math.round(data.current.temperature_2m)}°`;
      if (weatherCondition) weatherCondition.textContent = 'Local';
    } catch {
      if (weatherCondition) weatherCondition.textContent = 'Offline';
    }
  }
  void loadWeather();

  return {
    setShellClass,
    setActiveNav,
    onRouteChange(route) {
      setShellClass(route.shellClass);
      setActiveNav(route.id);
    },
  };
}
