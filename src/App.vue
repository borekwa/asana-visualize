<template>
  <div id="app" class="md-layout">
    <div class="md-layout-item md-size-25"></div>
    <div class="md-layout-item">
      <img src="./assets/logo.png">
      <router-view/>
    </div>
    <div class="md-layout-item md-size-25"></div>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: "Segoe UI",Roboto,"Helvetica Neue",Helvetica,Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #151b26;
  margin-top: 30px;
}

img {
  max-width: 200px;
}
</style>
