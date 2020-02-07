let socket = io();

socket.on('messageSent', (message) => {
  announce(message);
});

socket.on('clearMessages', () => {
  var announcements = document.getElementById('messages');
  announcements.innerHTML = ""
});

function announce(message) {
  var announcement = document.createElement('div');
  announcement.innerHTML = message;
  announcement.className = 'announcement';

  var announcements = document.getElementById('messages');
  announcements.append(announcement);
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
    var cell = document.createElement('BUTTON');
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

    cell.addEventListener('click', () => {
      socket.emit('wordSelected', word);
    });

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
  // var words = ['[WORD1]','[WORD2]','[WORD3]','[WORD4]','[WORD5]','[WORD6]','[WORD7]','[WORD8]','[WORD9]'];
  var words = ['apple','computer','japan','glasses','bag','fish','italy','dictionary','book'];
  return words;
}

//TEMP
function createColorMap(){
  var map = ['blue','red','blue','black','blue','blue','red','red'];
  return map;
}

//TEMP
function displayHint(hint){
  announce('Hint: ' + hint);
}
