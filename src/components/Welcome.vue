<template>
  <form class="app-form">
    <h1>{{ msg }}</h1>
    <p>Enter your Access Token and Project ID</p>
    <md-field>
      <label>Access Token</label>
      <md-input v-model="accessToken"></md-input>
      <span class="md-helper-text">Get this from your Asana app settings <a href="https://app.asana.com" target="_blank">here</a>.</span>
    </md-field>

    <md-field>
      <label>Project ID</label>
      <md-input v-model="projectId"></md-input>
      <span class="md-helper-text">This is the long string of characters at the end of the Project URL in Asana</span>
    </md-field>

    <md-button v-on:click="handleSubmit" id="app-btn-submit" class="md-raised md-primary">Explore your data</md-button>
  </form>
</template>

<script>
import asana from 'asana';

export default {
  name: 'Welcome',
  data() {
    return {
      msg: 'Visualize your Asana project data',
      accessToken: '',
      projectId: '',
    };
  },
  methods: {
    handleSubmit() {
      const client = asana.Client.create().useAccessToken(this.accessToken);
      client.users.me().then(function(me) {
        const userId = me.id;
        const workspaceId = me.workspaces[0].id;
        client.tasks.findAll({
          assignee: userId,
          workspace: workspaceId,
          completed_since: 'now',
          opt_fields: 'id,name,assignee_status,completed'
        }).then(function(tasks) {
          debugger;
        });
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#app-btn-submit {
  margin-top: 30px;
  background: linear-gradient(to top right, rgba(255,82,99,0.9) 10%, rgba(255,115,129,0.9) 65%, rgba(252,189,1,0.9) 125%);
}

</style>
