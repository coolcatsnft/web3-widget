import {
  currentStatus,
  init,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
  Web3Status
} from '../lib/web3';
import { config } from '../lib/providerOptions';
import { networkName } from '../lib/networkName';

const id = `web3button_${(Math.random(1000) * 1000)}`

const template = document.createElement('template');
template.innerHTML = `
  <button id=${id} class="web3button" style="display:none;"></button>
`;

export class Web3Button extends HTMLElement {
  constructor() {
    super();
    init();

    this.appendChild(template.content.cloneNode(true));

    document.addEventListener('web3-widget-event', async (e) => {
      const web3Button = document.getElementById(id);
      if (e?.detail?.status === Web3Status.PENDING) {
        web3Button.setAttribute('disabled', 'disabled');
      }
      if ([Web3Status.DISCONNECTED, Web3Status.WRONG_NETWORK, Web3Status.CONNECTED].indexOf(e?.detail?.status) >= 0) {
        web3Button.removeAttribute('disabled');
      }
    });
  }

  async connectedCallback() {
    this.addEventListener('click', async (e) => {
      if (currentStatus === Web3Status.DISCONNECTED) {
        await onConnect();
      } else if (currentStatus === Web3Status.CONNECTED) {
        await onDisconnect();
      } else {
        await onSwitchNetwork();
      }

      await updateUI();
      e.preventDefault();
    });

    await updateUI();
    document.getElementById(id).style.display = null;
  }
}

export const updateUI = async () => {
  const web3Button = document.getElementById(id);

  if (!config.configuration.IS_DEV && location.protocol !== 'https:') {
    web3Button.title = 'A secure connection is required for the web3 button to be enabled'
  }

  let innerText = '';
  switch (currentStatus) {
    case Web3Status.DISCONNECTED:
      innerText = 'Connect';
      break;
    case Web3Status.CONNECTED:
      innerText = 'Disconnect';
      break;
    case Web3Status.PENDING:
      innerText = 'Connecting';
      break;
    case Web3Status.WRONG_NETWORK:
      innerText = `Click to switch to the ${ networkName(networkId) } network`;
      break;
    default:
      throw new Error('Unknown web3 status');
  }

  web3Button.setAttribute('title', innerText);
  if (typeof config.configuration.CLASS === 'string' && config.configuration.CLASS.length > 0) {
    web3Button.classList.add(config.configuration.CLASS);
  }

  web3Button.innerText = innerText;
};


export default Web3Button;
