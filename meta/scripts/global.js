// register the service-worker
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('serviceworker.js', {
    scope: '/~jason/'
  }).then(function(reg) {
    // registration worked
    console.log('Registration succeeded. Scope is ' + reg.scope);
  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
};