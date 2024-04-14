import { useEffect } from 'react';
import './App.css';
import Nav from './components/nav';
import useGameManager from './service/useGameManager';
import { useLocation, useParams } from 'react-router-dom';

function App() {
  const game = useGameManager();
  const location = useLocation();
  const params = useParams();
  // useEffect(() => {
  //   game.dispatch({type: 'change_page', payload: 'home_page'})
  // }, [])

  useEffect(() => {
    console.log('new location: ', location.pathname)
    console.log('params', params)
    //for /lobby/:lobby_code need to use switch(true)
    switch (true) {
      case location.pathname === '/':
        game.dispatch({type: 'change_page', payload: 'home_page'})
        break;
      case location.pathname === '/create':
        game.dispatch({type: 'change_page', payload: 'create_game'})
        break;
      case location.pathname.includes('/lobby/'):
        console.log('joining lobby')
        //dispatch logic is handled by the join_lobby function, because it needs parameters
        game.dispatch({type: 'connect_lobby', payload: { lobby_code: parseInt(params.lobby_code) }})
        break;
      default:
        console.log('going home')
        game.dispatch({type: 'change_page', payload: 'home_page'})
        break;
    }
  }, [location])

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
