import { useEffect } from 'react';
import './App.css';
import Nav from './components/nav';
import useGameManager from './service/useGameManager';

function App() {
  const game = useGameManager();

  useEffect(() => {
    game.dispatch({type: 'change_page', payload: 'home_page'})
  }, [])

  return (
    <>
      <div className='nav'>
        <Nav/>
      </div>
      <div className='body'>
        {game.state.body}
      </div>
    </>
  );
}

export default App;
