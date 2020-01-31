let socket = io();

socket.on('connect', () => {
  var startButton = document.getElementById('start');
  startButton.addEventListener('click', () => {
    socket.emit('startRequest');
  });
});

socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});

socket.on('messageSent', (message) => {
  var chatText = document.getElementById('messages');
  chatText.innerHTML += '<div>' + message + '</div>';
});

socket.on('gameStarted', () => {
  socket.emit('hintRequest');
});
