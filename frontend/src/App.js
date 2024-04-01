import { useEffect } from 'react';
import './App.css';
import Nav from './components/nav';
import useGameManager from './service/useGameManager';

function App() {
  const game = useGameManager();

  useEffect(() => {
    game.change_page("home_page");
  }, [])

  return (
    <>
      <div className='nav'>
        <Nav title={game.title}/>
      </div>
      <div className='body'>
        {game.body}
      </div>
    </>
  );
}

export default App;
