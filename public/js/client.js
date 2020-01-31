//client.js handles socket related events

let socket = io();

socket.on('connect', () => {

  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
  socket.emit('joinRequest', params);
});

socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});
