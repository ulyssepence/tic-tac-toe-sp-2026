import express from 'express'
import http from 'http'
import path  from 'path'
import * as vite from 'vite-express'
import * as ttt from './tic-tac-toe'

let state = ttt.createGame()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.resolve('assets/index.html'))
})

app.get('/game', (req, res) => {
    res.json({ result: state })
})

app.post('/move', (req, res) => {
    try {
        if (!Object.hasOwn(req.body, 'position')) {
            res.json({ type: 'ERROR', error: 'Missing position' })
        }

        state = ttt.makeMove(state, req.body.position)
    } catch (e) {
        res.json({ type: 'ERROR', error: (e as Error).message })
    }

    res.json({ type: 'SUCCESS', result: state })
})

app.use(express.static('./assets/'))

vite.listen(app, 8000, () => {
})
