import './App.css';
import Nav from './components/nav';
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
      <button>TsdfsdfES!! ?</button>
    </>
  );
}

export default App;
