/* Portafolio de Anticipa · revelado al entrar en pantalla. Sin dependencias. */
(function () {
  'use strict';
  var els = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  /* escalonado entre hermanos que entran juntos */
  els.forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.setProperty('--d', Math.min(i, 5) * 0.07 + 's');
  });
  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
})();
