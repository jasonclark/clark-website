// set active <nav> style for current page
var navLinks = document.getElementById("nav").getElementsByTagName("a");
console.log(navLinks);
// setting active to 0 will highlight first nav item as current
let active = 0;
for (let i = 0; i < navLinks.length; i++) {
    if (navLinks[i].href === document.URL) {
        active = i;
    }
}
navLinks[active].className = "current";

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