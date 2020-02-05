let socket = io();

function announce(message) {
  var chatText = document.getElementById('messages');
  chatText.innerHTML += '<div>' + message + '</div>';
}

function start(){
  var startButton = document.getElementById('start');
  startButton.remove();

  var words = createWords();
  displayWords(words);

  socket.emit('wordsCreated', words);
}

socket.on('hintGiven', (hint) => {
  displayHint(hint);
});

function displayWords(words){
  //HTML reference to DOM element to display the words
  var display = document.getElementById('word-display');

  words.forEach((word) => {
    var cell = document.createElement('div');
    cell.className = 'word';
    cell.innerHTML = word.string;

    switch (word.color) {
      case 'blue':
        cell.style.backgroundColor = 'lightblue';
        break;
      case 'red':
        cell.style.backgroundColor = 'darkorange';
        break;
      case 'black':
        cell.style.backgroundColor = 'darkgrey';
        break;
    }

    display.append(cell);
  });
}

function createWords(){
  //Array to store the actual words to display as strings
  var wordStrings = createWordStrings();

  //Array to store a color map that determines which words are good, bad, or the assassin
  var colorMap = createColorMap();

  //Array to store objects containing words and their corresponding colors
  var words = [];

  //Creating the words array using the wordStrings and colorMap
  for(var i = 0; i < colorMap.length; i++){
    var word = {
      string: wordStrings[i],
      color: colorMap[i]
    };
    words.push(word);
  }

  return words;
}

//TEMP
function createWordStrings(){
  var word = ['[WORD1]','[WORD2]','[WORD3]','[WORD4]','[WORD5]','[WORD6]','[WORD7]','[WORD8]','[WORD9]'];
  return word;
}

//TEMP
function createColorMap(){
  var map = ['blue','red','blue','black','blue','blue','red','blue','blue'];
  return map;
}

//TEMP
function displayHint(hint){
  announce('Hint: ' + hint);
}
