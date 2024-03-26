import { defineStore } from 'pinia'
import { ref } from 'vue';


export const useSettingsStore = defineStore('settingsStore', () => {
    const soundOn = ref(true)
    const volume = ref(1)

    return { soundOn, volume }
})