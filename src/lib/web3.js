import { client, networkId } from './providerOptions';
import { updateUI } from '../components/Web3Button';
import { ethers } from 'ethers';

export const Web3Status = {
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  PENDING: 'pending',
  WRONG_NETWORK: 'wrong_network'
};

// Address of the selected account
let selectedAccount = null;

let selectedConnector = null;
let provider;
let web3 = null;

let currentBalance = null;

export let currentStatus = Web3Status.DISCONNECTED;

const dispatchWeb3Event = (status, address, balance, web3, error) => {
  document.dispatchEvent(new CustomEvent('web3-widget-event', { detail: { status, address, balance, web3, error } }));
};

const dispatchBalanceEvent = async (status, address) => {
  if (address && status === Web3Status.CONNECTED) {
    try {
      const balance = await web3.getBalance(address);
      return dispatchWeb3Event(status, address, ethers.utils.formatEther(balance), web3);
    } catch (e) {
      console.log(e);
    }
  }
  currentBalance = null;
  return dispatchWeb3Event(status, null, null, null);
};

export const fetchAccountData = async () => {
  if (client) {
    const chainId = await selectedConnector.getChainId();
    if (chainId !== networkId) {
      currentStatus = Web3Status.WRONG_NETWORK;
      selectedAccount = null;
      currentBalance = null;
      dispatchWeb3Event(currentStatus, null, null, null);
      updateUI();
    } else {
      // Get list of accounts of the connected wallet
      try {
        selectedAccount = await selectedConnector.getAccount();
        currentStatus = selectedAccount ? Web3Status.CONNECTED : Web3Status.DISCONNECTED;
        dispatchBalanceEvent(currentStatus, selectedAccount, web3);
        updateUI();
      } catch (e) {
        console.log(e);
        currentStatus = Web3Status.DISCONNECTED;
        updateUI();
      }
    }
  }
};

export const onConnect = async (connector) => {
  currentStatus = Web3Status.PENDING;
  selectedConnector = connector;
  provider = await selectedConnector.getProvider();
  web3 = new ethers.providers.Web3Provider(provider);

  try {
    await selectedConnector.connect();
  } catch (e) {
    console.log('Could not get a wallet connection', e);
    currentStatus = Web3Status.DISCONNECTED;
    dispatchWeb3Event(currentStatus, selectedAccount, null, null, e);
    return;
  }

  // Subscribe to account change
  provider.on('accountsChanged', fetchAccountData);

  // Subscribe to chainId change
  provider.on('chainChanged', fetchAccountData);

  if (web3) {
    web3.on('block', (block) => dispatchBalanceEvent(currentStatus, selectedAccount));
  }

  await fetchAccountData();
};

export const onDisconnect = async () => {
  selectedConnector.disconnect();
  web3.off('block');

  provider.removeListener('accountsChanged', fetchAccountData);
  provider.removeListener('chainChanged', fetchAccountData);
  provider.removeListener('networkChanged', fetchAccountData);

  client.destroy();
  provider = null;
  selectedAccount = null;
  currentBalance = null;
  web3 = null;
  currentStatus = Web3Status.DISCONNECTED;
  dispatchWeb3Event(currentStatus, selectedAccount);
};

export const onSwitchNetwork = async () => {
  if (selectedConnector) {
    await selectedConnector.switchChain(networkId);
  }
  web3 = new ethers.providers.Web3Provider(provider);
  fetchAccountData();
};

