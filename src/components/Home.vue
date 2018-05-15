<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-size-25"></div>
      <div class="md-layout-item">
        <md-field>
          <label for="workspace">Select a workspace</label>
          <md-select
            v-model="selectedWorkspace"
            name="selectedWorkspace"
            id="selectedWorkspace">
            <md-option
              v-for="workspace in workspaces"
              v-bind:value="workspace.id"
              v-bind:key="workspace.id">
              {{workspace.name}}
            </md-option>
          </md-select>
        </md-field>
      </div>
      <div class="md-layout-item md-size-25"></div>
    </div>

    <div class="md-layout">
      <div class="md-layout-item md-size-25"></div>
      <div class="md-layout-item">
        <md-field>
          <!-- I should be using md-autocomplate here, but
          there is an outstanding issue with the vue-material
          lib and it doesn't work.
          see: https://github.com/vuematerial/vue-material/pull/1338 -->
          <v-autocomplete
            :items="projects"
            v-model="selectedProject"
            :get-label="getLabel"
            :component-item="template"
            placeholder="Select a project"
            @update-items="updateItems"
            :min-len=0
            v-bind:value="selectedProject">
          </v-autocomplete>
        </md-field>
      </div>
      <div class="md-layout-item md-size-25"></div>
      <div>
        {{selectedProject}}
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import Asana from 'asana';
import cookie from 'js-cookie';

import AutocompleteItem from './AutocompleteItem';

export default {
  data() {
    return {
      client: {},
      workspaces: [],
      projects: [],
      selectedWorkspace: null,
      selectedProject: null,
      template: AutocompleteItem,
    };
  },
  beforeMount() {
    const token = cookie.get('token');
    if (token) {
      this.client = Asana.Client.create().useAccessToken(token);
      this.client.workspaces.findAll().then((workspaces) => {
        this.workspaces = workspaces.data;
      }, (error) => {
        if (error.status === 401) {
          window.location.replace('/');
        }
      });
    } else {
      window.location.replace('/');
    }
  },
  methods: {
    getLabel(selectedProject) {
      if (selectedProject) {
        return selectedProject.name;
      }
      return '';
    },
    fetchProjects(workspaceId) {
      this.client.projects.findByWorkspace(workspaceId).then((projects) => {
        projects.fetch(1000).then((moreProjects) => {
          this.projects = moreProjects;
        });
      });
    },
    updateItems(text) {
      this.projects = this.projects.filter(project => project.name.indexOf(text) > -1);
    },
    change(text) {
      this.updateItems(text);
    },
  },
  watch: {
    selectedWorkspace(id) {
      this.fetchProjects(id);
    },
    selectedProject(project) {
      if (!project) {
        this.fetchProjects(this.selectedWorkspace);
      } else {
        this.selectedProject = project;
      }
    },
  },
};
</script>

<style lang="scss">
  .v-autocomplete {
    .v-autocomplete-input-group {
      .v-autocomplete-input {
        cursor: pointer;
        outline: none;
        flex: 1;
        height: 32px;
        padding: 0;
        box-shadow: none;
        border: none;
        background: none;
        transition: .4s cubic-bezier(.25,.8,.25,1);
        transition-property: font-size,padding-top,color;
        line-height: 32px;
        font-size: 16px;
        width: 190%;
      }
    }
    .v-autocomplete-list {
      width: 100%;
      text-align: left;
      border: none;
      border-top: none;
      max-height: 400px;
      overflow-y: auto;
      border-bottom: 1px solid #157977;
      transition: opacity .3s cubic-bezier(.55,0,.55,.2);
      box-shadow:
        0 5px 5px -3px rgba(0,0,0,.2),
        0 8px 10px 1px rgba(0,0,0,.14),
        0 3px 14px 2px rgba(0,0,0,.12);
      min-width: 112px;
      max-width: 280px;
      max-height: 35vh;

      .v-autocomplete-list-item {
        height: auto;
        position: relative;
        z-index: 2;
        cursor: pointer;
        background-color: #fff;
        border: none;

        min-height: 48px;
        padding: 4px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: padding .4s cubic-bezier(.25,.8,.25,1);
        will-change: padding;

        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background-color: var(--md-theme-default-divider-on-background, rgba(0,0,0,0.12));
          color: var(--md-theme-default-text-primary-on-background, rgba(0,0,0,0.87))
        }
        abbr {
          opacity: 0.8;
          font-size: 0.8em;
          display: block;
          font-family: sans-serif;
        }
      }
    }
  }
</style>
