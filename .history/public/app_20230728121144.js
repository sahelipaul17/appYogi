$(document).ready(() => {
    const user = getUrlParameter('user');
    const socket = io();
  
    // Function to update key state on the server
    function updateKeyState(key, state) {
      if (!hasControl()) {
        console.error('You may not have control of the keyboard. Acquire control first.');
        return;
      }
  
      socket.emit('updateKeyState', { key, state });
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
      if (!hasControl()) {
        socket.emit('acquireControl', user);
      }
    }
  
    // Function to release control of the keyboard
    function releaseControl() {
      if (hasControl()) {
        socket.emit('releaseControl');
      }
    }
  
    // Function to check if the user has control of the keyboard
    function hasControl() {
      return $('#acquireControlBtn').prop('disabled');
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
  });
  