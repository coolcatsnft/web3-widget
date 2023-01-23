import { networkName } from './networkName';

const globalObject = window[window['web3-widget']];
export const configuration = (globalObject.q || [["NETWORK_ID", 4]]).reduce((acc, conf) => ({ ...acc, [conf[0]]: conf[1] }), {});

const networkId = configuration.NETWORK_ID || 1;

if (!configuration.MAGIC_LINK_KEY) {
  console.warn('Configuration MAGIC_LINK_KEY is missing');
}

export const config = {
  network: {
    id: networkId,
    name: networkName(networkId).toLowerCase(),
  },
  magic_link_key: configuration.MAGIC_LINK_KEY || "pk_live_BEEA886BCD201A1E",
  configuration
};