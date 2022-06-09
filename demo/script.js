const networkIdDropdown = document.getElementById('NETWORK_ID');
const metamaskCheckbox = document.getElementById('metamask');
const coinbaseCheckbox = document.getElementById('coinbase');
const walletconnectCheckbox = document.getElementById('walletconnect');
const infuraAppNameInput = document.getElementById('INFURA_APP_NAME');
const infuraIdInput = document.getElementById('INFURA_ID');
const form = document.getElementById('form');

const networkId = (localStorage.getItem('NETWORK_ID') || '1').toString();
networkIdDropdown.value = networkId;

const lsWallets = JSON.parse(localStorage.getItem('WALLET_LIST'));

if (!lsWallets?.length) {
  localStorage.setItem('WALLET_LIST', JSON.stringify(['custom-metamask']));
}
const selectedWallets = JSON.parse(localStorage.getItem('WALLET_LIST'));

coinbaseCheckbox.checked = selectedWallets?.some(v => v === coinbaseCheckbox.value);
walletconnectCheckbox.checked = selectedWallets?.some(v => v === walletconnectCheckbox.value);

if (coinbaseCheckbox.checked || walletconnect.checked) {
  infuraAppNameInput.setAttribute('required', '');
  infuraIdInput.setAttribute('required', '');
}

function selectWallet(wallet) {
  if (!selectedWallets.includes(wallet)) {
    selectedWallets.push(wallet);
  } else {
    selectedWallets.splice(selectedWallets.indexOf(wallet), 1);
  }
  localStorage.setItem('WALLET_LIST', JSON.stringify(selectedWallets));

  if (coinbaseCheckbox.checked || walletconnect.checked) {
    infuraAppNameInput.setAttribute('required', '');
    infuraIdInput.setAttribute('required', '');
  } else {
    infuraAppNameInput.removeAttribute('required');
    infuraIdInput.removeAttribute('required');
  }
};

function setConfiguration(e) {
  e.preventDefault();
  localStorage.setItem('INFURA_APP_NAME', infuraAppNameInput.value);
  localStorage.setItem('INFURA_ID', infuraIdInput.value);
  localStorage.setItem('NETWORK_ID', networkIdDropdown.value);
  if (form.checkValidity()) {
    location.href = '/connect.html';
  }
}

coinbaseCheckbox.addEventListener('click', () => selectWallet('walletlink'));
walletconnectCheckbox.addEventListener('click', () => selectWallet('walletconnect'));
form.addEventListener('submit', setConfiguration);
