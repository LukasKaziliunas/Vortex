<template>
    <div id="buttonRow">
        <button class="btn" @click="redirectBack">Back</button>
    </div>
</template>

<script setup>

import { useRouter } from 'vue-router'

const router = useRouter();

const redirectBack = () => {
        router.go(-1);
}   

</script>

<style>
#buttonRow {
    margin-bottom: 0px;
    width: 150px;
    margin-left: auto;
    margin-right: auto;
}
</style>