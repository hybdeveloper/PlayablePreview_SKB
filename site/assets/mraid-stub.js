/* MRAID 3.0 stub injected into playables by Playable Preview. Mimics the
 * container AppLovin provides and reports activity to the preview page. */
(function () {
  if (window.__ppStub) return;
  window.__ppStub = true;
  var post = function (type, detail) {
    try { parent.postMessage({ __pp: 1, type: type, detail: String(detail == null ? '' : detail) }, '*'); } catch (e) { /* ignore */ }
  };
  var listeners = {}, state = 'loading', viewable = false;
  // CTA opens the real store link (from the click gesture inside the ad, so
  // popup blockers allow it) unless the preview's "Open CTA links" is off.
  var nativeOpen = window.open;
  var openLink = function (url) {
    var allow = true;
    try { allow = parent.PP_OPEN_CTA !== false; } catch (e) { /* cross-origin parent */ }
    if (allow && url) { try { nativeOpen.call(window, url, '_blank', 'noopener'); } catch (e) { /* blocked */ } }
  };
  var orientation = { allowOrientationChange: true, forceOrientation: 'none' };
  var size = function () { return { width: window.innerWidth, height: window.innerHeight }; };
  var rect = function () { var s = size(); return { x: 0, y: 0, width: s.width, height: s.height }; };
  function fire(ev) {
    var args = Array.prototype.slice.call(arguments, 1);
    (listeners[ev] || []).slice().forEach(function (fn) {
      try { fn.apply(window, args); } catch (e) { post('error', (e && e.stack) || e); }
    });
  }
  window.mraid = {
    getVersion: function () { return '3.0'; },
    getState: function () { return state; },
    getPlacementType: function () { return 'interstitial'; },
    isViewable: function () { return viewable; },
    getMaxSize: size,
    getScreenSize: size,
    getCurrentPosition: rect,
    getDefaultPosition: rect,
    getExpandProperties: function () { var s = size(); return { width: s.width, height: s.height, useCustomClose: false, isModal: true }; },
    setExpandProperties: function () {},
    getResizeProperties: function () { return {}; },
    setResizeProperties: function () {},
    getOrientationProperties: function () { return orientation; },
    setOrientationProperties: function (p) { orientation = p || orientation; post('mraid', 'setOrientationProperties(' + JSON.stringify(p) + ')'); },
    getCurrentAppOrientation: function () { var s = size(); return { orientation: s.width > s.height ? 'landscape' : 'portrait', locked: false }; },
    getAudioVolumePercentage: function () { return 100; },
    supports: function (f) { return f === 'inlineVideo'; },
    addEventListener: function (ev, fn) {
      if (typeof fn !== 'function') return;
      (listeners[ev] = listeners[ev] || []).push(fn);
      post('mraid', 'addEventListener("' + ev + '")');
    },
    removeEventListener: function (ev, fn) {
      if (!listeners[ev]) return;
      listeners[ev] = fn ? listeners[ev].filter(function (f) { return f !== fn; }) : [];
    },
    open: function (url) { post('cta', 'mraid.open(' + (url || '') + ')'); openLink(url); },
    close: function () { post('close', 'mraid.close()'); },
    unload: function () { post('close', 'mraid.unload()'); },
    expand: function () { post('mraid', 'expand()'); },
    resize: function () { post('mraid', 'resize()'); },
    useCustomClose: function (v) { post('mraid', 'useCustomClose(' + v + ')'); },
    playVideo: function (url) { post('mraid', 'playVideo(' + url + ')'); },
    storePicture: function (url) { post('mraid', 'storePicture(' + url + ')'); },
    createCalendarEvent: function () { post('mraid', 'createCalendarEvent()'); },
  };
  if (!window.ExitApi) window.ExitApi = { exit: function () { post('cta', 'ExitApi.exit()'); } };
  window.open = function (url) { post('cta', 'window.open(' + (url || '') + ')'); openLink(url); return null; };
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) post('error', 'Failed to load ' + (t.src || t.href));
    else post('error', (e.message || 'Error') + (e.lineno ? ' (line ' + e.lineno + ')' : ''));
  }, true);
  window.addEventListener('unhandledrejection', function (e) { post('error', 'Unhandled rejection: ' + ((e.reason && e.reason.message) || e.reason)); });
  ['error', 'warn'].forEach(function (k) {
    var orig = console[k];
    console[k] = function () {
      post('console', k + ': ' + Array.prototype.map.call(arguments, String).join(' '));
      return orig.apply(console, arguments);
    };
  });
  var ready = function () {
    setTimeout(function () {
      state = 'default'; viewable = true;
      post('event', 'ready → stateChange(default) → viewableChange(true)');
      fire('ready'); fire('stateChange', 'default'); fire('viewableChange', true);
    }, 0);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
  var last = '';
  window.addEventListener('resize', function () {
    var s = size(), key = s.width + 'x' + s.height;
    if (key === last) return;
    last = key;
    fire('sizeChange', s.width, s.height);
  });
})();
