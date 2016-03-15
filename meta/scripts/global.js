//register a service-worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/~jason/serviceworker.js', {
        scope: '/~jason/'
    });
    window.addEventListener('load', function() {
    	if (navigator.serviceWorker.controller) {
    		navigator.serviceWorker.controller.postMessage({'command': 'trimCaches'});
    	}
    });
}
