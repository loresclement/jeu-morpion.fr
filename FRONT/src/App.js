import Home from './pages/home/index'
import Multiplayer from './pages/multiplayer/menu/index'
import MultiplayerGame from './pages/multiplayer/game/index'
import Header from './components/header/index'
import Footer from './components/footer/index'
import Invite from './pages/invite/index'
import { Route, Routes } from 'react-router-dom';

import io from 'socket.io-client';
const socket = io.connect(`${process.env.REACT_APP_API}`);

function App() 
{
  return (
    <>
    <Header/>
    <Routes>
      <Route exact path="/" element={<Home socket={socket}/>} />
      <Route exact path="/multiplayer/:id" element={<MultiplayerGame socket={socket}/>} />
      <Route exact path="/multiplayer" element={<Multiplayer socket={socket}/>} />
      <Route exact path="/invite/:id" element={<Invite socket={socket}/>}/>
    </Routes>
    <Footer/>
    </>
  );
}

export default App;
