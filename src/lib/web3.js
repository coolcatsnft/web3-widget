import Web3Modal from 'web3modal';
import { configuration, networkId, providerOptions } from './providerOptions';
import Web3 from 'web3';
import { updateUI } from '../components/Web3Button';

export const Web3Status = {
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  PENDING: 'pending',
  WRONG_NETWORK: 'wrong_network'
};

// web3Modal instance
export let web3Modal;

// Chosen wallet provider given by the dialog window
export let provider;

// Address of the selected account
let selectedAccount = null;

let web3 = null;
let web3Subscription = null;

export let currentStatus = Web3Status.DISCONNECTED;

const dispatchWeb3Event = (status, address, balance, web3) => {
  document.dispatchEvent(new CustomEvent('web3-widget-event', { detail: { status, address, balance, web3 } }));
};

export const fetchAccountData = async (from) => {
  web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  if (chainId !== networkId) {
    currentStatus = Web3Status.WRONG_NETWORK;
    selectedAccount = null;
    dispatchWeb3Event(currentStatus, null, null, null);
    updateUI();
    return;
  }

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  currentStatus = selectedAccount ? Web3Status.CONNECTED : Web3Status.DISCONNECTED;
  const balance = await web3.eth.getBalance(selectedAccount);
  dispatchWeb3Event(currentStatus, selectedAccount, web3.utils.fromWei(balance), selectedAccount ? web3 : null);
  updateUI();
};

export const onConnect = async () => {
  currentStatus = Web3Status.PENDING;
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log('Could not get a wallet connection', e);
    currentStatus = Web3Status.DISCONNECTED;
    dispatchWeb3Event(currentStatus, selectedAccount, null);
    return;
  }

  // Subscribe to accounts change
  provider.on('accountsChanged', fetchAccountData);

  // Subscribe to chainId change
  provider.on('chainChanged', fetchAccountData);

  // Subscribe to networkId change
  provider.on('networkChanged', fetchAccountData);

  await fetchAccountData();

  if (web3) {
    web3Subscription = web3.eth.subscribe('newBlockHeaders', async (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        const balance = await web3.eth.getBalance(selectedAccount);
        dispatchWeb3Event(currentStatus, selectedAccount, web3.utils.fromWei(balance));
      }
    });
  }

};

export const onDisconnect = async () => {
  if (provider?.close) {
    await provider?.close();
  }
  await web3Modal.clearCachedProvider();

  provider.removeListener('accountsChanged', fetchAccountData);
  provider.removeListener('chainChanged', fetchAccountData);
  provider.removeListener('networkChanged', fetchAccountData);

  provider = null;
  selectedAccount = null;
  currentStatus = Web3Status.DISCONNECTED;
  web3Subscription?.unsubscribe();
  dispatchWeb3Event(currentStatus, selectedAccount);
};

export const onSwitchNetwork = async () => {
  provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${ networkId }` }]
  });
};

export const networkName = (id) => {
  switch (String(id)) {
    case '1':
      return 'Main';
    case '3':
      return 'Ropsten';
    case '4':
      return 'Rinkeby';
    case '5':
      return 'Goerli';
    case '42':
      return 'Kovan';
    case 'localhost':
      return 'localhost';
    default:
      throw new Error('unsupported network');
  }
};

/**
 * Setup
 */
export const init = () => {
  if (!configuration.IS_DEV && location.protocol !== 'https:') {
    return;
  }

  // initialize web3Modal
  web3Modal = new Web3Modal({
    providerOptions,
    cacheProvider: true,
    disableInjectedProvider: true
  });
};
