const { Lobby } = require('./Lobby.js');
const EventEmitter = require('node:events');

class LobbyManager {

    lobbies = [];
    EE;
    io;

    constructor(ioInstance) {

        this.EE = new EventEmitter();
        this.io = ioInstance;

        this.EE.on('takedown', (arg) => {
            this.io.to(arg.lobbyName).emit("takedown", { playerId: arg.playerId })
        })
        
        this.EE.on('revive', (arg) => {
            this.io.to(arg.lobbyName).emit("revive", { playerId: arg.playerId });
        })
        
        this.EE.on('updateScoreBoard', (arg) => {
            this.io.to(arg.lobbyName).emit("updateScoreBoard", this.getLobby(arg.lobbyName).getScoreBoard());
        })
        
    }

    createLobby(name, deletable)
    {
        if(!this.getLobby(name))
        {
            const newLobby = new Lobby(this.EE, name, deletable);
            this.lobbies.push(newLobby);
            return true;
        }
        
        return false;
        
    }

    addNewPlayerToLobby(playerId, playerName, lobbyName)
    {
        const lobby = this.getLobby(lobbyName)
        lobby.addPlayer(playerId, playerName);
    }

    getLobbyPlayers(name)
    {
       return this.getLobby(name).getState();
    }

    getLobby(name)
    {
        const lobby = this.lobbies.find(lobby => lobby.lobbyName == name );
        return lobby;
    }

    updateGameStates()
    {
        this.lobbies.forEach(lobby => {
            this.io.to(lobby.lobbyName).emit('update_players_state', lobby.getState());
            this.io.to(lobby.lobbyName).emit('update_missiles_state', lobby.getMissileState());
        })
        
    }

    getLobbies()
    {
        const lobbies = this.lobbies.map(lobby => { return { name: lobby.lobbyName, player_count: lobby.players.length, is_deletable: lobby.deletable }});
        return lobbies;
    }

    deleteLobby(name)
    {
        let lobby = this.getLobby(name);

        if(!lobby)
        {
            return false;
        }

        if(lobby.players.length > 0 || lobby.deletable == false)
        {
            return false;
        }

        const index = this.lobbies.findIndex(lobby => lobby.lobbyName === name);
        if (index !== -1) {
            this.lobbies.splice(index, 1);
            return true;
        }

        return false;
    }


    
}

module.exports = { LobbyManager }; 