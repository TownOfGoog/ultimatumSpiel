import logo from "../assets/logo.png"
import useGameManager from "../service/useGameManager";
import MyText from "./myText";
import MyButton from "./myButton";

export default function Nav() {
  const game = useGameManager();
  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: 'black',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>

      <div style={{
        position: 'absolute',
        left: '0',
        marginInline: '2vw'
      }}>
        {/* window.innerwidth only updates on page reloads IN REACT */}
        {!game.is_mobile(800) &&
          <img
          src={logo}
          alt="Logo"
          onClick={() => {console.log(game.state); if (!game.state.code || game.state.is_host) game.navigate('/')}}
          style={{
            height: '15vw',
            maxHeight: '15vh',
            cursor: 'pointer',
          }}
          />
        }
      </div>

      {/* title */}
      <div>
        <MyText isInNav title>{game.state.title}</MyText>
          {!game.is_mobile() && 
            //this text is shown somewhere else on mobile screen
            <MyText isInNav>{game.state.game_name}</MyText>
          }
      </div>

      {/* login / register buttons */}
      <div style={{
        position: 'absolute',
        right: '0',
        marginInline: '2vw'
      }}>
        {!game.is_mobile() && 
          <>
            {/* if game.state.topright is text, use <MyText> */}
            {typeof game.state.top_right === 'string' && game.state.top_right !== '' ? <MyText title isInNav>{game.state.top_right}</MyText> : game.state.top_right}
            {/* show username and logout button ONLY when user is logged in and not currently playing */}
            {game.state.is_logged_in && !game.state.code &&
              <div style={{display: 'flex', gap: '0.5em'}}>
                <MyButton sx={{width: 'auto', paddingInline: '0.8em'}} disabled>{game.state.username}</MyButton>
                <MyButton sx={{width: 'auto', paddingInline: '0.8em'}} onClick={() => game.navigate('/logout')}>logout</MyButton>
              </div>
            }
          </>
        }
      </div>
    </div>
  );
}
