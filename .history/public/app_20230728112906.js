$(document).ready(() => {
    const user = getUrlParameter('user'); // Get the user ID from the URL query parameter
    let keyboardState = {};
    // Function to update key state on the server
    function updateKeyState(key, state) {
        $.ajax({
          type: 'POST',
          url: '/update-key-state',
          data: JSON.stringify({ user, key, state }),
          contentType: 'application/json',
          success: (data) => {
            if (data.success) {
              console.log(`Key ${key} state updated to ${state}`);
            } else {
              console.error('Failed to update key state. You may not have control of the keyboard.');
            }
          },
          error: () => {
            console.error('Failed to update key state. Please try again later.');
          }
        });
      }
  
    // Function to acquire control of the keyboard
    function acquireControl() {
      $.ajax({
        type: 'POST',
        url: '/acquire-control',
        data: JSON.stringify({ user }),
        contentType: 'application/json',
        success: (data) => {
          if (data.success) {
            console.log('Control acquired');
            $('#acquireControlBtn').prop('disabled', true);
            $('#releaseControlBtn').prop('disabled', false);
          } else {
            console.error('Failed to acquire control. Control may be taken by another user.');
          }
        },
        error: () => {
          console.error('Failed to acquire control. Please try again later.');
        }
      });
    }
  
    // Function to release control of the keyboard
    function releaseControl() {
      $.ajax({
        type: 'POST',
        url: '/acquire-control',
        data: JSON.stringify({ user: null }),
        contentType: 'application/json',
        success: (data) => {
          if (data.success) {
            console.log('Control released');
            $('#acquireControlBtn').prop('disabled', false);
            $('#releaseControlBtn').prop('disabled', true);
          } else {
            console.error('Failed to release control. You may not have control of the keyboard.');
          }
        },
        error: () => {
          console.error('Failed to release control. Please try again later.');
        }
      });
    }
  
    // Function to handle key click event
    function handleKeyClick(event) {
      const key = event.target.id;
  
      // Toggle the state of the clicked key
      if (keyboardState[key]) {
        keyboardState[key] = false;
        updateKeyState(key, false);
      } else {
        keyboardState[key] = true;
        updateKeyState(key, true);
      }
  
      // Update the key color based on the new state
      $(event.target).toggleClass('lit', keyboardState[key]);
    }
  
    // Attach click event handlers to the keys
    $('.key').click(handleKeyClick);
  
    // Attach click event handlers to the control buttons
    $('#acquireControlBtn').click(acquireControl);
    $('#releaseControlBtn').click(releaseControl);
  });
  
  // Function to get query parameters from the URL
  function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }