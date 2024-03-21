import './App.css';
import Landinpage from './components/landingpage';
import Nav from './components/nav';
import { useContext } from 'react';
import useGameManager from './service/useGameManager';

function App() {
  const game = useGameManager()

  return (
    <>
      <div className='nav'>
        <Nav title={game.state.title}/>
      </div>
      <div className='body'>
        {game.state.body}
      </div>
    </>
  );
}

export default App;
