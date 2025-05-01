const socket = io();

function connectToGame() {
    const name = document.getElementById("playerName").value.trim();
    if (name) {
        document.getElementById("login-container").style.display = 'none';
        document.getElementById("game-container").style.display = 'block';
        socket.emit('join', name);
        document.getElementById("player-id").innerText = `Welcome, ${name}!`;
    }
}

function makeChoice(choice) {
    socket.emit('choice', choice);
    document.getElementById("result").innerText = 'Waiting for opponent...';
}

socket.on('updatePlayers', (players) => {
    const playersDiv = document.getElementById("players");
    playersDiv.innerHTML = '<h3>Players</h3>';
    
    const playersList = Object.values(players);
    if (playersList.length < 2) {
        playersDiv.innerHTML += '<p>Waiting for another player to join...</p>';
    }
    
    playersList.forEach(player => {
        const choiceDisplay = player.choice ? '✓ Made a choice' : 'Thinking...';
        playersDiv.innerHTML += `<p>${player.name} - ${choiceDisplay}</p>`;
    });
});

socket.on('result', ({ result, players }) => {
    document.getElementById("result").innerText = result;
    
    const playersDiv = document.getElementById("players");
    playersDiv.innerHTML = '<h3>Results</h3>';
    Object.values(players).forEach(player => {
        playersDiv.innerHTML += `<p>${player.name} chose ${player.choice}</p>`;
    });
    
    setTimeout(() => {
        document.getElementById("result").innerText = '';
        socket.emit('reset');
    }, 3000);
});