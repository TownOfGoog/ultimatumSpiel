import { useState } from "react"
import MyInput from "../components/myInput"
import MyButton from "../components/myButton"

export default function Loginpage() {
  const [email, setEmail] = useState('') 
  const [password, setPassword] = useState('')

  return (
    <div  style={{width: '100%', display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <div style={{width: '50%', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <MyInput
          label={"Email oder Benutzername"}
          value={email}
          setValue={setEmail}
        />

        <MyInput
          password
          label={"Passwort"}
          value={password}
          setValue={setPassword}
        /> 

        <div style={{margin: '0.3em 0 0.3em 0'}}></div>

        {/* due to the programming of MyButton, i need this width: 100% div */}
        <div style={{width: '100%'}}> 
          <MyButton onClick={() => {
            fetch(`http://${process.env.REACT_APP_BACKEND_URL}/login`, {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: email, password: password }),
            })
            .then((res) => {return res.status})
            .then((status) => {status === 200 ? console.log('logged in') : console.log('login failed')})
          }}>Anmelden</MyButton>
        </div>
      </div>
    </div>
  )
}