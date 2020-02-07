let socket = io();

socket.on('messageSent', (message) => {
  announce(message);
});

socket.on('clearMessages', () => {
  var announcements = document.getElementById('messages');
  announcements.innerHTML = "";
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

  var announcements = document.getElementById('messages');
  announcements.innerHTML = "";

  var display = document.createElement('div');
  display.id = 'word-display';

  var display_wrapper = document.getElementById('word-display-wrapper');
  display_wrapper.append(display);

  var words = createWords();
  socket.emit('wordsCreated', words);

  var wordDisplays = displayWords(words);
  createColorChanger(wordDisplays);
}

socket.on('hintGiven', (hint) => {
  displayHint(hint);
});

function displayWords(words){

  var retVal = []
  //HTML reference to DOM element to display the words
  var display = document.getElementById('word-display');

  words.forEach((word) => {
    var cell = document.createElement('BUTTON');
    cell.className = 'word';
    cell.id = 'word_' + word.string;
    cell.innerHTML = word.string.toUpperCase();
    cell.style.backgroundColor = 'white';

    socket.on('hintGiven', (hint) => {
      cell.addEventListener('click', () => {
        socket.emit('wordSelected', word);
      });
    });


    var cellData = {
      id: cell.id,
      color: word.color,
    };

    retVal.push(cellData);

    display.append(cell);
  });

  return retVal;
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
  var wordPool =
    ['apple','computer','japan','glasses','bag','fish','italy','dictionary','book', 'leather',
    'husband','breakfast','lady','silk','festival','spirit','medicine','bike','plastic','stone'];
  var words = [];
  var numWords = 8;

  for(var i = 0; i < numWords; i++){
    let j = Math.floor(Math.random() * wordPool.length);
    words.push(wordPool[j]);
    wordPool.splice(j,1);
  }

  return words;
}

//TEMP
function createColorMap(){

  var colorPool = ['blue','red','blue','black','blue','blue','red','red'];
  var colors = [];
  var numWords = 8;

  for(var i = 0; i < numWords; i++){
    let j = Math.floor(Math.random() * colorPool.length);
    colors.push(colorPool[j]);
    colorPool.splice(j,1);
  }

  return colors;
}

//TEMP
function displayHint(hint){
  announce('Hint: ' + hint.toUpperCase());
}

function createColorChanger(wordDisplays){

  var color_changer = document.createElement('button');
  color_changer.innerHTML = "Reveal Colors";

  var interactions = document.getElementById('interactions');
  interactions.append(color_changer)

  color_changer.addEventListener('click', () => {
    wordDisplays.forEach((word) => {
      var cell = document.getElementById(word.id);

      if (cell.style.backgroundColor == 'white') {

        color_changer.innerHTML = "Hide Colors";
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

      } else {

        color_changer.innerHTML = "Reveal Colors";
        cell.style.backgroundColor = 'white'

      }
    });
  });
}
