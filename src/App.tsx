import * as Fiber from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'
import * as ttt from "./tic-tac-toe";

const MESH_SCALE = 1.0

function initialGame(): ttt.GameState {
  let initialGameState = ttt.createGame()
  // initialGameState = ttt.makeMove(initialGameState, 3)
  // initialGameState = ttt.makeMove(initialGameState, 0)
  return initialGameState
}

type Message =
  | { type: 'CLICKED_BOX', idx: number }

function onMessage(state: ttt.GameState, message: Message): ttt.GameState {
  switch (message.type) {
    case 'CLICKED_BOX':
      return ttt.makeMove(state, message.idx)
  }
}

function getMaterial(isHovered: boolean) {
  return <meshPhongMaterial color={isHovered ? 'red' : 'blue'} />
}

interface HoverableProperties {
  isHovered: boolean;
}

function Empty({ isHovered }: HoverableProperties) {
  return (
    <mesh>
      <boxGeometry args={[MESH_SCALE * 0.8, MESH_SCALE * 0.8, MESH_SCALE * 0.8]} />
      {getMaterial(isHovered)}
    </mesh>
  )
}

function Oh({ isHovered }: HoverableProperties) {
  return (
    <mesh rotation={[90, 0, 0]}>
      <cylinderGeometry args={[MESH_SCALE * 0.4, MESH_SCALE * 0.4, MESH_SCALE]} />
      {getMaterial(isHovered)}
    </mesh>
  )
}

function Ex({ isHovered }: HoverableProperties) {
  return <>
    <object3D rotation={[0, 0, 45]} >
      <mesh >
        <boxGeometry args={[MESH_SCALE * 0.2, MESH_SCALE, MESH_SCALE]} />
        {getMaterial(isHovered)}
      </mesh>
    </object3D>
    <object3D rotation={[0, 0, -45]} >
      <mesh>
        <boxGeometry args={[MESH_SCALE * 0.2, MESH_SCALE, MESH_SCALE]} />
        {getMaterial(isHovered)}
      </mesh>
    </object3D>
  </>
}

interface CellProperties {
  coord: [number, number];
  cell: ttt.Cell;
  onClickBox: (() => void) | undefined;
}
function Cell({ coord, cell, onClickBox }: CellProperties) {
  const objectRef = React.useRef<THREE.Object3D>(null);
  const [isHovered, setHovered] = React.useState(false)

  Fiber.useFrame((_, delta) => {
    // if (meshRef.current) {
    //   meshRef.current.rotation.y += delta;
    // }
  })

  const bottomLeft = [
    -MESH_SCALE * 3 / 2,
    -MESH_SCALE * 3 / 2,
  ]

  const showHover = onClickBox ? isHovered : false
  let mesh: React.ReactNode
  if (cell === 'X') {
    mesh = <Ex isHovered={showHover} />
  } else if (cell === 'O') {
    mesh = <Oh isHovered={showHover} />
  } else {
    mesh = <Empty isHovered={showHover} />
  }

  const [x, y] = coord
  return (
    <object3D
      position={[
        bottomLeft[0] + x * MESH_SCALE + 0.5 * MESH_SCALE,
        bottomLeft[1] + y * MESH_SCALE + 0.5 * MESH_SCALE,
        -5.5
      ]}
      scale={1.0}
      onPointerOver={() => onClickBox && setHovered(true)}
      onPointerOut={() => onClickBox && setHovered(false)}
      onPointerUp={onClickBox}
      ref={objectRef}
    >
      { mesh }
    </object3D>
  )
}

export default function App() {
  let [state, dispatch] = React.useReducer(onMessage, initialGame())

  const cells = []
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const idx = (2 - row) * 3 + col
      const onClickBox = ttt.canMove(state, idx)
        ? () => dispatch({type: 'CLICKED_BOX', idx })
        : undefined

      cells.push(<Cell
        coord={[col, row]}
        onClickBox={onClickBox}
        cell={state.board[idx]}
      />)
    }
  }

  return (
    <Fiber.Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 0] }}
      frameloop="always"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      { cells }
    </Fiber.Canvas>
  )
}
