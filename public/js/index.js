let socket = io();

function start(){
  var startButton = document.getElementById('start');
  startButton.remove();

  var announcements = document.getElementById('messages');
  announcements.innerHTML = "";

  var display = document.createElement('div');
  display.id = 'word-display';

  var display_wrapper = document.getElementById('word-display-wrapper');
  display_wrapper.append(display);

  var vectors = ["glove-embeddings.txt", "word2vec-embeddings.txt", "friends-w2v.txt", "pft"]
  var index = Math.floor(Math.random() * vectors.length);
  var vectorPath = vectors[index];
  // vectorPath = vectors[3]
  console.log("vectors: " + vectorPath)

  if(vectorPath == "pft")
  {
    var algorithmPath = "pft.py";
  }
  else
  {
    var algorithms = ["algorithm4.py"]
    var index = Math.floor(Math.random() * algorithms.length);
    var algorithmPath = algorithms[index];
  }

  console.log("algorithm: " + algorithmPath)

  var numWords = 10;
  var minTargetWords = 2;
  var maxCosDistance = 0.7;
  var blueWeight = 5;
  var redWeight = 1;
  var blackWeight = 2;

  var words = createWords(numWords);

  createRefreshButton();

  var wordDisplays = displayWords(words);
  createColorChanger(wordDisplays);

  var param = {
    blues: words.blues,
    reds: words.reds,
    blacks: words.blacks,
    algorithmPath: algorithmPath,
    vectorPath: vectorPath,
    minTargetWords: minTargetWords,
    maxCosDistance: maxCosDistance,
    blueWeight: blueWeight,
    redWeight: redWeight,
    blackWeight: blackWeight,
  };

  socket.emit('wordsCreated', param);

  displayLoadingIndicator()
}

function displayLoadingIndicator(){
  var loader = document.createElement('div');
  loader.className = "center-wrapper"
  loader.innerHTML = "<div class='loader'></div>";

  var interactions = document.getElementById('messages');
  interactions.append(loader)

  addMessage("Thinking... ", 'message-thinking')
}

socket.on('hintGiven', (jsonResults) => {

  console.log(jsonResults)

  try
  {
    var results = JSON.parse(jsonResults);

    var announcements = document.getElementById('messages');
    announcements.innerHTML = "";

    var hint = results.hint.toUpperCase();

    addMessage('Hint: ' + hint, 'messages-hint');
    addMessage('Select ' + results.count + ' words.', 'messages-selections-left');

    socket.on('scoreSent', (message) => {
      addMessage(message, 'message-score');
    });
  }
  catch(e)
  {
    console.log(e);
    return;
  }

});


function createResultsButton(results){

  var resultsButton = document.createElement('button');
  resultsButton.innerHTML = "Reveal Results";
  resultsButton.id = "button-results"
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

  words.all.forEach((word) => {

    var word_button = document.createElement('button');
    word_button.id = 'word-' + word.string;
    word_button.className = 'word';
    word_button.innerHTML = word.string.toUpperCase();
    display.append(word_button);

    var db = {
      button: word_button,
      id: word_button.id,
      word: word,
      color: word.color,
      selected: false,
    };

    socket.on('hintGiven', (jsonResults) => {

      try
      {
        var results = JSON.parse(jsonResults);

        word_button.addEventListener('click', () => {

          selectedWords.push(word);

          if(selectedWords.length <= results.count)
          {
            db.selected = true,
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
      }
      catch(e)
      {
        console.log(e);
        return;
      }

    })

    retVal.push(db);

  });

  return retVal;
}

function createWords(numWords){
  //Array to store the actual words to display as strings
  var wordStrings = createWordStrings(numWords);

  //Array to store a color map that determines which words are good, bad, or the assassin
  var colorMap = createColorMap(numWords);

  var words =
  {
    blues: [],
    reds: [],
    blacks: [],
    all: [],
  }

  //Creating the words array using the wordStrings and colorMap
  for(var i = 0; i < colorMap.length; i++)
  {
    var string = wordStrings[i];
    var color = colorMap[i];

    switch (color)
    {
      case 'blue':
        words.blues.push(string);
        break;
      case 'red':
        words.reds.push(string);
        break;
      case 'black':
        words.blacks.push(string);
        break;
    }

    var word =
    {
      string: string,
      color: color
    }

    words.all.push(word);
  }

  return words;
}

function createWordStrings(numWords){
  var wordPool =
    ['apple','computer','glasses','bag','fish','italy','dictionary','book', 'leather',
    'husband','breakfast','lady','silk','festival','spirit','medicine','bike','plastic','stone',
    'flower','tissue','nail','video','beach','ship','face','body','head','key',
    'wind','bridge','nose','car','bath','ghost','ring','slide','hockey','wine',
    'mouth','board','air','ear','eye','sea','pie','cell','ocean'];

  var words = [];

  for(var i = 0; i < numWords; i++){
    let j = Math.floor(Math.random() * wordPool.length);
    words.push(wordPool[j]);
    wordPool.splice(j,1);
  }

  return words;
}

function createColorMap(numWords){

  var colorPool = Array(numWords);
  colorPool.fill('blue', 0, numWords / 2);
  colorPool.fill('red', numWords / 2, numWords - 1);
  colorPool[numWords - 1] = 'black';


  var colors = [];

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
        word_display.style.backgroundColor = word_display.selected ? 'lightgrey' : 'white';
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

function addMessage(text, id, div = true) {
  var format = div ? 'div' : 'pre';
  var message = document.createElement(format);
  message.innerHTML = text;
  message.id = id;
  message.className = 'message';

  var messages = document.getElementById('messages');
  messages.append(message);

  console.log("adding message: " + text)
}

function replaceMessage(text, id){
  var message = document.getElementById(id);
  console.log("replacing message")
  message.innerHTML = text;
}

function removeMessage(id) {
  var message = document.getElementById(id);
  console.log("removing message")

  if (message) {
    message.remove();
    return true;
  }

  return false;
}
