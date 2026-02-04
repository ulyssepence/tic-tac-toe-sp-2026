import express from 'express'
import http from 'http'
import path  from 'path'
import * as game from './game'

let state = game.createGame()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.resolve('static/index.html'))
})

app.get('/game', (req, res) => {
    res.json({ type: 'SUCCESS', result: state })
})

app.post('/move', (req, res) => {
    state = game.makeMove(state, req.body.coord)
    res.json({ type: 'SUCCESS', result: state })
})

app.use(express.static('./'))

const server = http.createServer(app)
server.listen(8000, '0.0.0.0')
