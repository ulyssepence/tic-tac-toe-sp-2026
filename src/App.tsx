import * as Fiber from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'
import * as shader from "./shader";
import * as ttt from "./tic-tac-toe";

const MESH_SCALE = 1.0

type Message =
  | { type: 'RECEIVED_GAME_STATE', game: ttt.GameState }

function onMessage(state: ttt.GameState, message: Message): ttt.GameState {
  switch (message.type) {
    case 'RECEIVED_GAME_STATE':
      return message.game
  }
}

function getMaterial(isHovered: boolean) {
  return <meshPhongMaterial color={isHovered ? 'green' : 'white'} />
}

interface HoverableProperties {
  isHovered: boolean;
  materialOverride?: React.ReactNode;
}

function EmptyMesh({ isHovered, materialOverride }: HoverableProperties) {
  return (
    <mesh>
      <boxGeometry args={[MESH_SCALE * 0.8, MESH_SCALE * 0.8, MESH_SCALE * 0.2]} />
      {materialOverride || getMaterial(isHovered)}
    </mesh>
  )
}

function OhMesh({ isHovered, materialOverride }: HoverableProperties) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[MESH_SCALE * 0.4, MESH_SCALE * 0.4, MESH_SCALE * 0.2]} />
      {materialOverride || getMaterial(isHovered)}
    </mesh>
  )
}

function ExMesh({ isHovered, materialOverride }: HoverableProperties) {
  return <>
    <object3D rotation={[0, 0, 45]} >
      <mesh >
        <boxGeometry args={[MESH_SCALE * 0.2, MESH_SCALE, MESH_SCALE * 0.2]} />
        {materialOverride || getMaterial(isHovered)}
      </mesh>
    </object3D>
    <object3D rotation={[0, 0, -45]} >
      <mesh>
        <boxGeometry args={[MESH_SCALE * 0.2, MESH_SCALE, MESH_SCALE * 0.2]} />
        {materialOverride || getMaterial(isHovered)}
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
  })

  const bottomLeft = [
    -MESH_SCALE * 3 / 2,
    -MESH_SCALE * 3 / 2,
  ]

  const showHover = onClickBox ? isHovered : false
  let mesh: React.ReactNode
  if (cell === 'X') {
    mesh = <ExMesh isHovered={showHover} />
  } else if (cell === 'O') {
    mesh = <OhMesh isHovered={showHover} />
  } else {
    mesh = <EmptyMesh isHovered={showHover} />
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
  let [state, dispatch] = React.useReducer(onMessage, ttt.createGame())

  React.useEffect(() => {
    fetch('/game', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(async resp => {
      const resp_: ttt.Response = await resp.json()
      if (resp_.type === 'SUCCESS') {
        dispatch({ type: 'RECEIVED_GAME_STATE', game: resp_.result })
      }
    })
  }, [])

  const makeMoveRemote = async (position: number) => {
    fetch('/move', { 
      method: 'POST', 
      body: JSON.stringify({ position }) ,
      headers: { 'Content-Type': 'application/json' },
    }).then(async resp => {
      const resp_: ttt.Response = await resp.json()
      if (resp_.type === 'SUCCESS') {
        dispatch({type: 'RECEIVED_GAME_STATE', game: resp_.result })
      }
    })
  }

  const cells = []
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const idx = (2 - row) * 3 + col
      const onClickBox = ttt.canMove(state, idx)
        ? () => makeMoveRemote(idx)
        : undefined

      cells.push(<Cell
        coord={[col, row]}
        onClickBox={onClickBox}
        cell={state.board[idx]}
      />)
    }
  }

  const winner = ttt.getWinner(state)
  const playerMaterial = winner == null
    ? <meshPhongMaterial color={'red'} />
    : <meshPhongMaterial color={'blue'} />
  const playerTurn =
    <object3D
      scale={[5, 5, 1]}
      position={[0, 5, -10]}
    >
      { (winner && winner == 'X') || state.currentPlayer === 'X'
        ? <ExMesh isHovered={false} materialOverride={playerMaterial} />
        : <OhMesh isHovered={false} materialOverride={playerMaterial} />
      }
  </object3D>

  const postProcessor = `
      float period_secs = 45.0;
      float band_size = 0.003;
      float band = mod(uv.y, band_size);
      float direction = band < (band_size / 2.0) ? 1.0 : -1.2;

      vec3 original = scene(uv);
      if (original.x == 0.0 && original.y == 0.0 && original.z == 0.0) {
        // uv = (uv + triangle(floor_to_nearest(uv.y, band_size / 4.0)) * 6.28) * 3.0;
        uv = uv * 3.0;
        color = vec3(
          scene(vec2(direction * t / period_secs, 0.0) + uv + voronoi_noise(t / 4.0 + uv *  10.0) * 0.02).x,
          scene(vec2(direction * t / period_secs, 0.0) + uv - voronoi_noise(t / 4.0 + uv *  10.0) * 0.01).y,
          scene(vec2(direction * t / period_secs, 0.0) + uv - voronoi_noise(t / 4.0 + uv * 100.0) * 0.01).z
        ) * 0.05;
      } else {
        color = vec3(
          scene(uv + voronoi_noise(t / 4.0 + uv * 10.0) * 0.02).x,
          scene(uv - voronoi_noise(t / 4.0 + uv * 10.0) * 0.01).y,
          scene(uv - voronoi_noise(t / 4.0 + uv * 100.0) * 0.01).z
        );
      }
  `;

  return (
    <Fiber.Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 0] }}
      frameloop="always"
    >
      <shader.GLSLShader code={postProcessor}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        { cells }
        { playerTurn }
      </shader.GLSLShader>
    </Fiber.Canvas>
  )
}
