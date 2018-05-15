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
import cookie from 'js-cookie';

export default {
  name: 'App',
  beforeMount() {
    if (window.location.pathname === '/oauth-callback') {
      const token = window.location.hash
        .split('&')
        .filter((el) => {
          if (el.match('access_token') !== null) {
            return true;
          }
          return false;
        })[0]
        .split('=')[1];
      cookie.set('token', token);
      window.location.replace('/#/home');
    }
  },
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
