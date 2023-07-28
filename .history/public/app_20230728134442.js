// app.js

document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const controlBtn = document.getElementById('controlBtn');
    let isControlAcquired = false;
    let currentControlTimeout = null;
    let socket;
  
    const KEY_COLORS = {
      USER1: 'red',
      USER2: 'yellow',
    };
  
    function updateKeysState() {
      keys.forEach((key) => {
        const color = keyStates[key.dataset.key];
        key.style.backgroundColor = color ? color : '';
      });
    }
  
    function acquireControl() {
      if (!isControlAcquired) {
        isControlAcquired = true;
        controlBtn.disabled = true;
        controlBtn.textContent = 'Release Control';
        currentControlTimeout = setTimeout(releaseControl, 120000); // 120 seconds timeout
      }
    }
  
    function releaseControl() {
      if (isControlAcquired) {
        isControlAcquired = false;
        controlBtn.disabled = false;
        controlBtn.textContent = 'Acquire Control';
        clearTimeout(currentControlTimeout);
      }
    }
  
    function toggleKeyColor(key) {
      if (!isControlAcquired) return;
  
      const color = key.style.backgroundColor;
      key.style.backgroundColor = color === KEY_COLORS.USER1 ? '' : KEY_COLORS.USER1;
      if (color === KEY_COLORS.USER2) {
        key.style.backgroundColor = KEY_COLORS.USER1;
      } else {
        key.style.backgroundColor = color ? '' : KEY_COLORS.USER1;
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
  });
  