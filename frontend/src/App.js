import { useEffect } from 'react';
import './App.css';
import Nav from './components/nav';
import useGameManager from './service/useGameManager';
import { useLocation, useParams } from 'react-router-dom';

function App() {
  const game = useGameManager();
  const location = useLocation();
  const params = useParams();
  useEffect(() => {
    console.log("HALLLOOOOOOOOOOOOOOOO")
    //check if user is logged in
    fetch(`http://${process.env.REACT_APP_BACKEND_URL}/check_login`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    }).then((res) => {
      console.log('NACHRICHT BEKOMENNNNNNNNNNNNNNNNNNNNNNN');
      if (res.status === 200) {
        res.json().then((msg) => {
          game.dispatch({type: 'logged_in', payload: {username: msg}})
        })
      }
    }).catch((err) => {})
  }, [])

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
        game.dispatch({type: 'connect_lobby', payload: { lobby_code: parseInt(params.lobby_code) }})
        break;
      case location.pathname === '/login':
        game.dispatch({type: 'change_page', payload: 'login_page'})
        break;
      case location.pathname === '/logout':
        fetch(`http://${process.env.REACT_APP_BACKEND_URL}/logout`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
        }).then((res) => {
          if (res.status !== 200) {
            res.json().then((msg) => game.dispatch({type: 'error', payload: msg}))
          } else {
            game.dispatch({type: 'logout'})
            game.navigate('/')
          }
        })
        break;
      case location.pathname === '/register':
        game.dispatch({type: 'change_page', payload: 'register_page'})
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
