<template>
    <form action="" @submit.prevent="onSubmit">
        <input id="inputField" type="text" v-model="lobbyName">
        <div id="formBtnBox">
            <button id="formBtn" class="btn">Create</button>
        </div>
        
    </form>
    
</template>

<script setup>

    import { ref } from 'vue';

    const emit = defineEmits(['lobbyCreated'])

    const lobbyName = ref('');

    const onSubmit = () => {
        if(lobbyName.value == "")
        {
            alert("name cannot be empty")
        }
        else
        {
            const URL = import.meta.env.VITE_BACKEND_SERVER;
            fetch(`${URL}/api/createLobby?name=${lobbyName.value}`)
            .then(data => { 
            return data.json() 
            })
            .then(result => {
                if(result.result)
                {
                    const newLobbyData = {
                        name: lobbyName.value
                    }

                    emit('lobbyCreated', newLobbyData);
                }
            });

        }
    }

</script>

<style scoped>

form {
    display: flex;
    height: 50px;
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
    height: 30px;
    padding-top: 5px;
    font-size: 12px;
    
}

</style>