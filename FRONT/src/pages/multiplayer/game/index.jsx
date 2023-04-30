import Grid from '../../../components/grid/index'
import { useEffect, useState, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom';
import pencilSound from '../../../resources/audios/pencil_sound.mp3'

function MultiplayerGame({socket})
{
    let { id } = useParams();
    const location = useLocation();
    const { pseudo } = location.state || {};
    const [link, setLink] = useState(`${window.location.hostname}/invite/${id}`)
    const [message, setMessage] = useState("")
    const [opponent, setOpponent] = useState(-1)
    const [opponentStatus, setOpponentStatus] = useState("")//clem vient d'arriver !
    const [messages, setMessages] = useState([])
    const [yourTurn, setYourTurn] = useState(false)
    const [win, setWin] = useState(-1)
    const [winStatus, setWinStatus] = useState("")//ex : Votre adversaire vous a battu !
    const [playerNumber, setPlayerNumber] = useState(0);//Tu es le joueur 1 ? 2 ? 
    const [board, setBoard] = useState(Array(9).fill(null));
    const [numberOfPlayer, setNumberOfPlayer] = useState(0)

    const audioRef = useRef(null);

    const handlePlay = () => {
        if (audioRef.current) 
            audioRef.current.play();
    };

    const handleClick = (index) => {
        const newBoard = [...board];
        
        if (!newBoard[index] && yourTurn && win == -1 && numberOfPlayer == 2) 
        {
            newBoard[index] = playerNumber;
            setBoard(newBoard);
            setYourTurn(false)
            socket.emit("new-move", {id: id, board: newBoard, pseudo})
        }
    };

    useEffect(() => 
    {
        socket.on('new-player', (data) =>
        {
            if(data.pseudo != pseudo)
            {
                setOpponent(data.pseudo)
                setOpponentStatus(`${data.pseudo} vient d'arriver !`)
            }
            
            setNumberOfPlayer(data.size)//size is the number of player in the room
        })

        socket.on('turn-changed', (data) => 
        {
            setPlayerNumber((playerNumber == 0) && ((data == pseudo) ? 1 : 2))
            setYourTurn((data == pseudo) ? true : false)
        })

        socket.on('update-board', (data) => 
        {
            setBoard(data.board);
            setYourTurn((data.pseudo == pseudo) ? false : true)
            handlePlay()
        })

        socket.on('win', (data) => 
        {
            setWin(parseInt(data));
        })

        socket.on('opponent-left', (data) => 
        {
            setOpponent("")
            setOpponentStatus(`${data.pseudo} est partie.`)
            setNumberOfPlayer(data.size)
            setBoard(Array(9).fill(null))
            setMessages([])
        })

        socket.on('restarted', () => 
        {
            setBoard(Array(9).fill(null))
            setWin(-1)
            setWinStatus("")
        })

        socket.on('received-message', (data) => 
        {
            setMessages((messages) => [data, ...messages])
        })

        socket.emit('joined', {id, pseudo})
    }, [])

    useEffect(() => 
    {
        if(win == 0)
            setWinStatus("Partie nulle")
        else if(win === playerNumber)
            setWinStatus("Vous avez gagné !")
        else if(win !== playerNumber && win !== -1)
            setWinStatus("Vous adversaire vous a vaincu !")
    },[win])

    useEffect(() => {
        return () => {
          socket.emit("leave-game", {id, pseudo})
        };
    }, []); 

    useEffect(() => 
    {
        if(numberOfPlayer == 2)
        {
            const random = Math.round(Math.random())
            socket.emit('set-turn', {pseudo: ((random) ? pseudo : opponent), id: id})
        }
    }, [numberOfPlayer])

    function retry()
    {
        socket.emit("restart", {id})
    }

    const copyToClipboard = (event) => {
        event.preventDefault();
        const copyText = event.target.previousSibling;
        copyText.select();
        document.execCommand("copy");
    };

    function sendMessage(event)
    {
        event.preventDefault()

        if(numberOfPlayer == 2)
        {
            socket.emit("send-message", {id, pseudo, content: message})
            setMessage("")
        }
        else 
        {
            alert("Attendez un adversaire avant d'envoyer un message")
        }
        return false
    }

    const assignMessage = (event) => {
        setMessage(event.target.value);
    };

    return(
        <>
            <audio ref={audioRef} src={pencilSound}/>
            <div className='invite-link-container'>
                <input type="text" value={link} readOnly style={{ flex: 1, padding: '10px' }} />
                <button onClick={copyToClipboard}>
                    Copier le lien
                </button>
            </div>
            <div className='game-info'>
                <p className='game-code'>Code de la partie : <b>{id}</b></p> 
                <Grid board={board} handleClick={handleClick}/>
                <p>{opponentStatus}</p>
                {(yourTurn && winStatus === "" && numberOfPlayer === 2) ? (<p>a toi de jouer !</p>) : ((winStatus === "" && numberOfPlayer === 2) && (<p>Ce n'est pas encore ton tour</p>))}
                <p>{winStatus}</p>
                {(winStatus !== "") && (<button onClick={() => retry()} className="retry-btn">Rejouer</button>)}
            </div>

            <div className='chat-container'>
                <form className="chat-form">
                    <textarea placeholder='Votre message...' value={message} onChange={assignMessage} name="content" onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        sendMessage(event);
                    }}}></textarea>
                    <input type="submit" value="Envoyer" onClick={(event) => sendMessage(event)}/>
                </form>

                <div className='chat-msg-container'>
                    {messages.map(message => (
                        <p key={message.timestamp}><b>{message.pseudo} : </b>{message.content}</p>
                    ))}
                </div>
            </div>
        </>
    )
}

export default MultiplayerGame