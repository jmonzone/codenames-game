//game.js handles game functionality and events

socket.on('connect', () => {
  var startButton = document.getElementById('start');
  startButton.addEventListener('click', () => {
    socket.emit('startRequest');
  });
});

socket.on('gameStarted', () => {
  socket.emit('hintRequest');
});
