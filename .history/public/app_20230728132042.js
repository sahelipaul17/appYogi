// script.js

const socket = io();
const keys = document.querySelectorAll('.key');
const controlButton = document.getElementById('controlButton');
let userInControl = false;

keys.forEach((key) => {
  key.addEventListener('click', () => {
    if (userInControl) {
      const keyIndex = key.dataset.keyIndex;
      socket.emit('keyClicked', keyIndex);
    }
  });
});

controlButton.addEventListener('click', () => {
  socket.emit('acquireControl');
});

socket.on('updateKeyStates', (keyStates) => {
  updateKeyStatesUI(keyStates);
});

socket.on('updateControlStatus', (userId) => {
  userInControl = userId === socket.id;
  updateControlUI(userInControl);
});

function updateKeyStatesUI(keyStates) {
  keys.forEach((key, index) => {
    key.style.backgroundColor = keyStates[index] ? (userInControl ? 'red' : 'yellow') : 'white';
  });
}

function updateControlUI(hasControl) {
  controlButton.disabled = hasControl;
  controlButton.textContent = hasControl ? 'You are in control' : 'Acquire Control';
}
