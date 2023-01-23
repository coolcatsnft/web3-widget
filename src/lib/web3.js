import { config } from './providerOptions';
import Web3 from 'web3';
import { Magic } from "magic-sdk";
import { ConnectExtension } from "@magic-ext/connect";
import { updateUI } from '../components/Web3Button';

export const Web3Status = {
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  PENDING: 'pending',
  WRONG_NETWORK: 'wrong_network'
};

// Chosen wallet provider given by the dialog window
export let provider;

// Address of the selected account
let selectedAccount = null;
let magic = null;
let web3 = null;
let web3Subscription = null;
let currentBalance = null;
let walletInfo = null;
let ens = null;

export let currentStatus = Web3Status.DISCONNECTED;

async function ensReverse(address) {
  const namehash = await web3.eth.call({
    to: '0x084b1c3c81545d370f3634392de611caabff8148', // ENS: Reverse Registrar
    data: web3.eth.abi.encodeFunctionCall({
      name: 'node', type: 'function',
      inputs: [{type: 'address', name: 'addr'}]
    }, [address])
  });
  return web3.eth.abi.decodeParameter('string', await web3.eth.call({
    to: '0xa2c122be93b0074270ebee7f6b7292c7deb45047', // ENS: Default Reverse Resolver
    data: web3.eth.abi.encodeFunctionCall({
      name: 'name', type: 'function',
      inputs: [{type: 'bytes32', name: 'hash'}]
    }, [namehash])
  }));
}

const dispatchWeb3Event = (status, address, balance, web3, error) => {
  document.dispatchEvent(new CustomEvent('web3-widget-event', { detail: { status, address, balance, network: config.network.name, web3, ens: ens || "", error, walletType: walletInfo?.walletType || '', disconnect: onDisconnect } }));
};

const dispatchBalanceEvent = async (status, address, web3) => {
  if (address && web3 && status === Web3Status.CONNECTED) {
    try {
      const balance = await web3.eth.getBalance(address);
      if (currentBalance !== balance) {
        currentBalance = balance;
        return dispatchWeb3Event(status, address, web3.utils.fromWei(balance), web3, null, walletInfo?.walletType);
      }

      return;
    } catch(e) {}
  }

  currentBalance = null;
  return dispatchWeb3Event(status, null, null, null);
}

export const fetchAccountData = async (from) => {
  const chainId = await web3.eth.getChainId();
  if (chainId !== config.network.id) {
    currentStatus = Web3Status.WRONG_NETWORK;
    selectedAccount = null;
    currentBalance = null;
    walletInfo = null;
    dispatchWeb3Event(currentStatus, null, null, null, null, null);
    updateUI();
    return;
  }

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();
  walletInfo = await magic.connect.getWalletInfo();
  selectedAccount = accounts[0];
  currentStatus = selectedAccount ? Web3Status.CONNECTED : Web3Status.DISCONNECTED;
  if (selectedAccount) {
    try {
      const name = await ensReverse(selectedAccount);
      if (typeof name === 'string' && name.indexOf('.eth') > 0) {
        ens = name;
      }
    } catch (e) {
      console.log(e);
    }
  }
  dispatchBalanceEvent(currentStatus, selectedAccount, web3);
  updateUI();
};

export const onConnect = async () => {
  currentStatus = Web3Status.PENDING;
  dispatchWeb3Event(currentStatus, null, null, null);
  try {
    await web3.eth.getAccounts();
  } catch (e) {
    console.log('Could not get a wallet connection', e);
    currentStatus = Web3Status.DISCONNECTED;
    dispatchWeb3Event(currentStatus, selectedAccount, null, null, e, walletInfo?.walletType);
    return;
  }

  // Subscribe to accounts change
  web3.currentProvider.on('accountsChanged', fetchAccountData);

  // Subscribe to chainId change
  web3.currentProvider.on('chainChanged', fetchAccountData);

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
  await magic.connect.disconnect()
  web3.currentProvider.removeListener('accountsChanged', fetchAccountData);
  web3.currentProvider.removeListener('chainChanged', fetchAccountData);
  web3.currentProvider.removeListener('networkChanged', fetchAccountData);

  provider = null;
  selectedAccount = null;
  currentBalance = null;
  ens = null;
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
  if (!config.configuration.IS_DEV && location.protocol !== 'https:') {
    return;
  }

  magic = new Magic(config.magic_link_key, {
    network: config.network.name,
    locale: "en_US",
    extensions: [new ConnectExtension()]
  });

  web3 = new Web3(magic.rpcProvider);
  provider = web3.currentProvider;
};
