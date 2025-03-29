import React, {useState} from 'react'


const GameOver = ({setGameState, score, setScore}) => {

    return (
    <div className="game-over-screen">
        <div className="game-over-overlay"></div>
        <div className="game-over-content">
            <h2>Game Over</h2>
            <p>Your Score: {score}</p>
            <button onClick={()=>{
                setScore(0)
                setGameState('title')
            }}>Home</button>
        </div>
    </div>)
}

export default GameOver