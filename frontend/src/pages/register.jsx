import { useState } from "react";
import MyButton from "../components/myButton";
import MyInput from "../components/myInput";
import useGameManager from "../service/useGameManager";

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const game = useGameManager()
  return (
    <div  style={{width: '100%', display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <div style={{width: '50%', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <MyInput
          label={"Benutzername"}
          value={username}
          setValue={setUsername}
        />
        
        <MyInput
          password
          label={"Passwort"}
          value={password}
          setValue={setPassword}
        />
        
        <MyInput
          password
          label={"Passwort erneut eingeben"}
          value={passwordRepeat}
          setValue={setPasswordRepeat}
        />

        <div style={{margin: '0.3em 0 0.3em 0'}}></div>

        {game.state.error && (
          <>
            <div style={{color: 'red'}}>{game.state.error}</div>
            <div style={{margin: '0.3em 0 0.3em 0'}}></div>
          </>
        )}

        {/* due to the programming of MyButton, i need this width: 100% div */}
        <div style={{width: '100%'}}> 
          <MyButton onClick={() => {

            // check if all fields are filled
            if ( !password || !passwordRepeat || !username ) {
              game.dispatch({type: 'error', payload: 'Bitte füllen Sie alle Felder aus'})
              return
            }

            // check if password and passwordRepeat are the same
            if (password !== passwordRepeat) {
              game.dispatch({type: 'error', payload: 'Passwörter stimmen nicht überein'})
              return
            }


            fetch(`/register`, {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
              },
              credentials: 'include',
              body: JSON.stringify({ name: username, password: password }),
            })
            .then((res) => {
              if (res.status !== 200) {
                res.json().then((msg) => game.dispatch({type: 'error', payload: msg}))
              } else {
                return res.json()
              }
            })
            .then((msg) => {if (msg) {
              game.dispatch({type: 'logged_in', payload: {username: msg}})
              game.navigate('/')
            }})
            .catch((err) => {
               console.error(err)})
          
          }}>Konto eröffnen</MyButton>
        </div>
      </div>
    </div>
  )
}