<template>
    
    <div id="keysList">
      <div class="keyInstruction">
        <div class="key">
          <p>A</p>
        </div>
        <div class="keyText">
          <p> - Roll left</p>
        </div>
      </div>

      <div class="keyInstruction">
        <div class="key">
          <p>D</p>
        </div>
        <div class="keyText">
          <p> - Roll Right</p>
        </div>
      </div>

      <div class="keyInstruction">
        <div class="key">
          <p>Q</p>
        </div>
        <div class="keyText">
          <p> - Rear view camera</p>
        </div>
      </div>

      <div class="keyInstruction">
        <div class="key">
          <p>E</p>
        </div>
        <div class="keyText">
          <p> - Shoot missile (lock on for <br> missile to track the target)</p>
        </div>
      </div>

      <div class="keyInstruction">
        <div class="key">
          <p>🖱</p>
        </div>
        <div class="keyText">
          <p> - Yaw, pitch</p>
        </div>
      </div>

      <div class="keyInstruction">
        
          <p style="font-weight: 600;">mouse 1 - </p>
        
        <div class="keyText">
          <p>Shoot gun</p>
        </div>
      </div>

      <div class="keyInstruction">
        
        <div class="key">
          <p>Esc</p>
        </div>
      
      <div class="keyText">
        <p> - Quit</p>
      </div>
    </div>
    </div>
    
    
    <Header/>
  </template>

<script setup>
import Header from './components/Header.vue'
</script>

<style scoped>
.key {
  width: 35px;
  height: 30px;
  background-color: white;
  border-radius: 5px;
  text-align: center;
  padding-top: 2px;
  font-weight: 600;
}

#keysList {
  margin-top: 10px;
  margin-left: 10px;
}

.keyInstruction {
  display: flex;
  margin-bottom: 15px;
}

.keyText {
  margin-left: 10px;
  margin-top: auto;
  margin-bottom: auto;
  font-weight: 600;
}
</style>