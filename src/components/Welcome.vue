<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-size-25"></div>
      <div class="md-layout-item app-main-form">
        <img src="../assets/logo.png">
        <h1>VISUALIZE</h1>
        <p>{{ msg }}</p>
        <md-button v-on:click="authenticate" id="app-btn-authenticate"
          class="app-btn md-raised md-primary">
          Login with Asana
        </md-button>
      </div>
      <div class="md-layout-item md-size-25"></div>
    </div>
  </div>
</template>

<script>
import Asana from 'asana';

export default {
  name: 'Welcome',
  data() {
    return {
      msg: 'Bring your Asana project data to life with charts and graphs',
    };
  },
  methods: {
    authenticate() {
      const client = Asana.Client.create({
        clientId: process.env.ASANA_CLIENT_ID,
        redirectUri: process.env.ASANA_REDIRECT_URI,
      });
      client.useOauth();
      client.authorize().then(() => {
        client.users.me();
      }).catch((err) => {
        alert(err);
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.app-main-form {
  text-align: center;
}

#app-btn-authenticate {
  margin-top: 30px;
}

.app-btn {
  background: linear-gradient(to top right, rgba(255,82,99,0.9) 10%,
    rgba(255,115,129,0.9) 65%, rgba(252,189,1,0.9) 125%);
}
</style>
