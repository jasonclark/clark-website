'use strict';

const version = 'v0.01::';
const staticCacheName = version + 'static';
const pagesCacheName = version + 'pages';
const imagesCacheName = version + 'images';

const offlinePages = [
  '/404.html',
  '/about.html',
  '/code.html',
  '/contact.html',
  '/index.html',
  '/resume.html',
  '/search.html',
  '/sitemap.html',
  '/talks.html',
  '/files/clark-jason-cv.pdf',
  '/',
  '/offline.html'
];

const staticAssets = [
  '/meta/scripts/global.js',
  '/meta/styles/global.css',
  '/meta/img/catalog-card.png',
  '/meta/img/catalog-card-small.png',
  '/meta/img/clark-profile.jpg',
  '/meta/img/dog.jpg',
  '/meta/inc/footer.html',
  '/meta/inc/header.html'
];

function stashInCache(cacheName, request, response) {
  caches.open(cacheName)
    .then( cache => cache.put(request, response) );
}

function updateStaticCache() {
  //try to fetch static top level pages - can be done after install.
  caches.open(staticCacheName)
    .then( cache => {
      //these items must be cached for the Service Worker to complete installation
      return cache.addAll(offlinePages.map(url => new Request(url, {credentials: 'include'})));
    });

  return caches.open(staticCacheName)
    .then( cache => {
      //these items must be cached for the Service Worker to complete installation
      return cache.addAll(staticAssets.map(url => new Request(url, {credentials: 'include'})));
    });
}

//limit the number of items in a specified cache.
function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(() => {
                trimCache(cacheName, maxItems)
              });
          }
        });
    });
}

//remove caches whose name is no longer valid
function clearOldCaches() {
  return caches.keys()
    .then( keys => {
      return Promise.all(keys
        .filter(key => key.indexOf(version) !== 0)
        .map(key => caches.delete(key))
      );
    });
}

//INSTALL
self.addEventListener('install', event => {
  event.waitUntil(updateStaticCache()
    .then( () => self.skipWaiting() )
  );
});

//ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(clearOldCaches()
    .then( () => self.clients.claim() )
  );
});

self.addEventListener('message', event => {
  if (event.data.command === 'trimCaches') {
    trimCache(pagesCacheName, 35);
    trimCache(imagesCacheName, 45);
  }
});

//FETCH
self.addEventListener('fetch', event => {
  let request = event.request;
  let url = new URL(request.url);

  //ignore requests to some directories
  if (request.url.indexOf('/dev/') !== -1 || request.url.indexOf('/files/') !== -1) {
    return;
  }

  //ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  //look in the cache first, fall back to the network, finally offline page
  event.respondWith(
    caches.match(request)
      .then(response => {
        //CACHE
        return response || fetch(request)
          .then( response => {
            //NETWORK
            let copy = response.clone();
            if (offlinePages.includes(url.pathname) || offlinePages.includes(url.pathname + '/')) {
              stashInCache(staticCacheName, request, copy);
            } else {
              stashInCache(pagesCacheName, request, copy);
            }
            if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
            //if (request.headers.get('Accept').indexOf('image') !== -1) {
              let copy = response.clone();
              stashInCache(imagesCacheName, request, copy);
            }
            return response;
          })
      })
      .catch(function () {
        return caches.match(request)
          .then(function (response) {
            return response || caches.match('/offline.html');
          })
      })
  );
});
