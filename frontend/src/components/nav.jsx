import Grid from "@mui/joy/Grid";
import logo from "../assets/logo.png"
import useGameManager from "../service/useGameManager";
import MyText from "./myText";
import MyButton from "./myButton";
import { useLocation } from "react-router-dom";

export default function Nav() {
  const game = useGameManager();
  const location = useLocation();
  return (
    <Grid container columns={{ xs: 7 }} sx={{ flexGrow: 1, bgcolor: "black", color: "white", height: "100%", flexWrap: "nowrap" }}>
      <Grid
        xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* window.innerwidth only updates on page reloads IN REACT */}
      {window.innerWidth > 600 &&
        <img
        src={logo}
        alt="Logo"
        onClick={() => {console.log(game.state); if (!game.state.code || game.state.is_host) game.navigate('/')}}
        style={{
          height: '15vw',
          maxHeight: '15vh',
          marginInline: '0.5em',
          cursor: 'pointer'
        }}
        />
      }
      </Grid>
 
      <Grid xs={5} sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: '10em'
        }}>
        <MyText isInNav title>{game.state.title}</MyText>
        {!game.is_mobile() && 
          //this text is shown somewhere else on mobile screen
          <MyText isInNav>{game.state.game_name}</MyText>
        }
      </Grid>
 
      <Grid xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
        {/* <button onClick={() => {console.log(game.state)}}>log state</button>   */}
       
          {(window.innerWidth > 600) && game.state.is_logged_in && !game.state.is_host &&
            <div style={{display: 'flex', gap: '0.5em'}}>
              <MyButton sx={{width: 'auto', paddingInline: '0.8em'}} disabled>{game.state.username}</MyButton>
              <MyButton sx={{width: 'auto', paddingInline: '0.8em'}} onClick={() => game.navigate('/logout')}>logout</MyButton>
            </div>
          }
          {(window.innerWidth > 600 || location.pathname !== '/' || location.pathname !== '/thanks4playing') && 
            <div style={{marginInline: '0.8em'}}>
              {/* if game.state.topright is text, use <MyText> */}
              {typeof game.state.top_right === 'string' && game.state.top_right !== '' ? <MyText isInNav>{game.state.top_right}</MyText> : game.state.top_right}
            </div>
          }
      </Grid>
    </Grid>
  );
}
