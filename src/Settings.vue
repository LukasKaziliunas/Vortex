<template>
    
    <div class="setting">
        <div class="settingLabel">
          <p>Sound on</p>
        </div>
        <div class="settingControl">
          <input type="checkbox" id="SoundOn" v-model="store.soundOn" />
        </div>
      </div>


      <div class="setting">
        <div class="settingLabel">
          <p>Volume</p>
        </div>
        <div class="settingControl">
          <input type="range" min="0" max="1" step="0.1" v-model="store.volume">
        </div>
      </div>

    <Header/>
  </template>

<script setup>
import Header from './components/Header.vue'
import { useSettingsStore } from './store/settingsStore'

const store = useSettingsStore()

</script>


<style scoped>

.settingLabel {
  width: 100px;
  height: 30px;
  
  text-align: left;
  font-weight: 600;
}

.setting {
  display: flex;
  margin-bottom: 15px;
}

.settingControl {
  margin-top: auto;
  margin-bottom: auto;
}

</style>./store/settingsStore