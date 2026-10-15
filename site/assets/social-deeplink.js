(function () {
  'use strict';

  var ua = navigator.userAgent;
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  var isMobile = isAndroid || isIOS || /Mobile/i.test(ua);
  if (!isMobile) return;

  function parse(url) {
    try {
      var u = new URL(url, window.location.href);
      var host = u.hostname.replace(/^www\./, '');
      var parts = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '').split('/');
      var web = u.href;

      if (host === 'linkedin.com' && parts[0]) {
        var liPath = parts.join('/');
        return {
          scheme: 'linkedin://' + liPath,
          intent: 'intent://' + liPath +
            '#Intent;scheme=linkedin;package=com.linkedin.android;S.browser_fallback_url=' +
            encodeURIComponent(web) + ';end',
          web: web
        };
      }

      if (host === 'instagram.com' && parts[0]) {
        var igQuery = 'user?username=' + parts[0];
        return {
          scheme: 'instagram://' + igQuery,
          intent: 'intent://' + igQuery +
            '#Intent;scheme=instagram;package=com.instagram.android;S.browser_fallback_url=' +
            encodeURIComponent(web) + ';end',
          web: web
        };
      }
    } catch (e) {}
    return null;
  }

  function open(deep) {
    if (isAndroid && deep.intent) {
      window.location.href = deep.intent;
      return;
    }

    var start = Date.now();
    var left = false;
    var timer;

    function cleanup() {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      if (timer) window.clearTimeout(timer);
    }

    function onHide() {
      if (document.hidden) {
        left = true;
        cleanup();
      }
    }

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);

    timer = window.setTimeout(function () {
      if (left || document.hidden) return;
      cleanup();
      if (Date.now() - start < 2000) window.location.href = deep.web;
    }, 1300);

    window.location.href = deep.scheme;
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;

    var anchor = event.target.closest ? event.target.closest('a[data-deeplink]') : null;
    if (!anchor) return;

    var href = anchor.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return;

    var deep = parse(anchor.href);
    if (!deep) return;

    event.preventDefault();
    open(deep);
  });
})();
