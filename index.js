const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

app.use(express.static(path.join(__dirname, 'public')));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const gameFile = path.join(__dirname, 'game.json');

// Считываем текущее состояние игры
function readGameState() {
  try {
    const data = fs.readFileSync(gameFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения game.json:', err);
    return {};
  }
}

// Сохраняем новое состояние игры
function saveGameState(state) {
  fs.writeFileSync(gameFile, JSON.stringify(state, null, 2));
}

app.get('/', (req, res) => {
  res.send('UNO WebSocket сервер работает');
});

io.on('connection', (socket) => {
  console.log('🟢 Новый клиент подключился');

  // При подключении — сразу отдаем состояние
  socket.emit('game_state', readGameState());

  // Когда клиент запрашивает состояние
  socket.on('get_game_state', () => {
    socket.emit('game_state', readGameState());
  });

  // Когда клиент отправляет обновленное состояние
  socket.on('update_game_state', (newState) => {
    saveGameState(newState);
    io.emit('game_state', newState); // Рассылаем всем
  });

  socket.on('disconnect', () => {
    console.log('🔌 Клиент отключился');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
