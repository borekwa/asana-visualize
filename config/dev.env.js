'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ASANA_CLIENT_ID: '"666122422161346"',
  ASANA_REDIRECT_URI: '"http://localhost:8080/oauth-callback/"',
})
