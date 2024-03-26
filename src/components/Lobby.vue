<template>
    <div class="lobbyCard">
        <div class="lobbyCard-left">
            <p>{{name}}</p>
            <p>{{player_count}}/10</p>
        </div>
        <div class="lobbyCard-right">
            <button v-if="is_deletable == true" class="buttonRemove" @click="remove()">❌</button>
            <button v-if="player_count < 10" class="btn-small btnJoin" @click="redirectLobby">Join</button>
        </div>
    </div>
    
</template>

<script setup>

import { useRouter } from 'vue-router'

const router = useRouter();

const emit = defineEmits(['lobbyDeleted'])

const props = defineProps({
    name: String,
    player_count: Number,
    maximum_players: Number,
    is_deletable: Boolean
})

const redirectLobby = () => {
        router.push({name: 'JoinLobby', params: {lobbyName: props.name}});
}  

const remove = () => {
    fetch(`/deleteLobby?name=${props.name}`)
    .then(data => { 
        return data.json() 
    })
    .then(result => {
        if(result.result)
        {
            const removeLobbyData = {
                name: props.name
            }

            emit('lobbyDeleted', removeLobbyData);
        }
        else
        {
            alert("This lobby cannot be deleted");
        }
    });
}

</script>

<style setup>

.lobbyCard {
    display: flex;
    
    background-color: white;
    margin-bottom: 10px;
    margin-right: 5px;
    border-radius: 5px;
}

.lobbyCard-left {
    padding: 10px;
    width: 200px;
}

.lobbyCard-right {
    display: flex;
    margin-right: 10px;
}

.buttonRemove {

  cursor: pointer;
  background-color: #ff0000;
  box-shadow: var(--box-shadow);
  border: 0;
  display: block;
  padding: 10px;
  width: auto;
  height: 40px;
  border-radius: 5px;
  margin-top: auto;
  margin-bottom: auto; 
  margin-right: 10px;    
}

.btnJoin {
    background-color: green;
    height: 40px;
    margin-top: auto;
    margin-bottom: auto;     
}

</style>
