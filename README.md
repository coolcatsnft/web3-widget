# Web 3 widget library
To add it to a website add the following script:
```
<script>
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
    }(window, document, 'script', 'mw', 'URL_TO_SCRIPT'));
    mw('NETWORK_ID', 1);
    mw('INFURA_APP_NAME', '');
    mw('INFURA_ID', '');
    mw('WALLET_LIST', ['custom-metamask', 'walletlink', 'walletconnect']);
</script>
```
And place the web component: `<web3-button></web3-button>`


You need to fill in the script with your settings:
- URL_TO_SCRIPT
- NETWORK_ID: 
- INFURA_APP_NAME:
- INFURA_ID:
- WALLET_LIST: list of supported wallets

The library sends a custom event `web3-widget-event` on connect, disconnect and network change, that you can listen to and get the web3 connection status and selected account.
```
    {
        detail: {
            address: "0x..."
            status: "connected"
        }
        ...
    }
```
- list of web3 statuses: `disconnected`, `connected`, `pending`, `wrong_network`
  
