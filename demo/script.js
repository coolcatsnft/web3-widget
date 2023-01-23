const networkIdDropdown = document.getElementById('NETWORK_ID');
const magicLinkInput = document.getElementById('MAGIC_LINK_KEY');
const form = document.getElementById('form');

const networkId = (localStorage.getItem('NETWORK_ID') || '1').toString();
networkIdDropdown.value = networkId;

const magicLinkKey = (localStorage.getItem('MAGIC_LINK_KEY') || '').toString();
magicLinkInput.value = magicLinkKey;

function setConfiguration(e) {
  e.preventDefault();
  localStorage.setItem('NETWORK_ID', networkIdDropdown.value);
  localStorage.setItem('MAGIC_LINK_KEY', magicLinkInput.value);
  if (form.checkValidity()) {
    location.href = '/connect.html';
  }
}

form.addEventListener('submit', setConfiguration);
