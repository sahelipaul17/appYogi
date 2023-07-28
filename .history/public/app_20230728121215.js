$(document).ready(() => {
    const user = getUrlParameter('user');
    const socket = io();
  
    // Function to update key state on the server
    function updateKeyState(key, state) {
      socket.emit('updateKeyState', { user, key, state });
    }
  
    // Function to handle key click event
    function handleKeyClick(event) {
      const key = event.target.dataset.key;
  
      // Toggle the state of the clicked key
      const newState = !(event.target.classList.contains('lit'));
      $(event.target).toggleClass('lit', newState);
      updateKeyState(key, newState);
    }
  
    // Function to acquire control of the keyboard
    function acquireControl() {
      socket.emit('acquireControl', user);
    }
  
    // Function to release control of the keyboard
    function releaseControl() {
      socket.emit('releaseControl');
    }
  
    // Function to check if the user has control of the keyboard
    function hasControl() {
      return !$('#acquireControlBtn').prop('disabled');
    }
  
    // Attach click event handlers to the keys
    $('.key').click(handleKeyClick);
  
    // Attach click event handlers to the control buttons
    $('#acquireControlBtn').click(acquireControl);
    $('#releaseControlBtn').click(releaseControl);
  
    // Function to get query parameters from the URL
    function getUrlParameter(name) {
      name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  
    // Socket.IO event listeners
  
    // Handle the initial keyboard state received from the server
    socket.on('initialKeyboardState', (keyboardState) => {
      // Update the client-side keyboard state based on the data received from the server
      for (const key in keyboardState) {
        if (keyboardState.hasOwnProperty(key)) {
          const state = keyboardState[key];
          $(`.key[data-key="${key}"]`).toggleClass('lit', state);
        }
      }
    });
  
    // Handle key state updates received from the server
    socket.on('keyStateChanged', ({ key, state }) => {
      $(`.key[data-key="${key}"]`).toggleClass('lit', state);
    });
  
    // Handle control acquired event received from the server
    socket.on('controlAcquired', (userId) => {
      if (userId === user) {
        $('#acquireControlBtn').prop('disabled', true);
        $('#releaseControlBtn').prop('disabled', false);
        console.log(`You have acquired control`);
      } else {
        console.log(`Control acquired by another user`);
      }
    });
  
    // Handle control released event received from the server
    socket.on('controlReleased', () => {
      $('#acquireControlBtn').prop('disabled', false);
      $('#releaseControlBtn').prop('disabled', true);
      console.log('Control released');
    });
  });
  