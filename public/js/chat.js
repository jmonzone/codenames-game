//chat.js handles chat related events

socket.on('connect', () => {
  var chatInput = document.getElementById('chat-input');
  var chatForm = document.getElementById('chat-form');

  chatForm.onsubmit = function(e) {
    e.preventDefault();
    if(chatInput.value[0] !== '/')
      socket.emit('messageRequest',chatInput.value);
    chatInput.value = '';
  }
});

socket.on('messageSent', (from, message) => {
  var chatText = document.getElementById('chat-text');
  chatText.innerHTML += '<div>' + from + ': ' + message + '</div>';
  var messages = document.querySelector('#chat-text').lastElementChild;
  messages.scrollIntoView();
});
