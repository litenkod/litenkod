const SW_URL = '/sw.js';

function promptUpdate(waitingWorker) {
  const updateEvent = new CustomEvent('sw:update', { detail: waitingWorker });
  window.dispatchEvent(updateEvent);

  let shouldUpdate = true;
  if (typeof window.confirm === 'function') {
    shouldUpdate = window.confirm('Ny version av litenkod finns tillgänglig. Vill du ladda om?');
  }

  if (shouldUpdate) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register(SW_URL);

    if (registration.waiting) {
      promptUpdate(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          promptUpdate(newWorker);
        }
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker().catch((error) => {
      console.error('Service worker registration error:', error);
    });
  });
}

export {};
