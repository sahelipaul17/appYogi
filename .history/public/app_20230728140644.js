// app.js

document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const controlBtn = document.getElementById('controlBtn');
    let isControlAcquired = false;
    let currentControlTimeout = null;
    let socket;
  
    function updateKeysState() {
      keys.forEach((key) => {
        const color = keyStates[key.dataset.key];
        key.style.backgroundColor = color ? color : '';
      });
    }
  
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
  
    function toggleKeyColor(key) {
      if (!isControlAcquired) return;
  
      const color = key.style.backgroundColor;
      if (color) {
        key.style.backgroundColor = '';
      } else {
        key.style.backgroundColor = KEY_COLORS[socket.id];
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
  
    controlBtn.addEventListener('click', () => {
      if (!isControlAcquired) {
        acquireControl();
      } else {
        releaseControl();
      }
    });
  
    socket = io();
    socket.on('initialKeyStates', (data) => {
      keyStates = data;
      updateKeysState();
    });
  
    socket.on('updateRemoteScreen', (data) => {
      keyStates[data.key] = data.color;
      updateKeysState();
    });
  
    socket.on('controlAcquired', (socketId) => {
      isControlAcquired = true;
      controlBtn.textContent = 'Release Control';
      currentControlTimeout = setTimeout(releaseControl, 120000); // 120 seconds timeout
    });
  
    socket.on('controlReleased', () => {
      isControlAcquired = false;
      controlBtn.textContent = 'Acquire Control';
      clearTimeout(currentControlTimeout);
    });
  });
  