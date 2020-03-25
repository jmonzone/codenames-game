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

  var algorithmSelect = document.getElementById('algorithm-select');
  var algorithmPath = "";
  switch(algorithmSelect.value)
  {
    case '1':
      algorithmPath = "algorithm1.py";
      break;
    case '2':
      algorithmPath = "algorithm2.py";
      break;
    case '3':
      algorithmPath = "algorithm3.py";
      break;
  }

  var vectorSelect = document.getElementById('vector-select');
  var vectorPath = "";
  switch(vectorSelect.value)
  {
    case 'glove':
      vectorPath = "glove-embeddings.txt";
      break;
    case 'word2vec':
      vectorPath = "word2vec-embeddings.txt";
      break;
  }

  var numWordsSelect = document.getElementById('numWords-select');
  var numWords = parseFloat(numWordsSelect.value);

  var minTargetWordsSelect = document.getElementById('minTargetWords-select');
  var minTargetWords = parseFloat(minTargetWordsSelect.value);

  var maxCosDistanceSelect = document.getElementById('maxCosDistance-select');
  var maxCosDistance = maxCosDistanceSelect.value * 0.01;

  var blueWeightSelect = document.getElementById('blueWeight-select');
  var blueWeight = parseFloat(blueWeightSelect.value);

  var redWeightSelect = document.getElementById('redWeight-select');
  var redWeight = parseFloat(redWeightSelect.value);

  var blackWeightSelect = document.getElementById('blackWeight-select');
  var blackWeight = parseFloat(blackWeightSelect.value);

  var settings = document.getElementById('settings');
  settings.remove();


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
  
  console.log(param.vectorPath);

  socket.emit('wordsCreated', param);
}

function onNumWordsInput(){
  var numWordsSelect = document.getElementById("numWords-select");
  var numWordsOutput = document.getElementById("numWords-output");
  numWordsOutput.innerHTML = numWordsSelect.value;
}

function onMinTargetWordsInput(){
  var minTargetWordsSelect = document.getElementById("minTargetWords-select");
  var minTargetWordsOutput = document.getElementById("minTargetWords-output");
  var output = minTargetWordsSelect.value;
  minTargetWordsOutput.innerHTML = output;
}

function onMaxCosDistanceInput(){
  var maxCosDistanceSlider = document.getElementById("maxCosDistance-select");
  var maxCosDistanceOuput = document.getElementById("maxCosDistance-output");
  var output = maxCosDistanceSlider.value * 0.01;
  if (output != 1 && output != 0)
  {
    output = (maxCosDistanceSlider.value * 0.01).toFixed(2);
  }
  maxCosDistanceOuput.innerHTML = output;
}

function onBlueWeight(){
  var weightSlider = document.getElementById("blueWeight-select");
  var weightOutput = document.getElementById("blueWeight-output");
  var output = weightSlider.value;
  weightOutput.innerHTML = output;
}

function onRedWeight(){
  var weightSlider = document.getElementById("redWeight-select");
  var weightOutput = document.getElementById("redWeight-output");
  var output = weightSlider.value;
  weightOutput.innerHTML = output;
}

function onBlackWeight(){
  var weightSlider = document.getElementById("blackWeight-select");
  var weightOutput = document.getElementById("blackWeight-output");
  var output = weightSlider.value;
  weightOutput.innerHTML = output;
}

socket.on('hintGiven', (jsonResults) => {

  var results = JSON.parse(jsonResults);
  var hint = results.hint.toUpperCase();

  if(results && (hint != "" || results.count == 0))
  {
    addMessage('Hint: ' + hint, 'messages-hint');
    addMessage('Select ' + results.count + ' words.', 'messages-selections-left');
  }
  else
  {
    addMessage('Hint not found.');
  }

  createResultsButton(results);

  socket.on('resultsCalculated', () => {

    var resultsButton = document.getElementById('button-results');
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

      var results = JSON.parse(jsonResults);
      if (results.hint == '') return;

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
    ['apple','computer','japan','glasses','bag','fish','italy','dictionary','book', 'leather',
    'husband','breakfast','lady','silk','festival','spirit','medicine','bike','plastic','stone',
    'flower','tissue','nail','video','beach','ship','face','body','head','key',
    'wind','bridge','nose','car','bath','ghost','ring','slide','hockey','wine',
    'root','mouth','board','vitamin','air','ear','eye','sea','pie','cell','ocean'];


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
