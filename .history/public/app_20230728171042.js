document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
  
    const keyboard = document.getElementById('keyboard');
    const controlBtn = document.getElementById('controlBtn');
  
    let isControlAcquired = false;
    let userColor = '';
    let currentControlTimeout;
  
    // Function to toggle the key color
    function toggleKeyColor(key) {
      if (!isControlAcquired) return;
  
      const color = key.style.backgroundColor;
  
      if (color && color === userColor) {
        key.style.backgroundColor = 'white';
      } else {
        key.style.backgroundColor = userColor;
      }
  
      // Send the updated color to the server
      const keyIndex = Array.from(keyboard.children).indexOf(key);
      socket.emit('keyStateChange', { key: keyIndex, color: key.style.backgroundColor });
    }
  
    // Listen for initial key states from the server
    socket.on('initialKeyStates', (keyStates) => {
      keyStates.forEach((keyState, index) => {
        const key = keyboard.children[index];
        key.style.backgroundColor = keyState.color;
      });
    });
    socket.on('controlAcquired', (socketId) => {
        isControlAcquired = true;
        controlBtn.textContent = 'Release Control';
        currentControlTimeout = setTimeout(releaseControl, 120000); // 120 seconds timeout
    
        // Assign user colors based on the socket ID
        userColor = socket.id === socketId ? 'red' : 'yellow';
        console.log(`User ${socketId === socket.id ? '1' : '2'} has acquired control with color: ${userColor}`);
      });
    
      // Listen for control release from the server
      socket.on('controlReleased', () => {
        isControlAcquired = false;
        controlBtn.textContent = 'Acquire Control';
        clearTimeout(currentControlTimeout);
        console.log('Control released');
      });
    
      // Handle keyboard key clicks
      keyboard.addEventListener('click', (event) => {
        const clickedKey = event.target;
        if (clickedKey.classList.contains('key')) {
          toggleKeyColor(clickedKey);
        }
      });
    
      // Function to release control of the keyboard
      function releaseControl() {
        socket.emit('releaseControl');
      }
    
      // Handle control button clicks
      controlBtn.addEventListener('click', () => {
        if (!isControlAcquired) {
          socket.emit('acquireControl');
        } else {
          releaseControl();
        }
      });
    });