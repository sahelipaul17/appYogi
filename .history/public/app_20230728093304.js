$(document).ready(() => {
    const user = getUserFromQuery(); // Get the user from the query string
    let controlAcquired = false;
  
    // Function to get the user from the query string
    function getUserFromQuery() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('user');
    }
  
    // Function to handle acquiring control
    function acquireControl() {
      if (controlAcquired) return;
      $.post('/acquire-control', { user }, (data) => {
        if (data.success) {
          controlAcquired = true;
          $('#acquireControlBtn').prop('disabled', true);
          $('#releaseControlBtn').prop('disabled', false);
          pollServer();
        } else {
          console.log('Failed to acquire control. Control is currently held by another user.');
        }
      });
    }
  
    // Function to handle releasing control
    function releaseControl() {
      if (!controlAcquired) return;
      $.post('/acquire-control', { user: null }, (data) => {
        if (data.success) {
          controlAcquired = false;
          $('#acquireControlBtn').prop('disabled', false);
          $('#releaseControlBtn').prop('disabled', true);
        } else {
          console.log('Failed to release control. Something went wrong.');
        }
      });
    }
  
    // Function to update key state on the server
    function updateKeyState(key, state) {
      $.post('/update-key-state', { user, key, state }, (data) => {
        if (!data.success) {
          console.log('Failed to update key state. Make sure you have control.');
        }
      });
    }
  
    // Function to handle key click events
    function handleKeyClick(event) {
      const key = event.target.id;
      const currentState = $(event.target).hasClass('lit');
  
      if (currentState) {
        // Turn off the key
        updateKeyState(key, false);
      } else {
        // Turn on the key
        updateKeyState(key, true);
      }
    }
  
    // Function to handle keyboard click events
    function handleKeyboardClick(event) {
      if (controlAcquired) {
        handleKeyClick(event);
      } else {
        console.log('You need to acquire control first.');
      }
    }
  
    // Function to update the keyboard state based on the server response
    function updateKeyboardState(state) {
      // Loop through each key and update its state
      $('.key').each((index, element) => {
        const key = element.id;
        const isLit = state[key];
        if (isLit) {
          $(element).addClass('lit');
        } else {
          $(element).removeClass('lit');
        }
      });
    }
  
    // Attach click event listener to the keyboard
    $('.keyboard').on('click', '.key', handleKeyboardClick);
  
    // Periodically poll the server to update the keyboard state
    function pollServer() {
      // Send an Ajax request to the server to get the keyboard state
      $.get('/get-keyboard-state', (data) => {
        updateKeyboardState(data);
      });
    }
  
    // Button to acquire control
    $('#acquireControlBtn').click(acquireControl);
  
    // Button to release control
    $('#releaseControlBtn').click(releaseControl);
  });
  