import React, {useState, useRef, useEffect} from 'react'

const GAME_DURATION = 120;
const ROWS = 10
const COLS = 6
const CELL_SIZE = window.innerWidth <= 768 ? 30 : 50
const CANVAS_MARGIN = window.innerWidth <= 768 ? 30 : 50 ;

const COLORS = ['#ffdad1','#fffdda','#cab3c1','#6e7b8f']

const SELECTING_COLOR = 'red';
const SELECTED_COLOR = 'red';
const LINE_COLOR = '#2e3332';
const BG_COLOR = '#2e3332';

const SELECT_LINE_WIDTH = window.innerWidth <= 768 ? 3 : 1;
const GRID_LINE_WIDTH = window.innerWidth <= 768 ? 2 : 0.5;

const Game = ({gameState, setGameState, score, setScore}) => {

    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)

    const [grid, setGrid] = useState([]);
    const [selectedTiles, setSelectedTiles] = useState([]);

    const [startTile, setStartTile] = useState(null)

    const [startX, setStartX] = useState(null)
    const [startY, setStartY] = useState(null)

    const [isSelecting, setIsSelecting] = useState(false)
    const [isRotatig, setIsRotatig] = useState(false)

    const [rotationAngle, setRotationAngle] = useState(0)
    const [rotationCenter, setRotationCenter] = useState({x:0, y:0})

    const [lastMousePosition, setLastMousePosition] = useState(null)
    const [isAnimation, setIsAnimation] = useState(false)

    const canvasRef = useRef(null);

    useEffect(()=>{
        
        console.log('Game')
    },[])

    useEffect(()=>{

        if(gameState === 'playing'){

            const timer = setInterval(()=>{
                setTimeLeft(
                    (prevTime)=>{
                        if (prevTime <= 1){
                            clearInterval(timer)
                            setGameState('gameOver')
                            return 0;
                        }
                        return prevTime - 1
                    }
                )
            },1000)

            return ()=>{
                return clearInterval(timer)
            }
        }
    },[gameState])

    useEffect(()=>{
        if(gameState === 'playing'){
            initGame();
        }
    },[gameState])

    useEffect(()=>{
        if(gameState === 'playing' &&
            grid.length > 0 &&
            canvasRef.current){

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            drawGrid(ctx, grid)
            
            if(selectedTiles.length > 0){
                
                drawSelectedArea(ctx);
                if(isRotatig){
                    drawRotatedTiles(ctx)
                }
            }
        }
    },[gameState, grid, selectedTiles, rotationAngle, score, timeLeft])


    const initGame = () => {

        setScore(0)
        setSelectedTiles([])
        setIsRotatig(false)
        setTimeLeft(GAME_DURATION);

        const getNewGrid = () => {
            const newGrid = Array(ROWS).fill().map(()=>Array(COLS).fill(null))
            for(let i = 0 ; i<ROWS ; i++){
                for(let j = 0 ; j<COLS ; j++){

                    let color;
                    do{
                        color = COLORS[Math.floor(Math.random() * COLORS.length)]
                    }while(isSquarePattern(newGrid, i, j, color))

                        
                    newGrid[i][j] = color;
                }
            }
            return newGrid;
        }

        let canInit = false;
        let newGrid = undefined;

        while(canInit === false){
            newGrid = getNewGrid()
            const _newGrid = JSON.parse(JSON.stringify(newGrid))
            canInit = getRemoveSquares(_newGrid).removes.size === 0
        }

        setGrid(newGrid)

        const canvas = canvasRef.current;
        canvas.width = COLS * CELL_SIZE + 2 * CANVAS_MARGIN
        canvas.height = ROWS * CELL_SIZE + 2 * CANVAS_MARGIN

    }


    const isSquarePattern = (grid, row, col, color) => {

        const maxSize = Math.min(ROWS, COLS)
        let sizes = []
        for (let i = 2; i < (maxSize + 1) ; i++){
            sizes.push(i)
        }

        for(let size of sizes){
            if (row >= size - 1 && col >= size -1){
                let isSquare = true;
                for(let i = row - size + 1 ; i <= row && isSquare; i++){
                    for(let j = col - size + 1 ; j <= col && isSquare ; j++){
                        if(grid[i][j] !== color){
                            isSquare = false;
                        }
                    }
                    if(isSquare){
                        return true
                    }
                }
            }
        }
        return false;
    }


    const drawGrid = (ctx, _grid) => {

        ctx.save();
        ctx.translate(CANVAS_MARGIN, CANVAS_MARGIN);

        for(let i = 0; i < ROWS ; i++){
            for(let j = 0; j < COLS ; j++){
                ctx.fillStyle = _grid[i][j];
                ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                ctx.strokeStyle = LINE_COLOR;
                ctx.lineWidth = GRID_LINE_WIDTH;
                ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            }
        }

        ctx.restore();
    }

    const drawSelectedArea = (ctx) => {

        const validSelectArea = (tiles) => {
            const row = tiles[2]-tiles[0]
            const col = tiles[3] - tiles[1]
            return row === col && 
            row !== 0 && 
            col !== 0
        }

        if (selectedTiles.length === 4){
            const [minRow, minCol, maxRow, maxCol] = selectedTiles;
            ctx.strokeStyle = validSelectArea(selectedTiles) ? SELECTED_COLOR : SELECTING_COLOR;
            ctx.lineWidth = SELECT_LINE_WIDTH;

            ctx.strokeRect(
                minCol * CELL_SIZE + CANVAS_MARGIN,
                minRow * CELL_SIZE + CANVAS_MARGIN,
                (maxCol - minCol + 1) * CELL_SIZE,
                (maxRow - minRow + 1) * CELL_SIZE)

        }
    }

    const drawRotatedTiles = (ctx) => {

        const [minRow, minCol, maxRow, maxCol] = selectedTiles;
        const centerX = (minCol + maxCol + 1) * CELL_SIZE / 2 + CANVAS_MARGIN
        const centerY = (minRow + maxRow + 1) * CELL_SIZE / 2 + CANVAS_MARGIN

        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(
            minCol * CELL_SIZE + CANVAS_MARGIN,
            minRow * CELL_SIZE + CANVAS_MARGIN,
            (maxCol - minCol + 1) * CELL_SIZE,
            (maxRow - minRow + 1) * CELL_SIZE)

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate(rotationAngle)
        ctx.translate(-centerX, -centerY)

        for(let i = minRow; i <= maxRow; i++){
            for(let j = minCol ; j <= maxCol; j++){
                const x = j * CELL_SIZE + CANVAS_MARGIN
                const y = i * CELL_SIZE + CANVAS_MARGIN

                ctx.fillStyle = grid[i][j];
                ctx.fillRect( x,y,CELL_SIZE,CELL_SIZE)

                ctx.strokeStyle = LINE_COLOR;
                ctx.strokeWidth = GRID_LINE_WIDTH;

                ctx.strokeRect(x,y,CELL_SIZE,CELL_SIZE)
            }
        }

        ctx.strokeStyle = SELECTED_COLOR;
        ctx.strokeWidth = SELECT_LINE_WIDTH;
        ctx.strokeRect(
            minCol * CELL_SIZE + CANVAS_MARGIN,
            minRow * CELL_SIZE + CANVAS_MARGIN,
            (maxCol - minCol + 1) * CELL_SIZE,
            (maxRow - minRow + 1) * CELL_SIZE)

            ctx.restore();

    }

    const getSelectedArea = (start, end) => {

        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        return [minRow, minCol, maxRow, maxCol]
    }

    const isValidSquareSelection = (selection) => {
        if(selection.length !== 4) return false;
        const [minRow, minCol, maxRow, maxCol] = selection;
        const width = maxCol - minCol + 1;
        const height = maxRow - minRow + 1;
        return width === height && width >= 2 && width <= Math.min(ROWS, COLS)
    }

    const applyRotation = () => {

        console.log('applyRotation')

        const [minRow, minCol, maxRow, maxCol] = selectedTiles;
        const size = maxRow - minRow + 1;
        const newGrid = JSON.parse(JSON.stringify(grid))
        
        let rotation = Math.round(rotationAngle / (Math.PI / 2)) % 4

        if(rotation < 0){
            rotation = rotation + 4
        }

        for (let r = 0; r < rotation ; r++) {

            const tempGrid = JSON.parse(JSON.stringify(newGrid))

            for(let i = 0; i < size ; i++){
                for(let j = 0; j < size ; j++){
                    const srcRow = minRow + i;
                    const srcCol = minCol + j;
                    const dstRow = minRow + j;
                    const dstCol = minCol + size - 1 - i;
                    newGrid[dstRow][dstCol] = tempGrid[srcRow][srcCol]
                }
            }
        }

        setGrid(newGrid)

        setRotationAngle(0)
        setStartX(null)
        setStartY(null)

        removeSquares(newGrid)

    }

    const removeSquares = (_grid) => {

        setIsAnimation(true);

        const newGrid = JSON.parse(JSON.stringify(_grid));

        const {additionalScore, removes} = getRemoveSquares(newGrid);
        const toRemove = removes;

        const time = removes.size / 2 * 100 + 300;

        toRemove.forEach( (item)=>{
            const [r,c] = item.split(',').map(Number);
            newGrid[r][c] = BG_COLOR
        });

        setScore(prevScore => prevScore + additionalScore);

        const result = dropTiles(newGrid);

        setTimeout(()=>{
            const _result = getRemoveSquares(result);

            if(_result.removes.size > 0){
                removeSquares(result)
            }else{
                setIsAnimation(false);
                setIsSelecting(false)
                setStartTile([])
                setSelectedTiles([])
            }
        }, time)

    }


    const dropTiles = (_grid) => {

        const newGrid = JSON.parse(JSON.stringify(_grid));
        const blackGrid = JSON.parse(JSON.stringify(_grid));

        let fallingTiles = []

        for(let c = 0; c < COLS ; c++){
            let emptyRow = ROWS - 1;
            for(let r = ROWS - 1; r >= 0 ; r--){
                if(newGrid[r][c] !== BG_COLOR){
                    if(r !== emptyRow){
                        fallingTiles.push({
                            fromRow: r,
                            toRow : emptyRow,
                            col : c,
                            color : newGrid[r][c],
                            currentY : r * CELL_SIZE
                        })
                        newGrid[r][c] = BG_COLOR;
                    }
                    emptyRow--;
                }
            }
        }

        for(let c = 0; c < COLS ; c++){

            let height = 0;
            
            for(let r = 0; r < ROWS; r++){
                if(newGrid[r][c] === BG_COLOR &&
                    fallingTiles.findIndex((tile)=>{
                        return tile.toRow === r && tile.col === c
                    }) === -1
                ){
                    height = height + 1;
                }
            }

            for (let r = 0; r < ROWS ; r++){

                if(newGrid[r][c] === BG_COLOR &&
                    fallingTiles.findIndex((tile)=>{
                        return tile.toRow === r && tile.col === c
                    }) === -1
                ){
                    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
                    fallingTiles.push({
                        fromRow: r - height,
                        toRow : r,
                        col : c,
                        color : color,
                        currentY : -CELL_SIZE * height
                    })
                }
            }
        }

        animateDropping(newGrid, blackGrid, fallingTiles)
        return newGrid;
    }

    const animateDropping = (newGrid, blackGrid, fallingTiles) => {

        const canvas = canvasRef.current;
        if(!canvas){
            return;
        }
        const ctx = canvas.getContext('2d');
        
        drawGrid(ctx, blackGrid);

        const animate = () => {
            
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            drawGrid(ctx,newGrid);

            let allSettled = true;

            for(let tile of fallingTiles){

                const targetY = (tile.toRow + 1) * CELL_SIZE;
                if(tile.currentY < targetY){
                    tile.currentY += 10;
                    if(tile.currentY > targetY){
                        tile.currentY = targetY;
                    }
                    allSettled = false;
                }

                ctx.fillStyle = tile.color;
                ctx.fillRect((tile.col + 1) * CELL_SIZE, tile.currentY, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = LINE_COLOR;
                ctx.strokeRect((tile.col + 1) * CELL_SIZE, tile.currentY, CELL_SIZE, CELL_SIZE)
            }

            if(allSettled){
                for(let tile of fallingTiles){
                    newGrid[tile.toRow][tile.col] = tile.color;
                }
                setGrid(newGrid)
                setIsAnimation(false)
            }else{
                requestAnimationFrame(animate)
            }

        }

        requestAnimationFrame(animate)
    }


    const getRemoveSquares = (_grid) => {

        console.log('getRemoveSquares ')

        let additionalScore = 0;
        const toRemove = new Set();

        const maxSize = Math.min(ROWS, COLS)
        let sizes = []
        for (let i = 2; i < (maxSize + 1) ; i++){
            sizes.push(i)
        }

        console.log('sizes : ')
        console.log(sizes)

        for (let i = 0; i < ROWS ; i++){
            for(let j = 0; j < COLS ; j++){
                for(let size of sizes){

                    if(i + size <= ROWS && j + size <= COLS){
    
                        const color = _grid[i][j];
                        let isSquare = true
                        
                        for(let r = i; r < i + size && isSquare ; r++){
                            for(let c = j ; c < j + size && isSquare ;  c++){
                                if(_grid[r][c] !== color){
                                    isSquare = false
                                }
                            }
                        }

                        if (isSquare){
                            for(let r = i ; r < i + size ; r++){
                                for (let c = j ; c < j + size; c++){
                                    toRemove.add(`${r},${c}`)
                                    console.log('toRemove.add')
                                }
                            }
                        }
                    }
                }
            }
        }

        console.log(toRemove)

        if(toRemove.size > 0){
            additionalScore = Math.pow(2, toRemove.size)
        }

        return {additionalScore : additionalScore,
            removes : toRemove
        }
    }


    const isInsideSelection = (tile) => {
        const [minRow, minCol, maxRow, maxCol] = selectedTiles;
        return tile.row >= minRow 
        && tile.row <= maxRow 
        && tile.col >= minCol 
        && tile.col <= maxCol;
    }


    const getTilePosition = (e) => {

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let x;
        let y;

        if(e.touches){
            x = e.touches[0].clientX - rect.left - CANVAS_MARGIN;
            y = e.touches[0].clientY - rect.top - CANVAS_MARGIN;
        }else{
            x = e.clientX - rect.left - CANVAS_MARGIN;
            y = e.clientY - rect.top - CANVAS_MARGIN;
        }


        const row = Math.floor(y / CELL_SIZE)
        const col = Math.floor(x / CELL_SIZE);

        return {
            row: row, 
            col : col
        }
    }

    const getMousePosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let x;
        let y;

        if(e.touches){
            x = e.touches[0].clientX - rect.left - CANVAS_MARGIN;
            y = e.touches[0].clientY - rect.top - CANVAS_MARGIN;
        }else{
            x = e.clientX - rect.left - CANVAS_MARGIN;
            y = e.clientY - rect.top - CANVAS_MARGIN;
        }

        return {x: x,
             y: y}
    }


    const handleMouseDown = (e) => {
        
        if(isAnimation) return;

        const tile = getTilePosition(e);

        if(isValidSquareSelection(selectedTiles) && 
            isInsideSelection(tile)){
            
            setIsRotatig(true);
            setLastMousePosition(getMousePosition(e))
            const [minRow, minCol, maxRow, maxCol] = selectedTiles;
            setRotationCenter({
                x: (minCol + maxCol + 1) * CELL_SIZE / 2,
                y: (minRow + maxRow + 1) * CELL_SIZE / 2
            })
        }else{
            setIsSelecting(true)
            setStartTile(tile);
            setSelectedTiles([]);
            setRotationAngle(0)
        }
    }

    const handleMouseMove = (e) => {
        
        const validTile = (tile) => {
            return (tile.row > -1 &&
                tile.col > -1 &&
                tile.row < ROWS &&
                tile.col < COLS)
        }

        if (isAnimation) return;

        if(isSelecting){

            const currentTile = getTilePosition(e)

            if(!validTile(startTile) || !validTile(currentTile)){
                return;
            }
            const selected = getSelectedArea(startTile, currentTile)
            setSelectedTiles(selected)

        }else if(isRotatig){

            const currentPosition = getMousePosition(e);
            if(!startX){
                setStartX(currentPosition.x)
            }
            if(!startY){
                setStartY(currentPosition.y)
            }
            
            const angle = Math.atan2(startY - rotationCenter.y, startX - rotationCenter.x)

            const newAngle = Math.atan2(currentPosition.y - rotationCenter.y, currentPosition.x - rotationCenter.x)

            setRotationAngle(newAngle - angle);
            setLastMousePosition(currentPosition)
        }
    }
    
    const handleMouseUp = (e) => {
    
        if (isAnimation) return;

        if(isSelecting){
            setIsSelecting(false)
            if(!isValidSquareSelection(selectedTiles)){
                setSelectedTiles([])
            }
        }else if (isRotatig){
            setIsRotatig(false)
            applyRotation();
        }
    }


    const renderGame = () => {
        return (
            <div className="game-screen">
                <div className="game-info">
                    <div className="score">Score: {score}</div>
                    <div className="timer">Time: {timeLeft}</div>
                </div>
                <canvas ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={(e)=>{
                            e.preventDefault()
                            handleMouseDown(e)
                        }}
                        onTouchMove={(e)=>{
                            e.preventDefault()
                            handleMouseMove(e)
                        }}
                        onTouchEnd={(e)=>{
                            e.preventDefault()
                            handleMouseUp(e)
                        }}/>

            </div>
        )
    }

    return (<div className="game-container">
        {gameState === 'playing' && renderGame()}
    </div>)
}

export default Game