import { configureChains, createClient, createStorage, defaultChains } from '@wagmi/core';
import { infuraProvider } from '@wagmi/core/providers/infura';
import { publicProvider } from '@wagmi/core/providers/public';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';

const globalObject = window[window['web3-widget']];
export const configuration = (globalObject.q || [['NETWORK_ID', 4]]).reduce((acc, conf) => ({
  ...acc,
  [conf[0]]: conf[1]
}), {});

const infuraId = configuration.INFURA_ID;
const appName = configuration.INFURA_APP_NAME || 'Web3 Connect';
export const networkId = configuration.NETWORK_ID;
const chain = defaultChains.find((chain) => chain.id === networkId);

let definedConnectors = configuration.WALLET_LIST || [];
if (!infuraId) {
  definedConnectors = definedConnectors.filter((p => !['walletconnect', 'walletlink'].includes(p)));
}

export const { chains, provider, webSocketProvider } = configureChains([chain], [
  infuraProvider({ apiKey: infuraId }),
  publicProvider()
]);

const allConnectors = {
  // injected: new InjectedConnector({ chains }),
  metamask: new MetaMaskConnector({ chains }),
  walletconnect: new WalletConnectConnector({ chains, options: { qrCode: true, infuraId } }),
  walletlink: new CoinbaseWalletConnector({ chains, options: { appName, jsonRpcUrl: `${chains[0].rpcUrls.infura}/${infuraId}` } })
};

export const connectorsInfo = {
  metaMask: {
    logo: 'metamask-logo.svg',
    title: 'MetaMask',
    description: 'Connect to your MetaMask wallet',
  },
  walletConnect: {
    logo: 'walletconnect.svg',
    title: 'WalletConnect',
    description: 'Scan with WalletConnect to connect',
  },
  coinbaseWallet: {
    logo: 'coinbasewallet.svg',
    title: 'Coinbase Wallet',
    description: 'Scan with Coinbase Wallet to connect',
  }
}

export const connectors = definedConnectors.reduce((acc, provider) => {
  if (allConnectors[provider]) {
    return [...acc, allConnectors[provider]];
  }
  return acc;
}, []);

export const client = createClient({
  autoConnect: true,
  connectors,
  storage: createStorage({ storage: window.localStorage, key: 'wagmi' }),
  provider,
});

