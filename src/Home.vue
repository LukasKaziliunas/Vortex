<template>
        <div class="button-row">
                <button class="btn" @click="redirectPlay">Play</button>
        </div>
        <div class="button-row">
                <button class="btn" @click="redirectSettings">Settings</button>
        </div>
        <div class="button-row">
                <button class="btn" @click="redirectControls">Controls</button>
        </div> 

</template>

<script setup>

import { useRouter } from 'vue-router'

const router = useRouter();

const redirectPlay = () => {
        router.push({name: 'Lobbies'});
}   

const redirectSettings = () => {
        router.push({name: 'Settings'});
}

const redirectControls = () => {
        router.push({name: 'Controls'});
}

</script>

<style>
.button-row {   
    margin-top: 10px;
    width: 250px;
    margin-left: auto;
    margin-right: auto;    
}
</style>