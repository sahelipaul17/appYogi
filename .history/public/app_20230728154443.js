// app.js
const socket = io();

const keys = document.querySelectorAll('.key');
const controlBtn = document.getElementById('controlBtn');

let isControlAcquired = false;
let currentControlTimeout = null;
let isUser1 = false;

// Function to toggle the key color
function toggleKeyColor(key) {
  if (!isControlAcquired) return;

  const color = key.style.backgroundColor;
 // const userColor = isUser1 ? 'red' : 'yellow';

  if (color && color === userColor) {
    key.style.backgroundColor = 'white';
  } else {
    key.style.backgroundColor = userColor;
  }

  socket.emit('keyStateChange', { key: key.dataset.key, color: key.style.backgroundColor });
}

keys.forEach((key) => {
  key.addEventListener('click', () => {
    if (isControlAcquired) {
      toggleKeyColor(key);
    }
  });
});

function acquireControl() {
  if (!isControlAcquired) {
    socket.emit('acquireControl');
  }
}

function releaseControl() {
  if (isControlAcquired) {
    socket.emit('releaseControl');
  }
}

controlBtn.addEventListener('click', () => {
  if (!isControlAcquired) {
    acquireControl();
  } else {
    releaseControl();
  }
});

socket.on('initialKeyStates', (data) => {
  data.forEach((keyState) => {
    const keyElement = document.querySelector(`[data-key="${keyState.key}"]`);
    keyElement.style.backgroundColor = keyState.color;
  });
});

socket.on('updateRemoteScreen', (data) => {
  const keyElement = document.querySelector(`[data-key="${data.key}"]`);
  keyElement.style.backgroundColor = data.color;
});

socket.on('controlAcquired', (socketId) => {
  isControlAcquired = true;
  controlBtn.textContent = 'Release Control';
  currentControlTimeout = setTimeout(releaseControl, 120000); // 120 seconds timeout

  // Assign user colors based on the socket ID
  isUser1 = socket.id === socketId;
  userColor = isUser1 ? 'red' : 'yellow';
  console.log(`User ${isUser1 ? '1' : '2'} has acquired control with color: ${userColor}`);
});

socket.on('controlReleased', () => {
  isControlAcquired = false;
  controlBtn.textContent = 'Acquire Control';
  clearTimeout(currentControlTimeout);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
