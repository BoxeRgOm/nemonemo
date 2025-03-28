import React, {useState, useEffect} from 'react'

import Game from "./components/Game"
import Title from "./components/Title"
import GameOver from './components/GameOver'


const NempPage = () => {

    const [gameState, setGameState] = useState('ready')
    const [score, setScore] = useState(0)

    return (<>
        {gameState === 'ready' && (<Title setGameState={setGameState}/>)}
        {gameState === 'playing' && (
            <Game gameState={gameState}
                  setGameState={setGameState}
                  score={score} 
                  setScore={setScore} />)}
        {gameState === 'gameOver' && (<GameOver/>)}

    </>)
}

export default NempPage