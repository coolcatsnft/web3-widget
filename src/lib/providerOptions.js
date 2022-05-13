import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import WalletConnect from '@walletconnect/web3-provider';

const globalObject = window[window['web3-widget']];
export const configuration = globalObject.q.reduce((acc, conf) => ({ ...acc, [conf[0]]: conf[1] }), {});

const definedProviders = configuration.WALLET_LIST;
const infuraId = configuration.INFURA_ID;
const appName = configuration.INFURA_APP_NAME;
export const networkId = configuration.NETWORK_ID;

export const allProviderOptions = {
  'custom-metamask': {
    display: {
      logo: '../assets/metamask-logo.svg',
      name: 'MetaMask Wallet',
      description: 'Connect to your MetaMask Wallet'
    },
    package: true,
    connector: async () => {
      if (typeof window.ethereum === 'undefined') {
        window.location = 'https://metamask.app.link/dapp/www.ethbox.org/app/';
        return;
      }

      let provider = null;
      if (typeof window.ethereum !== 'undefined') {
        const { providers } = window.ethereum;
        if (typeof providers !== 'undefined') {
          // Needed to avoid opening brave browser wallet instead of metamask
          provider = providers.slice().reverse().find(p => p.isMetaMask);
        } else {
          provider = window.ethereum;
        }

        try {
          await provider.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          throw new Error('User Rejected');
        }
      } else {
        throw new Error('No MetaMask Wallet found');
      }
      return provider;
    }
  },
  walletlink: {
    package: CoinbaseWalletSDK,
    options: {
      appName,
      infuraId
    }
  },
  walletconnect: {
    package: WalletConnect,
    options: {
      infuraId
    }
  }
};

export const providerOptions = definedProviders.reduce((acc, provider) => {
  return { ...acc, [provider]: allProviderOptions[provider] };
}, {});
