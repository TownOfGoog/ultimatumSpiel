import { useState } from "react";
import MyButton from "../components/myButton";
import MyInput from "../components/myInput";

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')

  return (
    <div  style={{width: '100%', display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <div style={{width: '50%', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <MyInput
          label={"Benutzername"}
          value={username}
          setValue={setUsername}
        />

        <MyInput
          label={"Email"}
          value={email}
          setValue={setEmail}
        />
        
        <MyInput
        
          label={"Passwort"}
          value={password}
          setValue={setPassword}
        />
        
        <MyInput
          label={"Passwort erneut eingeben"}
          value={passwordRepeat}
          setValue={setPasswordRepeat}
        />

        <div style={{margin: '0.3em 0 0.3em 0'}}></div>

        {/* due to the programming of MyButton, i need this width: 100% div */}
        <div style={{width: '100%'}}> 
          <MyButton onClick={() => {
            fetch(`http://${process.env.REACT_APP_BACKEND_URL}/register`, {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
              },
              credentials: 'include',
              body: JSON.stringify({ name: username, email: email, password: password }),
            })
            .then((res) => {return res.text()})
            .then((message) => {console.log(message)})
            // .then((status) => {status === 200 ? console.log('registriert') : console.log('login failed')})
          
          }}>Konto eröffnen</MyButton>
        </div>
      </div>
    </div>
  )
}