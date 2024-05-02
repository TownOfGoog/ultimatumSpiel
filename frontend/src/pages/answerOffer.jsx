import { useState } from 'react';
import MyButton from "../components/myButton";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";
import './answerOffer.css';

export default function AnswerOffer({ amount }) {
  const game = useGameManager();
  const [skip, setSkip] = useState(false)
  const emoji = window.innerWidth > 550 ?  '⚠️' : '';
  setTimeout(() => {setSkip(true)}, 2500) //2.5 seconds before user can decide.
  return (
    <div style={{
      width: '100%', height: window.innerWidth > 600 ? '85%' : '100%', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15vh'
    }} onClick={() => {setSkip(true)}}>

      <MyText title={window.innerWidth > 600} bold={window.innerWidth < 600} fontSize='4.5vh' className={!skip ? 'title' : ''}>{emoji} Handelsangebot {emoji}</MyText>

      <MyText className={!skip ? 'description' : ''}>Jemand möchte dir <MyText bold>{amount}</MyText> anbieten.</MyText>
      <div style={{
        width: '80%', 
        display: 'flex', justifyContent: 'center', gap: '5vw',
        flexDirection: window.innerWidth > 600 ? 'row' : 'column'
      }} className={!skip ? 'buttons' : ''}
      >
        <MyButton answer={'accept'} onClick={() => {if (skip) game.answer_offer(true)}}>Annehmen</MyButton>
        <MyButton answer={'decline'} onClick={() => {if (skip) game.answer_offer(false)}}>Ablehnen</MyButton>
      </div>
    </div>






























    // <MyGrid container columns={4} sx={{ flexGrow: 1, height: "100%" }}>
    //   {/* left margin */}
    //   <MyGrid xs={1} />

    //   {/* center */}
    //   <MyGrid
    //     container
    //     columns={4}
    //     xs={2}
    //     sx={{
    //       position: "relative",
    //       display: "flex",
    //       flexDirection: "row",
    //       alignContent: "center",
    //     }}
    //   >
    //     <MyGrid
    //       xs={5}
    //       sx={{
    //         justifyContent: "center",
    //         alignItems: "flex-start",
    //         height: "5em",
    //       }}
    //     >
    //       <MyText>⚠️ Handelsangebot ⚠️</MyText>
    //     </MyGrid>
    //     <MyGrid
    //       xs={4}
    //       sx={{
    //         height: "15em",
    //         justifyContent: "center",
    //         alignItems: "flex-start",
    //       }}
    //     >
    //       <MyText>Jemand möchte dir <MyText bold>{amount}</MyText> anbieten</MyText>
    //     </MyGrid>
    //     <MyGrid
    //       xs={2}
    //       sx={{
    //         height: "10em",
    //         justifyContent: "center",
    //         alignItems: "flex-start",
    //       }}
    //     >
    //       <MyButton answer={'accept'} onClick={() => {game.answer_offer(true)}}>Annehmen</MyButton>
    //     </MyGrid>
    //     <MyGrid
    //       xs={2}
    //       sx={{
    //         height: "10em",
    //         justifyContent: "center",
    //         alignItems: "flex-start",
    //       }}
    //     >
    //       <MyButton answer={'decline'} onClick={() => {game.answer_offer(false)}}>Ablehnen</MyButton>
    //     </MyGrid>
    //   </MyGrid>

    //   {/* right margin */}
    //   <MyGrid xs={1} />
    // </MyGrid>
  );
}
