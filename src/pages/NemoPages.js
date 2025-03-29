import React, {useState, useEffect} from 'react'

import Game from "./components/Game"
import Title from "./components/Title"
import GameOver from './components/GameOver'


const NempPage = () => {

    const [gameState, setGameState] = useState('title') /*title, playing, gameOver*/
    const [score, setScore] = useState(0)

    return (<>
        {gameState === 'title' && (<Title setGameState={setGameState}/>)}
        {gameState === 'playing' && (
            <Game gameState={gameState}
                  setGameState={setGameState}
                  score={score} 
                  setScore={setScore} />)}
        {gameState === 'gameOver' && (
            <GameOver setGameState={setGameState}
                     score={score} 
                     setScore={setScore}/>)}

    </>)
}

export default NempPage