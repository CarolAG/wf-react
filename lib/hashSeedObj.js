'use strict'

const _ = require('lodash')
const createTorrent = require('create-torrent')
const parseTorrent = require('parse-torrent')

function hashSeedObj (seedObj) {
  return new Promise((resolve, reject) => {
    const hashObj = _.cloneDeep(seedObj)
    const seedsArray = Object.keys(hashObj)

    seedsArray.forEach(hashSeed)

    function hashSeed (seed, index, array) {
      createTorrent(hashObj[seed].paths, (err, torrent) => {
        if (err) {
          reject(err)
          throw err
        }

        const tor = parseTorrent(torrent)
        const hash = tor.infoHash
        const filename = tor.files[0].name
        const trackers = tor.announce.map((tracker) => {
          return `tr=${tracker}`
        }).join('&')

        const magnetURI = `magnet:?xt=urn:btih:${hash}&dn=${filename}&${trackers}`

        hashObj[seed].hash = hash
        hashObj[seed].magnet = magnetURI

        if (index === array.length - 1) {
          resolve(hashObj)
        }
      })
    }
  })
}

module.exports = hashSeedObj
