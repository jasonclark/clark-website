'use strict';

const version = 'v0.01::';
const staticCacheName = version + 'static';

function updateStaticCache() {
    return caches.open(staticCacheName)
        .then( cache => {
            // These items must be cached for the Service Worker to complete installation
            return cache.addAll([
                '/~jason/meta/scripts/global.js',
                '/~jason/meta/styles/global.css',
                '/~jason/meta/fonts/Open-Sans-700/Open-Sans-700.ttf',
                '/~jason/meta/fonts/Open-Sans-700/Open-Sans-700.woff',
                '/~jason/meta/fonts/Open-Sans-regular/Open-Sans-regular.ttf',
                '/~jason/meta/fonts/Open-Sans-regular/Open-Sans-regular.woff',
                '/~jason/meta/img/catalog-card.png',
                '/~jason/meta/img/catalog-card-small.png',
                '/~jason/meta/img/clark-profile.jpg',
                '/~jason/meta/img/dog.jpg',
                '/~jason/404.html',
                '/~jason/about.html',
                '/~jason/code.html',
                '/~jason/contact.html',
                '/~jason/index.html',
                '/~jason/resume.html',
                '/~jason/search.html',
                '/~jason/sitemap.html',
                '/~jason/talks.html',
                '/~jason/files/clark-jason-cv.pdf',
                '/',
                '/~jason/offline.html'
            ]);
        });
}

// Remove caches whose name is no longer valid
function clearOldCaches() {
    return caches.keys()
        .then( keys => {
            return Promise.all(keys
                .filter(key => key.indexOf(version) !== 0)
                .map(key => caches.delete(key))
            );
        });
}

self.addEventListener('install', event => {
    event.waitUntil(updateStaticCache()
        .then( () => self.skipWaiting() )
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clearOldCaches()
        .then( () => self.clients.claim() )
    );
});

self.addEventListener('fetch', event => {
    let request = event.request;
    let url = new URL(request.url);

    // Ignore requests to some directories
    if (request.url.indexOf('/~jason/dev/') !== -1 || request.url.indexOf('/~jason/files/') !== -1) {
        return;
    }

    // Look in the cache first, fall back to the network, finally offline page
    event.respondWith(
        caches.match(request)
            .then(response => {
                // CACHE
                return response || fetch(request)
                    .then( response => {
                        // NETWORK
                        return response;
                    })
            })
            .catch(function () {
                return caches.match(request)
                    .then(function (response) {
                        return response || caches.match('/~jason/offline.html');
                    })
            })
    );
});
