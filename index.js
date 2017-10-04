'use strict'
/* eslint no-console: 0 */

const io = require('socket.io-client')
const fetch = require('node-fetch')
const M = require('most')
const { reverse } = require('rambda')

//////////////////////////////////////////////////////
// Settings
//
const putteServer = 'http://46.101.178.51:1337'
const latestPutteHistory = putteServer + '/history/5'

//////////////////////////////////////////////////////
// Helpers
//

// :: FetchResult -> Json
const resToJson = res => res.json()

// unixTimeToLocale :: Int -> String
const unixTimeToLocale = unixTime => new Date(unixTime).toLocaleString()

const logMessage = ({ time, from, message }) =>
  console.log(`\n${from} @ ${unixTimeToLocale(time)} :\n${message}`)

//////////////////////////////////////////////////////
// Message stream

const putteSocket = io(putteServer)

const putteMessage$ = M.fromEvent('message', putteSocket)

//////////////////////////////////////////////////////
// History
//

const putteHistory$ = M.fromPromise(
  fetch(latestPutteHistory)
    .then(resToJson)
    .then(reverse)
).chain(M.from)

//////////////////////////////////////////////////////
// Run stuff
//

putteSocket.on('connect', () => console.log('\n< putte connected >'))
putteSocket.on('disconnect', () => console.log('\n< putte disconnected >'))

const main$ = M.concat(putteHistory$, putteMessage$)

main$.observe(logMessage).catch(console.error)
