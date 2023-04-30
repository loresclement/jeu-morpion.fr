const express = require('express');
const app = express();
const port = 3000;
const server = app.listen(port);
const io = require('socket.io')(server);
const gameLogic = require('./gameLogic');

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 've8ePUWU',
  database: 'morpion'
});

connection.connect(function(err) {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données : ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données avec ID de connexion ' + connection.threadId);
});

function update()
{
  connection.query('UPDATE stats SET played = played + 1 WHERE id = 1', function(err, results, fields) {
    if (err) {
      console.error('Erreur lors de la mise à jour de la table stats : ' + err.stack);
      return false
    }
    return true
  });
}

app.get('/stats', (req, res) => {
  connection.query('SELECT played FROM stats', (error, results, fields) => {
    if (error)
      res.status(401).json({ error: "error"});
    else 
      res.status(200).json({ played: results[0].played});
  });
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

var room = []

io.on('connection', (socket) => {
  
  socket.on('connection', () => 
  {
    socket.join(socket.id)
  })

  socket.on('move', (message) => {

    const string = message.toString()
    var array = string.split(",").map(el => parseInt(el) || 0);
    const move = gameLogic.findBestMove(array);
    array[move] = 2

    if(gameLogic.checkWin(array) === -1)
    {
      io.to(socket.id).emit("new-move", move)
    }
    else 
    {
      io.to(socket.id).emit("new-move", move)
      io.to(socket.id).emit("win", gameLogic.checkWin(array))
      update()
    }
  });

  socket.on('create-game', (message) => {
    const generateRandomNumber = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };
    
    const gameId = generateRandomNumber();

    socket.join(gameId.toString())
    
    room.push({id: gameId.toString(), players: [message]})
  
    socket.emit('game-created', {id: gameId, pseudo: message})
  })

  socket.on('join-game', (message) => 
  {
    if (io.sockets.adapter.rooms.has(message.code.toString()) && io.sockets.adapter.rooms.get(message.code.toString()).size < 2)
    {
      const game = room.find(game => game.id === message.code.toString());

      if (game && !game.players.includes(message.pseudo)) 
      {
        socket.join(message.code.toString())
        socket.emit('game-joined', message);
        game.players.push(message.pseudo);
      }
      else 
      {
        socket.emit('fail-join', "Le pseudo est déjà utilisé");
      }
    } 
    else 
    {
      socket.emit('fail-join', "Ce code n'est relié à aucun jeu")
    }
  })


  socket.on('joined', (data) => 
  {
    var sizeOfRoom = 0

    if(io.sockets.adapter.rooms.has(data.id.toString()))
      sizeOfRoom = io.sockets.adapter.rooms.get(data.id.toString()).size
  
    io.to(data.id.toString()).emit("new-player", {pseudo: data.pseudo, size: sizeOfRoom})
  })

  socket.on('set-turn', (data) => 
  {
    io.to(data.id).emit("turn-changed", data.pseudo)
  })

  socket.on('new-move', (data) => 
  {
    const string = data.board.toString()
    var array = string.split(",").map(el => parseInt(el) || 0);

    var win = gameLogic.checkWin(array)

    if(win !== -1)
    {
      io.to(data.id).emit("win", win)
      update()
    }

    io.to(data.id).emit("update-board", {board: data.board, pseudo: data.pseudo})
  })

  socket.on('leave-game', (data) => {

    socket.leave(data.id.toString());
    var roomIndex = room.findIndex(x => x.id === data.id.toString());
    var sizeOfRoom = 0;

    if (roomIndex !== -1) 
    {
      sizeOfRoom = io.sockets.adapter.rooms.get(data.id.toString()).size;

      const game = room.find(game => game.id === data.id.toString());
      const playerIndex = game.players.indexOf(data.pseudo);
      game.players.splice(playerIndex, 1);

      if (sizeOfRoom === 0) 
        room.splice(roomIndex, 1);
    }
    io.to(data.id.toString()).emit('opponent-left', {size: sizeOfRoom, pseudo: data.pseudo});
  });
  
  

  socket.on('restart', (data) => 
  {
    io.to(data.id).emit("restarted")
  })

  socket.on('send-message', (data) => 
  {
    io.to(data.id).emit("received-message", {timestamp: Date.now(), content: data.content, pseudo: data.pseudo})
  })
});

console.log(`socket server listening on port ${port}`);
