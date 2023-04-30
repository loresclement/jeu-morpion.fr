function Grid({board, handleClick})
{
    return(
        <>
            <div className="game-board">
                {board.map((cell, index) => (
                    <div key={index} onClick={() => handleClick(index)} className="cell">
                    {cell === 1 ? "O" : cell === 2 ? "X" : ""}
                    </div>
                ))}
            </div>
        </>
    )
}

export default Grid;