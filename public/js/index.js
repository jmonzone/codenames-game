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

function addMessage(text, id, div = true) {
  var format = div ? 'div' : 'pre';
  var message = document.createElement(format);
  message.innerHTML = text;
  message.id = id;
  message.className = 'message';

  var messages = document.getElementById('messages');
  messages.append(message);
}

function replaceMessage(text, id){
  var message = document.getElementById(id);
  message.innerHTML = text;
}

function removeMessage(id) {
  var message = document.getElementById(id);

  if (message) {
    message.remove();
    return true;
  }

  return false;
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

  var vectorSelect = document.getElementById('vector-select');
  var vectorPath = "";
  switch(vectorSelect.value)
  {
    case 'glove':
      vectorPath = "glove_vectors.txt";
      break;
    case 'word2vec':
      vectorPath = "word2vec_vectors.txt";
      break;
  }

  var minCosDistanceSelect = document.getElementById('minCosDistance-select');
  var minCosDistance = minCosDistanceSelect.value * 0.01;

  var vectorSelectWrapper = document.getElementById('settings');
  vectorSelectWrapper.remove();

  createRefreshButton();

  var wordDisplays = displayWords(words);
  createColorChanger(wordDisplays);

  socket.emit('wordsCreated', words, vectorPath, minCosDistance);

}

socket.on('hintGiven', (jsonResults) => {

  var results = JSON.parse(jsonResults);
  var hint = results.hint.toUpperCase();

  if(hint != "")
  {
    addMessage('Hint: ' + hint, 'messages-hint');
    addMessage('Select ' + results.count + ' words.', 'messages-selections-left');
  }
  else
  {
    addMessage('Hint not found. Minimum cosine distance is too high.');
  }

  createResultsButton(results);

});

function createResultsButton(results){


  var resultsButton = document.createElement('button');
  resultsButton.innerHTML = "Reveal Results";
  resultsButton.className = "interactions-button"


  var interactions = document.getElementById('interactions');
  interactions.append(resultsButton)

  resultsButton.addEventListener('click', () => {

    var reveal = resultsButton.innerHTML == "Reveal Results"
    resultsButton.innerHTML = reveal ? "Hide Results" : "Reveal Results";

    if(reveal)
    {
      var output = JSON.stringify(results, null, 4);
      addMessage(output, 'messages-results', false);
    }
    else
    {
      removeMessage('messages-results');
    }

  });
}

function displayWords(words){

  var retVal = []
  var selectedWords = [];

  //HTML reference to DOM element to display the words
  var display = document.getElementById('word-display');

  words.forEach((word) => {

    var word_button = document.createElement('button');
    word_button.id = 'word-' + word.string;
    word_button.className = 'word';
    word_button.innerHTML = word.string.toUpperCase();
    display.append(word_button);

    socket.on('hintGiven', (jsonResults) => {

      var results = JSON.parse(jsonResults);
      if (results.hint == '') return;

      word_button.addEventListener('click', () => {

        selectedWords.push(word);

        if(selectedWords.length <= results.count)
        {
          word_button.style.backgroundColor = 'lightgrey';

          if (selectedWords.length < results.count)
          {
            replaceMessage('Select ' + (results.count - selectedWords.length) + ' more words.', 'messages-selections-left');
          }
          else if (selectedWords.length == results.count)
          {
            removeMessage('messages-selections-left');
            socket.emit('wordsSelected', selectedWords);
          }
        }

      },{ once : true });

    })

    var db = {
      button: word_button,
      id: word_button.id,
      word: word,
      color: word.color,
    };

    retVal.push(db);

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

function createWordStrings(){
  var wordPool =
    ['apple','computer','japan','glasses','bag','fish','italy','dictionary','book', 'leather',
    'husband','breakfast','lady','silk','festival','spirit','medicine','bike','plastic','stone',
    'flower','tissue','nail','video','beach','ship','face','body','head','key',
    'wind','bridge','nose','car','bath','ghost','ring','slide','hockey','wine',
    'root','mouth','board','vitamin','air','ear','eye','sea','pie','cell'];


  var words = [];
  var numWords = 8;

  for(var i = 0; i < numWords; i++){
    let j = Math.floor(Math.random() * wordPool.length);
    words.push(wordPool[j]);
    wordPool.splice(j,1);
  }

  return words;
}

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

function createColorChanger(wordDisplays){

  var color_changer = document.createElement('button');
  color_changer.innerHTML = "Reveal Colors";
  color_changer.className = "interactions-button"

  var interactions = document.getElementById('interactions');
  interactions.append(color_changer)

  color_changer.addEventListener('click', () => {

    var reveal = color_changer.innerHTML == "Reveal Colors"
    color_changer.innerHTML = reveal ? "Hide Colors" : "Reveal Colors";

    wordDisplays.forEach((word) => {

      var word_display = document.getElementById(word.id);

      if (reveal) {
        switch (word.color) {
          case 'blue':
            word_display.style.backgroundColor = "lightblue";
            break;
          case 'red':
            word_display.style.backgroundColor = 'darkorange';
            break;
          case 'black':
            word_display.style.backgroundColor = 'darkgrey';
            break;
        }
      }
      else if (word_display.style.backgroundColor != 'lightgrey') {
        word_display.style.backgroundColor = 'white';
      }
    });
  });
}

function createRefreshButton(){

  var refreshButton = document.createElement('button');
  refreshButton.innerHTML = "Refresh";
  refreshButton.className = "interactions-button"


  var interactions = document.getElementById('interactions');
  interactions.append(refreshButton)

  refreshButton.addEventListener('click', () => {
    window.location.reload()
  });
}
