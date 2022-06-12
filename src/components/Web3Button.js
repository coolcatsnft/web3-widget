import {
  currentStatus,
  init,
  networkName,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
  web3Modal,
  Web3Status
} from '../lib/web3';
import { configuration, networkId } from '../lib/providerOptions';

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
  }

  async connectedCallback() {
    if (web3Modal?.cachedProvider) {
      await onConnect();
    }

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

  if (!configuration.IS_DEV && location.protocol !== 'https:') {
    web3Button.setAttribute('disabled', 'disabled');
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

  if (typeof configuration.CLASS === 'string' && configuration.CLASS.length > 0) {
    web3Button.classList.add(configuration.CLASS);
  }

  web3Button.innerText = innerText;
};


export default Web3Button;
