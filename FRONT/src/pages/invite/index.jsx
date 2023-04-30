
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

function Invite({socket})
{
    let { id } = useParams();
    
    const [pseudo, setPseudo] = useState("")
    const [joinError, setJoinError] = useState("")
    const navigate = useNavigate();

    useEffect(() => 
    {
        const isSixDigit = id => /^\d{6}$/.test(id);

        if(!isSixDigit)
            navigate(`/`);
    }, [])

    function joinGame(event)
    {
        event.preventDefault();
        socket.emit('join-game', {pseudo, code: id})
        return false
    }

    useEffect(() => 
    {
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

    
    return(
        <>
            <h3>Vous avez été invité à rejoindre une partie !</h3>
            <form className='multiplayer-create-form multiplayer-join-form' onSubmit={(event) => joinGame(event)}>
                <input type="text" placeholder='Pseudo...' onChange={changePseudo} maxLength={15} minLength={1} required/>
                <input type="submit" value="Rejoindre une partie"/>
                <p className='join-game-error'>{joinError}</p>
            </form> 
        </>
    )
}

export default Invite;