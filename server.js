const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const players = {};

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    players[socket.id] = { name: '', choice: null };

    socket.on('join', (name) => {
        players[socket.id].name = name;
        io.emit('updatePlayers', players);
    });

    socket.on('choice', (choice) => {
        console.log("choice", choice)
        players[socket.id].choice = choice;
        io.emit('updatePlayers', players);
        checkResult();
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
    
    socket.on('reset', () => {
        resetChoices();
        io.emit('updatePlayers', players);
    });

    function checkResult() {
        const playerIds = Object.keys(players);
        if (playerIds.length === 2) {
            const [p1, p2] = playerIds;
            if (players[p1].choice && players[p2].choice) {
                const result = determineWinner(p1, p2);
                io.emit('result', { result, players });
            }
        }
    }

    function determineWinner(p1Id, p2Id) {
        const choice1 = players[p1Id].choice;
        const choice2 = players[p2Id].choice;
        
        if (!choice1 || !choice2) return null;
        if (choice1 === choice2) return "It's a tie!";
        if ((choice1 === 'rock' && choice2 === 'scissors') ||
            (choice1 === 'scissors' && choice2 === 'paper') ||
            (choice1 === 'paper' && choice2 === 'rock')) {
            return `${players[p1Id].name} wins!`;
        } else {
            return `${players[p2Id].name} wins!`;
        }
    }

    function resetChoices() {
        for (let id in players) players[id].choice = null;
    }
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));