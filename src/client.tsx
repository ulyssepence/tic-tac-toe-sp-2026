import * as React from 'react'
import * as ReactDOM from "react-dom/client"
import * as audio from "./audio"
import * as play from "./play"
import * as mail from "./mail"
import * as render from "./render"
import * as t from "./types"

export type State = {
  game: t.GameState,
  audioPlayer: audio.Player,
  mailbox: mail.Box,
}

const audioPlayer = new audio.Player('/static')
const websocketProtocol = document.location.protocol == 'http:' ? 'ws' : 'wss'
const mailbox = new mail.Box(new WebSocket(`${websocketProtocol}://${window.location.host}`))

export function initialState(): State {
  return {
    game: play.createGame(),
    audioPlayer,
    mailbox,
  }
}

function onMessage(state: State, message: t.ToClientMessage): State {
  switch (message.type) {
    case 'GAME':
      return { ...state, game: message.game }
  }
}

function View() {
  let [state, dispatch] = React.useReducer(onMessage, initialState())

  React.useEffect(() => {
    state.mailbox.receive(dispatch)
    state.mailbox.send({ type: 'GAME' })
  }, [])

  const cells = []
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const coord: t.Coord = [col, row]
      const onClickBox = play.canMove(state.game, coord)
        ? () => state.mailbox.send({ type: 'MOVE', coord: coord })
        : undefined

      cells.push(<render.Cell
        coord={[col, row]}
        onClickBox={onClickBox}
        cell={state.game.board[col][row]}
      />)
    }
  }

  return (
    <render.Scene
      winner={play.getWinner(state.game) || undefined}
      currentPlayer={state.game.currentPlayer}
      cells={cells}
    />
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <View />
  </React.StrictMode>
)
