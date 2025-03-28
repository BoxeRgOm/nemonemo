import React, {useState} from 'react'

const Title = ({setGameState}) => {

    return (<div classsName="title-screen">
        <h1>Nemo Nemo</h1>
        <div classsName="game-instructions">
            <h2>게임 설명 : </h2>
            <ol>
                <li>타일을 드래그해서 정사각형으로 선택해주세요. (2x2, 3x3 ~ 6x6)</li>
                <li>선택한 타일을 회전시켜서 타일을 정사각형 모양으로 맞춰주세요.</li>
                <li>정사각형으로 모인 타일들이 사라지고, 상단에서 새로운 타일들이 내려옵니다.</li>
            </ol>
            <p><strong>점수 계산식 : </strong> 2<sup>n</sup> (n: 터트린 타일의 개수)</p>
        </div>
        <button onClick={()=>{
            setGameState('playing')
        }}>Start</button>
    </div>)
}

export default Title