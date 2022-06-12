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
    mw('IS_DEV', false);
</script>
```
And place the web component: `<web3-button></web3-button>`


You need to fill in the script with your settings:
- URL_TO_SCRIPT
- NETWORK_ID: 
- INFURA_APP_NAME:
- INFURA_ID:
- WALLET_LIST: list of supported wallets
- IS_DEV: By default, the component only supports HTTPS.  Setting this to true will disable this and allow to test on local HTTP connections.

The library sends a custom event `web3-widget-event` on connect, disconnect, network change and ETH balance change, that you can listen to and get the web3 connection status and selected account.
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
  
### Embedding in React
Here is a quick example of how we currently embed the widget in React applications:

```
import { createElement, memo, useEffect } from "react";

export function Web3Button() {
  useEffect(() => {
    const id = 'web3-button-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.id = id;
      s.innerHTML = `(function(w, d, s, o, f, js, fjs) {
        w['web3-widget'] = o;
        w[o] = w[o] || function() {
          (w[o].q = w[o].q || []).push(arguments);
        };
        js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
        js.id = o;
        js.src = f;
        js.async = 1;
        fjs.parentNode.insertBefore(js, fjs);
      }(window, document, 'script', 'mw', 'https://coolcatsnft.github.io/web3-widget/main.js'));
      mw('NETWORK_ID', 4);`;
      document.body.appendChild(s);
    }
  }, []);
  
  return createElement('web3-button', { }, null);
}

export default memo(Web3Button);
```

The embed code is the same, however we are wrapping it in a `useEffect` and rendering a web3-button element using `React.createElement`.
