import { Link } from 'react-router-dom';
import BotImg from '../../resources/pictures/bot_200px.png'
import OnlineImg from '../../resources/pictures/online_100px.png'

function Header()
{
    return(
        <>
            <header>
                <h1>Jeu du morpion</h1>
                <div className='header-btn-container'>
                    <Link to="/multiplayer">Jouer en ligne</Link>
                    <img src={OnlineImg} width="40"/>
                </div>
                <div className='header-btn-container'>
                    <Link to="/">Jouer contre l'ordinateur</Link>
                    <img src={BotImg} width="40"/>
                </div>
            </header>
            <hr/>
        </>
    )
}

export default Header