<script setup>

</script>

<template>
  <div class="column">
    <div class="container">
      <router-view></router-view>
    </div>
    
  </div>
</template>

<style>
.column {
  background-image: linear-gradient(#ABC4FF, #D8F3DC);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  font-family: 'Lato', sans-serif;
  font-size: 18px;
}

.container {
  background: rgba(0, 0, 0, 0.05);
  
  margin: 30px auto;
  width: 350px;
  padding: 5px 10px;
  padding-bottom: 15px;
  border-radius: 5px;
}


.btn {
  appearance: button;
  background-color: #B5E48C;
  border: solid transparent;
  border-radius: 16px;
  border-width: 0 0 4px;
  box-sizing: border-box;
  color: #FFFFFF;
  cursor: pointer;
  display: inline-block;
  font-family: din-round,sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: .8px;
  line-height: 20px;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 13px 16px;
  text-align: center;
  text-transform: uppercase;
  touch-action: manipulation;
  transform: translateZ(0);
  transition: filter .2s;
  user-select: none;
  -webkit-user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  width: 100%;
}

.btn:after {
  background-clip: padding-box;
  background-color: #76C893;
  border: solid transparent;
  border-radius: 16px;
  border-width: 0 0 4px;
  bottom: -4px;
  content: "";
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: -1;
}

.btn:main,
.btn:focus {
  user-select: auto;
}

.btn:hover:not(:disabled) {
  filter: brightness(1.1);
  -webkit-filter: brightness(1.1);
}


.btn:active {
  border-width: 4px 0 0;
  background: none;
}

.btn-small {
  cursor: pointer;
  background-color: #9c88ff;
  box-shadow: var(--box-shadow);
  color: #fff;
  border: 0;
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-top: 15px;
  padding: 10px;
  width: 90px;
  border-radius: 5px;
}



</style>