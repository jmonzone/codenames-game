function announce(message) {
  var chatText = document.getElementById('messages');
  chatText.innerHTML += '<div>' + message + '</div>';
}

function start(){
  var startButton = document.getElementById('start');
  startButton.remove();
  announce('Game Started.');
  announce('Hint: ' + displayHint());
  announce('Words: ' + displayWords());
}

function displayHint(){
  var hint = "[CODENAME] [COUNT]";
  return hint;
}

function displayWords(){
  var words = ['[WORD]','[WORD]','[WORD]','[WORD]','[WORD]'];
  return words;
}
