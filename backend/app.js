const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
var cors = require('cors')
require('dotenv').config()

const app = express();
app.use(express.json());
const server = http.createServer(app);

console.log(process.platform)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_SERVER
  }
});

const { LobbyManager } = require('./services/LobbyManager.js');

// Serve client-side files
app.use(express.static('dist'));
app.use(cors())

const lobbyManager = new LobbyManager(io);

// Handle WebSocket connections
io.on('connection', (socket) => {
  const playerName = socket.handshake.query.name;
  const lobbyName = socket.handshake.query.room;
  const player_id = socket.id;
  console.log('A player has connected');

  socket.join(lobbyName);
  lobbyManager.addNewPlayerToLobby(player_id, playerName, lobbyName);
  socket.emit('set_state', { "current_player": player_id, "players": lobbyManager.getLobbyPlayers(lobbyName) })

  socket.to(lobbyName).emit('player_joined', lobbyManager.getLobby(lobbyName).getPlayer(player_id));
  io.to(lobbyName).emit("updateScoreBoard", lobbyManager.getLobby(lobbyName).getScoreBoard());

  socket.on('take_damage', (data) => {
    var playerId = data.id;
    var damage = data.dmg;
    lobbyManager.getLobby(lobbyName).updateHealth(playerId, damage, socket.id);
  });

  socket.on('push_state', (state) => {
    lobbyManager.getLobby(lobbyName).updatePlayer(state);
  });

  socket.on('missile_launched', (current_state) => {
    lobbyManager.getLobby(lobbyName).addMissile(current_state);
    socket.to(lobbyName).emit('spawn_missile', current_state);
  });

  socket.on('missile_update', (current_state) => {
    lobbyManager.getLobby(lobbyName).updateMissile(current_state);
  });

  socket.on('missile_despawn', (id) => {
    lobbyManager.getLobby(lobbyName).deleteMissile(id);
    io.to(lobbyName).emit('missile_remove', id);
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    lobbyManager.getLobby(lobbyName).deletePlayer(player_id);
    io.to(lobbyName).emit('remove_player', player_id);
    io.to(lobbyName).emit("updateScoreBoard", lobbyManager.getLobby(lobbyName).getScoreBoard());
  });

});

setInterval(() => {
  lobbyManager.updateGameStates();
}, 1000 / 60);

app.get('/', async (req, res) => {
  res.sendFile(__dirname + '../dist/index.html');

})

app.get('/debug', async (req, res) => {

  const ln = lobbyManager.getLobbyPlayers("default");
  console.log(ln)
  res.send();
})

app.get('/api/getLobbies', (req, res) => {
  res.json(lobbyManager.getLobbies());
})

app.get('/api/deleteLobby', (req, res) => {
  let name = req.query.name;
  let result = lobbyManager.deleteLobby(name);
  res.json({result: result})
})

app.get('/api/createLobby', (req, res) => {
  let name = req.query.name;
  let result = lobbyManager.createLobby(name, true);
  res.json({result: result});
})

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  lobbyManager.createLobby("default", false);
  lobbyManager.createLobby("default2", false);
});