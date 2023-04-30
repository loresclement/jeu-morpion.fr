import ErrorLogo from '../../resources/pictures/error.png'

function Error()
{
    return(
        <div className="error-page-container">
            <img src={ErrorLogo} width="50"/>
            <h1>Oops !</h1>
            <h4>Le serveur ne semble pas être actif, réessayer plus tard ou contacter : <a href="mailto:contact@clement-lores.fr">Clément LORES</a></h4>
        </div>
    )
}

export default Error;