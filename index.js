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
  if (cache[req.params.id]) {
    const cached = req.params.id
    if (Date.now() - cached.time < cacheTime) {
      res.type('png')
      cached.stream.pipe(res)
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
  cache[req.params.id] = {
    time: Date.now(),
    stream: ares
  }
  res.type('png')
  ares.body.pipe(res)
})

app.listen(3000, () => console.log('> Listening on http://localhost:3000/'))