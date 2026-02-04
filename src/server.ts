import express from 'express'
import http from 'http'
import path  from 'path'
import * as ws from 'ws'
import * as play from './play'
import * as t from './types'

type State = {
    game: t.GameState,
    players: ws.WebSocket[],
}

let state: State = {
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
    state.players.push(webSocket)

    webSocket.on('message', (data: any) => {
        const message: t.ToServerMessage = JSON.parse(data)


        switch (message.type) {
            case 'GAME':
                if (webSocket.readyState === ws.WebSocket.OPEN) {
                    webSocket.send(JSON.stringify({ type: 'GAME', game: state.game }))
                }
                break
            case 'MOVE':
                state.game = play.makeMove(state.game, message.coord)
                for (let player of state.players) {
                    if (player.readyState === ws.WebSocket.OPEN) {
                        player.send(JSON.stringify({ type: 'GAME', game: state.game }))
                    }
                }
                break
        }
    })
})

webServer.listen(8000, '0.0.0.0')
