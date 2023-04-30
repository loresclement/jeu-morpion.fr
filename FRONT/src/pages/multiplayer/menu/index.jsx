import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Multiplayer({socket})
{
    const [pseudo, setPseudo] = useState("")
    const [code, setCode] = useState(0);
    const [joinError, setJoinError] = useState("")
    const navigate = useNavigate();

    function createGame(event)
    {
        event.preventDefault();
        socket.emit('create-game', pseudo);
        return false
    }

    function joinGame(event)
    {
        event.preventDefault();
        
        if(pseudo !== "")
            socket.emit('join-game', {pseudo, code})
        
        return false
    }

    useEffect(() => 
    {
        socket.on('game-created', (data) => 
        {   
            navigate(`/multiplayer/${data.id}`, {
                state: { pseudo: data.pseudo }
            });
        })

        socket.on('game-joined', (data) => 
        {
            navigate(`/multiplayer/${data.code}`, {
                state: { pseudo: data.pseudo }
            });
        })

        socket.on('fail-join', (data) => 
        {
            setJoinError(data)
        })
    }, [])

    const changePseudo = (event) => {
        setPseudo(event.target.value);
    };

    const changeCode = (event) => {
        setCode(event.target.value);
    };

    return(
        <>
            <div className='multiplayer-form-container'>
                <form className='multiplayer-create-form' onSubmit={(event) => createGame(event)}>
                    <input type="text" name="pseudo" onChange={changePseudo} placeholder='Votre pseudo...' maxLength={15} minLength={1} required/>
                    <input type="submit" value="Créer une partie"/>
                </form> 

                <form className='multiplayer-create-form multiplayer-join-form' onSubmit={(event) => joinGame(event)}>
                    <input type="text" placeholder='Code de la partie...' onChange={changeCode} minLength={6} maxLength={6} required/>
                    <input type="submit" value="Rejoindre une partie"/>
                    <p className='join-game-error'>{joinError}</p>
                </form> 
            </div>
        </>
    )
}

export default Multiplayer