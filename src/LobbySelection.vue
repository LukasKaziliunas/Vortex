<template>
    
    <div class="lobbiesList">
        <Lobby 
        @lobbyDeleted="removeLobby"
        v-for="lobby in lobbies"
        :name="lobby.name"
        :player_count=lobby.player_count
        :is_deletable=lobby.is_deletable
        :key="lobby.name"
        />
    </div>
    
    <CreateLobby @lobbyCreated="addLobby"/>
    <Header/>
  </template>


<script setup>
import Header from './components/Header.vue'
import Lobby from './components/Lobby.vue'
import CreateLobby from './components/CreateLobby.vue'
import { ref } from 'vue';

const lobbies = ref([]);

fetch('/getLobbies')
.then(data => { 
   return data.json() 
})
.then(lobbies_ => {
    lobbies_.forEach(l => {
        lobbies.value.push(l);
    });
    
});

const addLobby = (newLobby) => {
    lobbies.value.push({name: newLobby.name, player_count: 0, is_deletable: true});
}

const removeLobby = (data) => {
    const i = lobbies.value.findIndex(lobby => lobby.name === data.name);
  if (i > -1) {
    lobbies.value.splice(i, 1)
  }
}

</script>

<style>

.lobbiesList {
    height: 400px;
    overflow-y: scroll;
}

/* width */
::-webkit-scrollbar {
  width: 20px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey; 
  border-radius: 10px;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(160, 160, 160); 
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #808080; 
}

</style>