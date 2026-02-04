import express from 'express'
import http from 'http'
import path  from 'path'
import ws from 'ws'
import * as play from './play'
import * as t from './types'

type State = {
    game: t.GameState,
    players: ws.WebSocket[],
}

let state = {
    game: play.createGame(),
    players: [],
}

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.resolve('static/index.html'))
})

app.use(express.static('./'))

const webServer = http.createServer(app)

const server = new ws.WebSocketServer({ server: webServer })
server.on('connection', (webSocket: ws.WebSocket) => {
    webSocket.on('message', (data) => {
        const message: t.ToServerMessage = JSON.parse(data)

        if (webSocket.readyState !== ws.OPEN) {
            return;
        }

        switch (message.type) {
            case 'GAME':
                webSocket.send(JSON.stringify({ type: 'GAME', game: state.game }))
                break
            case 'MOVE':
                state.game = play.makeMove(state.game, message.coord)
                webSocket.send(JSON.stringify({ type: 'GAME', game: state.game }))
                break
        }
    })
})

webServer.listen(8000, '0.0.0.0')
