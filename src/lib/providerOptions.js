import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import WalletConnect from '@walletconnect/web3-provider';
import { sequence } from '0xsequence';
import { networkName } from './networkName';

const globalObject = window[window['web3-widget']];
export const configuration = (globalObject.q || [["NETWORK_ID", 4]]).reduce((acc, conf) => ({ ...acc, [conf[0]]: conf[1] }), {});

let definedProviders = configuration.WALLET_LIST || [];
const infuraId = configuration.INFURA_ID;
const appName = configuration.INFURA_APP_NAME || 'Web3 Connect';
export const networkId = configuration.NETWORK_ID;

if (!infuraId) {
  definedProviders = definedProviders.filter((p => !['walletconnect', 'walletlink'].includes(p)));
}

if (definedProviders.includes('metamask')) {
  definedProviders = definedProviders.filter((p => p !== 'metamask'));
  definedProviders.push('custom-metamask');
}

if (definedProviders.length === 0) {
  definedProviders.push('custom-metamask');
}

export const allProviderOptions = {
  'custom-metamask': {
    display: {
      logo: 'https://coolcatsnft.github.io/web3-widget/assets/metamask-logo.svg',
      name: 'MetaMask Wallet',
      description: 'Connect to your MetaMask Wallet'
    },
    package: true,
    connector: async () => {
      if (typeof window.ethereum === 'undefined') {
        window.location = `https://metamask.app.link/dapp/${window.location.href}`;
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
  },
  sequence: {
    package: sequence,
    options: {
      appName,
      defaultNetwork: networkName(networkId).toLowerCase()
    }
  }
};

export const providerOptions = definedProviders.reduce((acc, provider) => {
  return { ...acc, [provider]: allProviderOptions[provider] };
}, {});
