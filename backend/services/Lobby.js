const Player = require("./Player.js");
const Missile = require("./Missile.js");

class Lobby {
    lobbyName;
    deletable;
    players = [];
    missiles = [];
    eventsEmitter;

    constructor(eventsEmitter, lobbyName, isDeletable) {
        this.deletable = isDeletable;
        this.eventsEmitter = eventsEmitter;
        this.lobbyName = lobbyName;
    }

    addPlayer(id, name) {
        const newPlayer = new Player(id, name, this.eventsEmitter);
        this.players.push(newPlayer);
    }

    getPlayer(id) {
        return this.players.find(player => player.id === id);
    }

    deletePlayer(id) {
        const index = this.players.findIndex(player => player.id === id);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    updatePlayer(state) {
        const player = this.getPlayer(state.id);
        if (player) {
            player.position = { ...state.position };
            player.rotation = [...state.rotation];
        }
    }

    updateHealth(recieverId, damage, shooterId)
    {
        
        const player = this.getPlayer(recieverId);
        if(!player)
            return;
        
        const isKilled = player.takeDamage(damage);
       
        if(isKilled)
        {
            if (recieverId !== shooterId) {
                this.getPlayer(shooterId).addScore();
                this.eventsEmitter.emit('updateScoreBoard', {lobbyName: this.lobbyName});
            }

            this.eventsEmitter.emit('takedown', {
                playerId: recieverId,
                lobbyName: this.lobbyName
            });

            // Death cooldown
            setTimeout(() => {
                this.eventsEmitter.emit('revive', { 
                    playerId: recieverId,
                    lobbyName: this.lobbyName
                });
                player.revived();
            }, 3000);
        }

        
    }

    addMissile(currentState) {
        const newMissile = new Missile(currentState.id, currentState.position, currentState.rotation);
        this.missiles.push(newMissile);
    }

    updateMissile(state) {
        const missile = this.missiles.find(m => m.id === state.id);
        if (missile) {
            missile.position = { ...state.position };
            missile.rotation = [...state.rotation];
        }
    }

    deleteMissile(id) {
        const index = this.missiles.findIndex(m => m.id === id);
        if (index !== -1) {
            this.missiles.splice(index, 1);
        }
    }

    getScoreBoard() {
        return this.players.map(player => ({ player_name: player.name, score: player.score }));
    }

    getState() {
        return this.players.map(player => (player.toJson()));
    }

    getMissileState() {
        return this.missiles.map(missile => ({ id: missile.id, position: missile.position, rotation: missile.rotation }));
    }
}

module.exports = { Lobby }; 