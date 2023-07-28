// app.js

document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const controlBtn = document.getElementById('controlBtn');
    let isControlAcquired = false;
    let currentControlTimeout = null;
    let socket = io();
  
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
      const userColor = isUser1 ? KEY_COLORS.USER1 : KEY_COLORS.USER2;
  
      if (color && color === userColor) {
        key.style.backgroundColor = '';
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
  
    controlBtn.addEventListener('click', () => {
      if (!isControlAcquired) {
        acquireControl();
      } else {
        releaseControl();
      }
    });
  
    let isUser1 = false; // Flag to determine the user color
    
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
  
      // Assign user colors based on the socket ID
      isUser1 = socket.id === socketId;
    });
  
    socket.on('controlReleased', () => {
      isControlAcquired = false;
      controlBtn.textContent = 'Acquire Control';
      clearTimeout(currentControlTimeout);
    });
  });
  