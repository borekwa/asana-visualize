<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-size-25"></div>
      <div class="md-layout-item app-main-form">
        <img src="../assets/logo.png">
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
            <md-field v-show="projects.length > 0">
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
        </div>
      </div>
      <div class="md-layout-item md-size-25"></div>
    </div>

    <div v-show="selectedProject">
      <div class="md-layout">
        <md-card class="md-layout-item md-size-20 chart-option-menu">
          <md-card-header>
            <div class="md-title">Y-Axis Values</div>
          </md-card-header>
          <md-card-content>
            <md-field>
              <label for="workspace">Aggregate</label>
              <md-select v-model="selectedYField" disabled>
                <md-option value="tasks">Tasks</md-option>
                <md-option>Custom field 1</md-option>
                <md-option>Custom field 1</md-option>
              </md-select>
            </md-field>
            <md-field>
              <label for="workspace">Aggregation Method</label>
              <md-select v-model="selectedAggregation" disabled>
                <md-option value="count">Count</md-option>
                <md-option>Sum</md-option>
                <md-option>Average</md-option>
              </md-select>
            </md-field>
          </md-card-content>
        </md-card>

        <md-card class="md-layout-item chart-container">
          <canvas id="app-chart"></canvas>
        </md-card>

        <md-card class="md-layout-item md-size-20 chart-option-menu">
          <md-card-header>
            <div class="md-title">Options</div>
          </md-card-header>

          <md-card-content>
            <md-field>
              <label for="workspace">Group by</label>
              <md-select value="groupByFields[0].custom_field.name" v-model="selectedGroupByField">
                <md-option
                  v-for="groupByField in groupByFields"
                  v-bind:key="groupByField.id"
                  v-bind:value="groupByField.custom_field.name">
                  {{ groupByField.custom_field.name }}
                </md-option>
              </md-select>
            </md-field>
          </md-card-content>
        </md-card>
      </div>

      <div class="md-layout">
        <div class="md-layout-item md-size-20 chart-option-menu"></div>
        <md-card class="md-layout-item x-axis-options">
          <md-card-header>
            <div class="md-title">X-Axis Values</div>
          </md-card-header>

          <md-card-content>
            <md-field>
              <label for="workspace">Attribute</label>
              <md-select v-model="selectedXField">
                <md-option value="createdAt">Created At</md-option>
                <md-option value="completedAt">Completed At</md-option>
                <md-option value="dueDate">Due Date</md-option>
              </md-select>
            </md-field>
          </md-card-content>

        </md-card>
        <div class="md-layout-item md-size-20 chart-option-menu"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import Asana from 'asana';
import Chart from 'chart.js';
import moment from 'moment';
import cookie from 'js-cookie';

import AutocompleteItem from './AutocompleteItem';

export default {
  data() {
    return {
      client: {},
      workspaces: [],
      projects: [],
      tasks: [],
      selectedWorkspace: null,
      selectedProject: null,
      selectedYField: 'tasks',
      selectedXField: 'completedAt',
      selectedAggregation: 'count',
      template: AutocompleteItem,
      groupByFields: [],
      selectedGroupByField: '',
      datasets: [],
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
    renderChart() {
      const ctx = document.getElementById('app-chart').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: this.chartData.datasets,
        },
        options: {
          scales: {
            xAxes: [{
              time: {
                unit: 'week',
              },
              gridLines: {
                display: false,
              },
            }],
            yAxes: [{
              stacked: true,
            }],
          },
        },
      });
    },
    updateChart() {
      this.chart.data.labels = this.chartData.labels;
      this.chart.data.datasets = this.chartData.datasets;
      this.chart.update();
    },
    updateChartData() {
      let tasks = [];
      if (this.selectedXField === 'createdAt') {
        tasks = this.tasks.map((task) => {
          return {
            date: task.created_at,
            customFields: task.custom_fields,
          };
        });
      } else if (this.selectedXField === 'completedAt') {
        tasks = this.tasks.map((task) => {
          return {
            date: task.completed_at,
            customFields: task.custom_fields,
          };
        });
      } else if (this.selectedXField === 'dueDate') {
        tasks = this.tasks.map((task) => {
          return {
            date: task.due_on,
            customFields: task.custom_fields,
          };
        });
      }

      this.groupByFields.forEach((field) => {
        if (field.custom_field.name === this.selectedGroupByField) {
          field.custom_field.enum_options.forEach((option) => {
            const dataset = {
              label: option.name,
              data: [],
              backgroundColor: option.color,
            };
            this.datasets.push(dataset);
          }, this);
        }
      }, this);

      tasks.sort((a, b) => {
        if (a.date && b.date) {
          return new Date(a.date) - new Date(b.date);
        }
        return 0;
      });

      const roundedDates = [];
      const taskCounts = [];
      this.datasets = [{
        label: 'NULL',
        data: [],
        backgroundColor: '#313131',
      }];
      tasks.forEach((task) => {
        if (task.date) {
          const week = moment(task.date).startOf('week').format('MM/DD/YY');
          if (!roundedDates.includes(week)) {
            roundedDates.push(week);
            if (this.selectedGroupByField === '') {
              taskCounts.push(1);
            } else {
              task.customFields.forEach((field) => {
                if (field.name === this.selectedGroupByField) {
                  console.log(field.enum_value);
                  if (field.enum_value) {
                    this.datasets.forEach((dataset) => {
                      if (dataset.label === field.name) {
                        dataset.data.push(1);
                      }
                    });

                    // let matchingDataset = this.datasets.filter(dataset => {
                    //   return dataset.label === field.name;
                    // });
                    // debugger;
                    // if (matchingDataset[0]) {
                    //   this.datasets[0].data.push(1);
                    // }
                  }
                }
              }, this);
            }
          } else {
            const index = roundedDates.indexOf(week);
            if (this.selectedGroupByField === '') {
              taskCounts[index] += 1;
            } else {
              task.customFields.forEach((field) => {
                if (field.name === this.selectedGroupByField) {
                  if (field.enum_value) {
                    this.datasets.forEach((dataset) => {
                      if (dataset.label === field.name) {
                        dataset.data[index] += 1;
                      }
                    });
                    // this.datasets.filter(dataset => {
                    //   return dataset.label === field.name
                    // });
                    
                    // this.datasets[0].data[index] += 1;
                  }
                }
              }, this);
            }
          }
        }
      }, this);

      if (this.selectedGroupByField === '') {
        this.datasets = [{
          label: '# of tasks',
          data: taskCounts,
          backgroundColor: '#ff5263',
        }];
      }

      debugger;

      this.chartData = {
        labels: roundedDates,
        datasets: this.datasets,
      };
    },
    fetchTasks(projectId) {
      this.client.tasks.findAll({
        project: projectId,
        opt_fields: 'created_at,completed,completed_at,due_on,custom_fields,name,notes',
      }).then((tasks) => {
        tasks.fetch(1000).then((moreTasks) => {
          this.tasks = moreTasks;
          this.updateChartData();
          if (this.chart) {
            this.updateChart();
          } else {
            this.renderChart();
          }
        });
      });
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
        this.fetchTasks(project.id);
        this.client.customFieldSettings.findByProject(project.id)
          .then((customFieldSettings) => {
            this.groupByFields = customFieldSettings
              .filter(customFieldSetting => customFieldSetting.custom_field.type === 'enum');
          });
      }
    },
    selectedXField(dateField) {
      this.selectedXField = dateField;
      this.updateChartData();
      this.updateChart();
    },
    selectedGroupByField(groupByField) {
      this.selectedGroupByField = groupByField;
      this.updateChartData();
      this.updateChart();
    },
  },
};
</script>

<style lang="scss">
.app-main-form {
  text-align: center;
}

.chart-container,
.chart-option-menu,
.x-axis-options {
  margin: 0 10px;
}

.x-axis-options {
  margin-top: 20px;
}

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
