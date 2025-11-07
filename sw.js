const CACHE_NAME = 'cocktail-pwa-v2';

const appShellAssets = [
    '/cocteles-pwa/',
    '/cocteles-pwa/index.html',
    '/cocteles-pwa/main.js',
    '/cocteles-pwa/styles/main.css',
    '/cocteles-pwa/scripts/app.js'
];

const OFFLINE_COCKTAIL_JSON = {
    drinks: [{
        idDrink: "00000",
        strDrink: "¡Sin Conexión ni Datos Frescos!",
        strTags: "FALLBACK",
        strCategory: "Desconectado",
        strInstructions: "No pudimos obtener resultados en este momento. Este es un resultado GENÉRICO para demostrar que la aplicación NO SE ROMPE. Intenta conectarte de nuevo.",
        strDrinkThumb: "https://via.placeholder.com/200x300?text=OFFLINE",
        strIngredient1: "Service Worker",
        strIngredient2: "Fallback JSON"
    }]
};



self.addEventListener('install', event => {
    console.log('Instalando y precacheando el App Shell...');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(appShellAssets);
        })
        .then(() => self.skipWaiting()) 
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] 🚀 Service Worker Activado.');
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    const isAppShellRequest = appShellAssets.includes(requestUrl.pathname);

    if (isAppShellRequest) {
        console.log(`[SW]  App Shell: CACHE ONLY para ${requestUrl.pathname}`);
        event.respondWith(
            caches.match(event.request)
            .then(response => {
                return response || new Response('App Shell Asset Missing', { status: 500 });
            })
        );
        return;
    }

    if (requestUrl.hostname === 'www.thecocktaildb.com' && requestUrl.pathname.includes('/api/json/v1/1/search.php')) {
        console.log('[SW] 🔄 API: NETWORK-FIRST con Fallback a JSON Genérico.');
        
        event.respondWith(
            fetch(event.request) 
            
            .catch(() => {
                console.log('[SW] Fallo de red. Devolviendo JSON de Fallback.');
                return new Response(JSON.stringify(OFFLINE_COCKTAIL_JSON), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

   
});