<template>
    <div v-if="showGame">
        <canvas class="webgl" id="webgl" ></canvas>
        <canvas class="radar" id="radar" ></canvas>
        <div id="scoreboard"></div>
        <div id="quitOverlay" class="overlay" style="display: none;">
            <div class="overlay-content">
                <p>Are you sure you want to quit?</p>
                <button id="quitButton" @click="quit()">Quit</button>
            </div>
        </div>
    </div>
    <div v-else>
        <h1 id="lobbyName">{{ lobbyName }}</h1>
        <div id="form">
            <input id="inputField" placeholder="your name" type="text" v-model="playerName">
            <div id="formBtnBox">
                <button id="formBtn" class="btn" @click="join()">join</button>
            </div>
        </div>
        <Header/>
    </div>
    
</template>

<script setup>
import Header from './components/Header.vue'
import { Game } from './modules/Game.js';
import { Models } from './modules/Models.js';
import { ref } from 'vue';
import { Audios } from './modules/Audio.js';
import { useSettingsStore } from './store/settingsStore'
import { io } from "socket.io-client";

const store = useSettingsStore();

const showGame = ref(false)
const playerName = ref('');

const props = defineProps({
    lobbyName: String
})

const join = () => {
    if(playerName.value == "")
    {
        alert("please enter your name");
    }
    else
    {
        showGame.value = true;
        startGame(playerName.value, props.lobbyName);
    }
}

const quit = () => {
    window.location.replace("/",);
}

async function startGame(playerName, lobbyName)
{
    await Models.loadModels();
    await Audios.loadAudio(store.soundOn, store.volume);

    const URL = import.meta.env.MODE === 'production' ?import.meta.env.VITE_BACKEND_SERVER_PROD : import.meta.env.VITE_BACKEND_SERVER_DEV;

    var socket = io(URL, {
        query: {
            "name": playerName,
            "room": lobbyName
          }
    });

    Game.setSocket(socket);
    
    //add all players, including current player to the game
    /*
    {
        "current_player": id,
        "players": [{x:0,y:0,z:0,id: id},{x:0,y:0,z:0,id: id},{x:0,y:0,z:0,id: id}]
    }
    */
    socket.on('set_state', function (state) {
        Game.setGameState(state);
    });

    socket.on('player_joined', function (player) {
        Game.createOtherPlayer(player);
    });

    socket.on('remove_player', function (id) {
        Game.deletePlayer(id);
    });

    socket.on('update_players_state', function (state) {
        Game.updateOtherPlayers(state);
    });

    socket.on('update_missiles_state', function (state) {
        Game.updateMissilesState(state);
    });

    socket.on('missile_remove', function (id) {
        Game.deleteMissile(id);
    });

    socket.on('takedown', function (data) {
        Game.takedown_player(data.playerId);
    });

    socket.on('revive', function (data) {
        Game.revive_player(data.playerId);
    });

    socket.on('spawn_missile', function (data) {
        Game.spawnDummyMissile(data);
    });

    socket.on('updateScoreBoard', function (data) {
        updateScoreBoard(data)
    });

    const updateScoreBoard = (players) => {
        // Get the scoreboard container
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerHTML = '';
        // Iterate through the players array
        players.forEach(player => {
        // Create a player entry
        const playerEntry = document.createElement('div');
        playerEntry.classList.add('player');

        // Create elements for player name and score
        const playerName = document.createElement('div');
        playerName.classList.add('player-name');
        playerName.textContent = player.player_name;

        const playerScore = document.createElement('div');
        playerScore.classList.add('player-score');
        playerScore.textContent = player.score;

        // Append elements to the player entry
        playerEntry.appendChild(playerName);
        playerEntry.appendChild(playerScore);

        // Append the player entry to the scoreboard
        scoreboard.appendChild(playerEntry);
    });
  }
}

</script>

<style scoped>

.webgl
{
    position: fixed;
    top: 0;
    left: 0;
    outline: none;
}


body {
    cursor:crosshair;
}

.radar {
    position: absolute;
    top: 0px;
    left: 0px;

    z-index: 1;
}

.overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
}

.overlay-content {
    text-align: center;
    background: #fff;
    padding: 20px;
    border-radius: 10px;
}

#quitButton {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

#quitButton:hover {
    background-color: #c0392b;
}

#formBtnBox {
    width: 80px;
    margin-top: auto;
    margin-bottom: auto;
}

#inputField {

border-radius: 60px;
height: 20px;
width: 220px;
margin-top: auto;
margin-bottom: auto;
margin-right: 10px;
padding-left: 10px
}

#formBtn {
    padding-top: 5px;
    font-size: 12px;
    height: 35px;
    background-color: #76C893;
}

#formBtn:after {
    background-color: #52B69A;
}

#form {
    display: flex;
    margin-bottom: 20px;
}

#lobbyName {
    font-weight: 700;
}

</style>