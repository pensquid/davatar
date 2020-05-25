require('dotenv').config()

const express = require('express')
const fetch = require('node-fetch')

const app = express()
const cacheTime = 5 * 60 * 60 * 1000
const cache = {}

app.get('/', (req, res) => {
  res.send(`
Davatar
-------

Davatar is a service to find Discord avatars.
Cache time is ${cacheTime}ms

GET /:id -> a PNG image
  `.trim())
})

app.get('/:id', async (req, res) => {
  res.type('png')
  
  if (cache[req.params.id]) {
    const cached = cache[req.params.id]
    if (Date.now() - cached.time < cacheTime) {
      res.end(cached.buffer)
      return
    }
  }

  const ures = await fetch(`https://discordapp.com/api/users/${req.params.id}`, {
    headers: {
      'Authorization': `Bot ${process.env.BOT_TOKEN}`
    }
  })
  if (!ures.ok) {
    res.sendStatus(ures.status)
    return
  }
  const json = await ures.json()

  const ares = await fetch(`https://cdn.discordapp.com/avatars/${req.params.id}/${json.avatar}.png`)
  const buffer = await ares.buffer()
  
  cache[req.params.id] = {
    time: Date.now(),
    buffer
  }
  res.end(buffer)
})

app.listen(3123, () => console.log('> Listening on http://localhost:3000/'))
