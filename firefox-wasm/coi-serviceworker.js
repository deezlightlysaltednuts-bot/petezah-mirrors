/*! coi-serviceworker v0.1.7 - Guido Zuidhof, MIT License */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('message', (ev) => {
    if (!ev.data) return;
    if (ev.data.type === 'deregister') {
      self.registration
        .unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        });
    }
  });

  self.addEventListener('fetch', function (event) {
    const { request } = event;
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) return response;

          const newHeaders = new Headers(response.headers);
          newHeaders.set('Cross-Origin-Embedder-Policy', coepCredentialless ? 'credentialless' : 'require-corp');
          if (!coepCredentialless) newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
          newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem('coiReloadedBySelf');
    window.sessionStorage.removeItem('coiReloadedBySelf');
    const coi = {
      shouldRegister: () => !self.crossOriginIsolated,
      shouldDeregister: () => false,
      coepCredentialless: () => false,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi,
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker
        .register(window.document.currentScript ? window.document.currentScript.src : 'coi-serviceworker.js')
        .then(
          (registration) => {
            if (!coi.quiet) console.log('COI ServiceWorker registered', registration.scope);

            registration.addEventListener('updatefound', () => {
              if (!coi.quiet) console.log('Reloading page to make use of updated COI ServiceWorker.');
              coi.doReload();
            });

            if (registration.active && !navigator.serviceWorker.controller) {
              if (!coi.quiet) console.log('Reloading page to make use of COI ServiceWorker.');
              coi.doReload();
            }
          },
          (err) => {
            if (!coi.quiet) console.error('COI ServiceWorker registration failed: ', err);
          }
        );
    }
  })();
}
