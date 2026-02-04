import * as React from 'react'
import * as ReactDOM from "react-dom/client"
import * as game from "./game"
import * as render from "./render"

type Message =
  | { type: 'RECEIVED_GAME_STATE', game: game.State }

function onMessage(state: game.State, message: Message): game.State {
  switch (message.type) {
    case 'RECEIVED_GAME_STATE':
      return message.game
  }
}

function View() {
  let [state, dispatch] = React.useReducer(onMessage, game.createGame())

  React.useEffect(() => {
    fetch('/game', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(async resp => {
      const resp_: game.Response = await resp.json()
      if (resp_.type === 'SUCCESS') {
        dispatch({ type: 'RECEIVED_GAME_STATE', game: resp_.result })
      }
    })
  }, [])

  const makeMoveRemote = async (coord: game.Coord) => {
    fetch('/move', { 
      method: 'POST', 
      body: JSON.stringify({ coord }) ,
      headers: { 'Content-Type': 'application/json' },
    }).then(async resp => {
      const resp_: game.Response = await resp.json()
      if (resp_.type === 'SUCCESS') {
        dispatch({type: 'RECEIVED_GAME_STATE', game: resp_.result })
      }
    })
  }

  const cells = []
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const coord: game.Coord = [col, row]
      const onClickBox = game.canMove(state, coord)
        ? () => makeMoveRemote(coord)
        : undefined

      cells.push(<render.Cell
        coord={[col, row]}
        onClickBox={onClickBox}
        cell={state.board[col][row]}
      />)
    }
  }

  return (
    <render.Scene
      winner={game.getWinner(state) || undefined}
      currentPlayer={state.currentPlayer}
      cells={cells}
    />
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <View />
  </React.StrictMode>
);
