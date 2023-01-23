(function(w, d, s, o, f, js, fjs) {
    w['web3-widget'] = o;
    w[o] = w[o] || function() {
      (w[o].q = w[o].q || []).push(arguments);
    };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'mw', './main.js'));
  mw('NETWORK_ID', JSON.parse(localStorage.getItem('NETWORK_ID')));
  mw('MAGIC_LINK_KEY', localStorage.getItem('MAGIC_LINK_KEY'));
  mw('IS_DEV', true);
  mw('CLASS', '');
