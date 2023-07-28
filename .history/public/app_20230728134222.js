$(document).ready(() => {
  const user = getUrlParameter('user');
  const socket = io();
  let controlUser = null;
  let controlTimer = null;

  // Function to update key state on the server
  function updateKeyState(key, state) {
    socket.emit('updateKeyState', { user, key, state });
  }

  // Function to handle key click event
  function handleKeyClick(event) {
    if (hasControl()) {
      const key = event.target.dataset.key;
      const isLit = $(event.target).hasClass('lit-red') || $(event.target).hasClass('lit-yellow');

      // Toggle the state of the clicked key
      const newState = !isLit;
      $(event.target).toggleClass('lit-red', user === '1' && newState);
      $(event.target).toggleClass('lit-yellow', user === '2' && newState);
      updateKeyState(key, newState);

      // Release control after clicking a key
      releaseControl();
    }
  }

  // Attach click event handlers to the keys
  $('.key').click(handleKeyClick);

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
    return controlUser === user;
  }

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
        const litClass = user === '1' ? 'lit-red' : 'lit-yellow';
        $(`.key[data-key="${key}"]`).toggleClass(litClass, state);
      }
    }
  });

  // Handle key state updates received from the server
  socket.on('keyStateChanged', ({ key, state, userId }) => {
    const litClass = userId === '1' ? 'lit-red' : 'lit-yellow';
    $(`.key[data-key="${key}"]`).toggleClass(litClass, state);
  });

  // Handle control acquired event received from the server
  socket.on('controlAcquired', (userId) => {
    controlUser = userId;
    if (userId === user) {
      $('#acquireControlBtn').prop('disabled', true);
      $('#releaseControlBtn').prop('disabled', false);
      console.log(`You have acquired control`);
      startControlTimer();
    } else {
      console.log(`Control acquired by another user`);
    }
  });

  // Handle control released event received from the server
  socket.on('controlReleased', () => {
    controlUser = null;
    $('#acquireControlBtn').prop('disabled', false);
    $('#releaseControlBtn').prop('disabled', true);
    console.log('Control released');
    stopControlTimer();
  });

  // Function to start the control timer
  function startControlTimer() {
    controlTimer = setTimeout(() => {
      releaseControl();
    }, 120000); // 120 seconds (2 minutes)
  }

  // Function to stop the control timer
  function stopControlTimer() {
    if (controlTimer) {
      clearTimeout(controlTimer);
      controlTimer = null;
    }
  }

  // Emit initial request to get the current keyboard state
  socket.emit('getKeyboardState');
});
