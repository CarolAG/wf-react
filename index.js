'use strict'

const fs = require('fs')
const path = require('path')

const botGenerator = require('./lib/botGenerator')
const createFilesArr = require('./lib/createFilesArr')
const createHtml = require('./lib/createHtml')
const createTorrent = require('./lib/createTorrent')
const prioritizeFiles = require('./lib/prioritizeFiles')
const stringifyHtml = require('./lib/stringifyHtml')

/**
* @param {Object} options
*   assetsPath: Array          (required)
*   wfPath: String             (optional - defaults to '/wfPath')
*   seedScript: String         (optional - defaults to 'wf-seed.js')
*   htmlInput: String          (optional - defaults to 'index.html')
*   htmlOutput: String         (optional - defaults to 'wf-index.html')
*   statusBar: Boolean         (optional - defaults to true)
*
* @param {string} serverRoot - path to root folder
*/

function WebFlight (options, serverRoot) {
  Object.keys(options).forEach((key) => {
    this[key] = options[key]
  })

  this.wfPath = options.wfPath || path.join(serverRoot, '/wfPath')  // default

  // TODO: existsSync is deprecated, need alternative
  if (!fs.existsSync(this.wfPath)) {
    fs.mkdirSync(this.wfPath)
    fs.mkdirSync(path.join(this.wfPath, 'js'))
  }

  this.seedScript = options.seedScript || path.join(this.wfPath, 'js/wf-seed.js')  // default
  this.htmlInput = options.htmlInput || path.join(serverRoot, 'index.html')  // default
  this.htmlOutput = options.htmlOutput || path.join(this.wfPath, 'wf-index.html')  // non-configurable
  this.statusBar = options.statusBar || true // default

  if (!this.assetsPath) showError('assetsPath')
  if (!options) showError('options')
}

WebFlight.prototype.init = function () {
  const stringifiedHtml = stringifyHtml(this.htmlInput)

  createFilesArr(this.assetsPath)
  .then(prioritizeFiles.bind(null, this.seedScript))
  .then(createTorrent.bind(null))
  .then(createHtml.bind(null, stringifiedHtml, this.htmlOutput))
  .then(botGenerator.bind(null, this.seedScript))
}

WebFlight.prototype.redirect = function (req, res, next) {
  // Go to new wf-index.html
}

function showError (input) {
  if (input === 'options') console.error('Error: You must enter an options object')
  else console.log(`Error: WebFlight options object requires "${input}" property`)
}

module.exports = WebFlight
