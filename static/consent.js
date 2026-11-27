/* NomadSwipe analytics consent. Google Analytics loads only after the visitor clicks Accept. */
(function () {
  if (window.nsConsent) return;
  var ID = 'G-H8B30WDTWF', KEY = 'ns_consent', loaded = false, box = null;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var gtag = window.gtag;
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

  function get() { try { var v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch (e) { return null; } }
  function put(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function load() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function hide() { if (box && box.parentNode) box.parentNode.removeChild(box); box = null; }

  // Withdrawal must also remove what GA already stored: _ga and _ga_<id> on this host and the parent domain.
  function clearGa() {
    var host = location.hostname, doms = ['', host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].replace(/^\s+/, '');
      if (n !== '_ga' && n.indexOf('_ga_') !== 0) return;
      for (var i = 0; i < doms.length; i++) document.cookie = n + '=; Max-Age=0; path=/' + (doms[i] ? '; domain=' + doms[i] : '');
    });
  }

  function choose(v) {
    var was = get();
    put(v);
    hide();
    if (v === 'granted') load();
    else if (was === 'granted' || loaded) { clearGa(); location.reload(); }
  }

  function css() {
    var s = document.createElement('style');
    s.id = 'ns-consent-style';
    s.textContent = '.ns-consent{position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483000;max-width:520px;margin:0 auto;padding:12px 14px;background:#111;color:#fff;border:1px solid #fff;border-radius:10px;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.4);box-sizing:border-box}' +
      '.ns-consent p{margin:0 0 10px;color:#fff}.ns-consent a{color:#fff;text-decoration:underline}' +
      '.ns-consent-row{display:flex;gap:8px}' +
      '.ns-consent-btn{flex:1 1 0;min-height:40px;padding:8px 12px;background:#fff;color:#111;border:2px solid #fff;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}' +
      '.ns-consent-btn:focus{outline:3px solid #ffd54a;outline-offset:2px}';
    document.head.appendChild(s);
  }

  function btn(label, v) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ns-consent-btn';
    b.textContent = label;
    b.onclick = function () { choose(v); };
    return b;
  }

  function show() {
    if (box || !document.body) return;
    if (!document.getElementById('ns-consent-style')) css();
    box = document.createElement('div');
    box.className = 'ns-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie consent');
    var p = document.createElement('p');
    p.appendChild(document.createTextNode('We use Google Analytics cookies to see which pages help travelers, only if you allow it. '));
    var a = document.createElement('a');
    a.href = '/privacypolicy.html#cookies';
    a.textContent = 'Learn more';
    p.appendChild(a);
    var row = document.createElement('div');
    row.className = 'ns-consent-row';
    var reject = btn('Reject', 'denied');
    row.appendChild(reject);
    row.appendChild(btn('Accept', 'granted'));
    box.appendChild(p);
    box.appendChild(row);
    document.body.appendChild(box);
    return reject;
  }

  window.nsConsent = { open: function () { hide(); var b = show(); if (b) b.focus(); } };

  var stored = get();
  if (stored === 'granted') load();
  else if (!stored && navigator.globalPrivacyControl !== true) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
    else show();
  }
})();
