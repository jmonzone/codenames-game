let socket = io();

socket.on('connect', () => {

  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
  socket.emit('joinRequest', params);

  var startButton = document.getElementById('start');
  startButton.addEventListener('click', () => {
    socket.emit('startGame');
  });

  var chatInput = document.getElementById('chat-input');
  var chatForm = document.getElementById('chat-form');

  chatForm.onsubmit = function(e) {
    e.preventDefault();
    if(chatInput.value[0] !== '/')
      socket.emit('messageRequest',chatInput.value);
    chatInput.value = '';
  }
});

socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});

socket.on('updateUsers', function(users) {
  let ol = document.createElement('ol');

  users.forEach(function(user) {
    let li = document.createElement('li');
    li.innerHTML = user.name;
    ol.appendChild(li);
  });

  let usersList = document.querySelector('#users');
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

socket.on('messageSent', (from, message) => {
  var chatText = document.getElementById('chat-text');
  chatText.innerHTML += '<div>' + from + ': ' + message + '</div>';
  var messages = document.querySelector('#chat-text').lastElementChild;
  messages.scrollIntoView();
});
