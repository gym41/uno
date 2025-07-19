const socket = io();

socket.on('connect', () => {
  console.log('Подключились к WebSocket серверу');
});

socket.on('game_state', (data) => {
  console.log('Новое состояние игры:', data);
  document.getElementById('game').textContent = JSON.stringify(data, null, 2);
});

function saveGameState(newState) {
  socket.emit('update_game_state', newState);
}
