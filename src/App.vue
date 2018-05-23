<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import cookie from 'js-cookie';

export default {
  name: 'App',
  beforeMount() {
    if (window.location.pathname === '/oauth-callback/') {
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
  color: #151b26;
  margin: 30px 10px;
}

img {
  max-width: 200px;
}
</style>
