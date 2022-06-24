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
let currentBalance = null;

export let currentStatus = Web3Status.DISCONNECTED;

const dispatchWeb3Event = (status, address, balance, web3, error) => {
  document.dispatchEvent(new CustomEvent('web3-widget-event', { detail: { status, address, balance, web3, error } }));
};

const dispatchBalanceEvent = async (status, address, web3) => {
  if (address && web3 && status === Web3Status.CONNECTED) {
    try {
      const balance = await web3.eth.getBalance(address);
      if (currentBalance !== balance) {
        currentBalance = balance;
        return dispatchWeb3Event(status, address, web3.utils.fromWei(balance), web3);
      }

      return;
    } catch(e) {}
  }

  currentBalance = null;
  return dispatchWeb3Event(status, null, null, null);
}

export const fetchAccountData = async (from) => {
  web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  if (chainId !== networkId) {
    currentStatus = Web3Status.WRONG_NETWORK;
    selectedAccount = null;
    currentBalance = null;
    dispatchWeb3Event(currentStatus, null, null, null);
    updateUI();
    return;
  }

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  currentStatus = selectedAccount ? Web3Status.CONNECTED : Web3Status.DISCONNECTED;
  dispatchBalanceEvent(currentStatus, selectedAccount, web3);
  updateUI();
};

export const onConnect = async () => {
  currentStatus = Web3Status.PENDING;
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log('Could not get a wallet connection', e);
    currentStatus = Web3Status.DISCONNECTED;
    dispatchWeb3Event(currentStatus, selectedAccount, null, null, e);
    return;
  }

  // Subscribe to accounts change
  provider.on('accountsChanged', fetchAccountData);

  // Subscribe to chainId change
  provider.on('chainChanged', fetchAccountData);

  await fetchAccountData();

  if (web3) {
    web3Subscription = web3.eth.subscribe('newBlockHeaders', async (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        dispatchBalanceEvent(currentStatus, selectedAccount, web3);
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
  currentBalance = null;
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
