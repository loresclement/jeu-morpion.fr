import '../../index.css'
import { useEffect, useState, useRef } from "react";
import Grid from '../../components/grid/index'
import pencilSound from '../../resources/audios/pencil_sound.mp3'

function Home({socket})
{
    const [stats, setStats] = useState(0)
    const [board, setBoard] = useState(Array(9).fill(null));
    const [lastMoveIsOpponent, setLastMoveIsOpponent] = useState(false);
    const [win, setWin] = useState(-1);
    const [randomValue, setRandomValue] = useState(Math.round(Math.random()));

    const audioRef = useRef(null);
    
    const handlePlay = () => {
        audioRef.current.play();
    };

    const handleClick = (index) => {
        const newBoard = [...board];

        if (!newBoard[index] && win === -1) 
        {
            newBoard[index] = 1;
            setBoard(newBoard);
            setLastMoveIsOpponent(false)
        }
    };

    const retry = () => 
    {
        setBoard(Array(9).fill(null))
        setWin(-1)
        setLastMoveIsOpponent(false)
        setRandomValue(Math.round(Math.random()))
        fetchStats()
    }

    useEffect(() => {
        if(randomValue)
            socket.emit('move', board)
    }, [randomValue])

    useEffect(() => {
        if(!board.every(cell => cell === null) && !lastMoveIsOpponent)
            socket.emit('move', board)
    }, [board])

    useEffect(() => 
    {
        socket.on("win", data => {
            setWin(data)
        }); 
    }, [socket])

    useEffect(() => {
        socket.on("new-move", data => {
            handlePlay()
            setTimeout(() => {
                const newBoard = [...board];
                newBoard[data] = 2;
                setBoard(newBoard);
                setLastMoveIsOpponent(true);
              }, 0);
        });

        return () => {
            socket.off("new-move");
        };
    }, [socket, board])

    function fetchStats()
    {
        fetch(`${process.env.REACT_APP_API}/stats`)
          .then(response => response.json())
          .then(data => setStats(data.played))
          .catch(error => console.error(error));
    }

    useEffect(() => {
        fetchStats()
    }, []);
      
    return(
        <>
            <audio ref={audioRef} src={pencilSound}/>

            <h3 className='stats-text'>{stats} parties ont été joués sur jeu-morpion.fr !</h3>
            <div className='paper-sheet'>
                <Grid board={board} handleClick={handleClick}/>

                <div className='results'>
                    {(win === 2) && (<p>L'ordinateur à gagné !</p>) }
                    {(win === 1) && (<p>Vous avez gagné !</p>) }
                    {(win === 0) && (<p>Partie nulle !</p>) }
                    {(win !== -1) && <button onClick={() => retry()} className="retry-btn">Rejouer</button>}
                </div>
            </div>
        </>
    );
};

export default Home;