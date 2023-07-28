// script.js
const keysContainer = $('.keys');
const acquireBtn = $('#acquireBtn');
let isUser1 = false;
let timeoutId = null;

// Function to toggle the control between users
function toggleControl() {
  isUser1 = !isUser1;
  acquireBtn.prop('disabled', true);
  clearTimeout(timeoutId);
  if (isUser1) {
    acquireBtn.text('User 1 Controls');
  } else {
    acquireBtn.text('User 2 Controls');
  }
  timeoutId = setTimeout(() => {
    releaseControl();
  }, 120000);
}

// Function to release control
function releaseControl() {
  isUser1 = false;
  acquireBtn.prop('disabled', false);
  acquireBtn.text('Acquire Control');
  clearTimeout(timeoutId);
}

// Function to handle key clicks
function handleKeyClick(event) {
    const key = $(event.target);
    if (!key.hasClass('key')) return;
  
    const keyIndex = key.index();
    const color = isUser1 ? 'red' : 'yellow';
  
    key.css('background-color', color);
    setTimeout(() => {
      key.css('background-color', 'white');
    }, 500);
  
    // Send the key data to the server using Ajax
    $.post('/api/keys', { keyIndex, color })
      .done((data) => {
        console.log('Server response:', data);
        // Handle the server response if needed
      })
      .fail((error) => {
        console.error('Error sending key data to the server:', error);
      });
  }

// Add keys to the keyboard
for (let i = 0; i < 10; i++) {
  const key = $('<div class="key"></div>');
  key.click(handleKeyClick);
  keysContainer.append(key);
}

// Add event listener to the acquire button
acquireBtn.click(toggleControl);

// Socket.io client-side implementation
const socket = io(); // Load Socket.io client library

socket.on('connect', () => {
  console.log('Connected to the server via WebSocket');
});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

socket.on('keyUpdate', (data) => {
  const { keyIndex, color } = data;
  const key = $('.keys .key').eq(keyIndex);
  key.css('background-color', color);
});
