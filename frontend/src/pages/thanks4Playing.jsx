import MyButton from "../components/myButton"
import useGameManager from "../service/useGameManager"

export default function Thanks4Playing() {
  const game = useGameManager()
  return (
      <div style={{height: '100%', alignContent: 'center'}}>
        <MyButton onClick={() => game.navigate('/')}>Zurück zum Menü</MyButton>
      </div>
  )
}