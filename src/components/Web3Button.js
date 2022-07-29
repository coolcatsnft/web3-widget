import { currentStatus, onConnect, onDisconnect, onSwitchNetwork, Web3Status } from '../lib/web3';
import { client, configuration, connectors, connectorsInfo, networkId } from '../lib/providerOptions';
import { networkName } from '../lib/networkName';
import '../assets/styles.css';

const id = `web3button_${(Math.random(1000) * 1000)}`

const template = document.createElement('template');
template.innerHTML = `
<button id=${id} class="web3button" style="display:none;" data-modal="connector-selector"></button>
<div class="connector-modal" id="connector-selector">
  <div class="connector-modal-bg"></div>
  <div class="connector-modal-container" id="connectors">
  </div>
</div>
`;

export class Web3Button extends HTMLElement {
  constructor() {
    super();
    this.appendChild(template.content.cloneNode(true));

    connectors.forEach(connector => {
      const info = connectorsInfo[connector.id];
      document.getElementById('connectors').innerHTML +=
        `<div class="connector-wrapper" id="${connector.id}">
           <div class="connector-container">
             <div class="connector-logo">
              <img src="assets/${info.logo}" alt="${info.title}"/>
             </div>
             <div class="connector-title">${info.title}</div>
             <div class="connector-description">${info.description}</div>
           </div>
         </div>`;
    })

    document.addEventListener('click', e => {
      if (e.target.closest(".connector-modal")) {
        document.getElementById('connector-selector').classList.remove('open')
      }
    });
  }

  async connectedCallback() {
    setTimeout(async () => {
      if (client.connector) {
        await onConnect(client.connector);
      }
    }, 100)


    connectors.forEach(connector => {
      document.getElementById(connector.id).addEventListener('click', async (e) => {
        onConnect(connector);
      });
    });

    this.addEventListener('click', async (e) => {
      if (currentStatus === Web3Status.DISCONNECTED) {
        openModal(e);
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

const openModal = (e) => {
  e.preventDefault();
  const modal = document.getElementById('connector-selector');

  modal.classList.add('open');
  const exits = modal.querySelectorAll('.modal-exit');
  exits.forEach(function(exit) {
    exit.addEventListener('click', function(event) {
      modal.classList.remove('open');
    });
  });
};

export const updateUI = async () => {
  const web3Button = document.getElementById(id);

  if (!configuration.IS_DEV && location.protocol !== 'https:') {
    web3Button.setAttribute('disabled', 'disabled');
    web3Button.title = 'A secure connection is required for the web3 button to be enabled';
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
      innerText = `Click to switch to the ${networkName(networkId)} network`;
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
