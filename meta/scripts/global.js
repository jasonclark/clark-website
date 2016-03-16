//register a service-worker
if (navigator.serviceWorker) {
	console.log('CLIENT: service worker registration in progress.');
	navigator.serviceWorker.register('serviceworker.js', {
        scope: '/~jason/'
    });
    window.addEventListener('load', function() {
    	if (navigator.serviceWorker.controller) {
    		navigator.serviceWorker.controller.postMessage({'command': 'trimCaches'});
    	}
    });
    console.log('CLIENT: service worker registration complete.');
}
