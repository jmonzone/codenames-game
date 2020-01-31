function announce(message) {
  var chatText = document.getElementById('messages');
  chatText.innerHTML += '<div>' + message + '</div>';
}

function start(){
  var startButton = document.getElementById('start');
  startButton.remove();
  announce('Game Started.');
}
