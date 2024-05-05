import { useState } from 'react';
import MyButton from "../components/myButton";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";
import './answerOffer.css';

export default function AnswerOffer({ amount }) {
  const game = useGameManager();
  const [skip, setSkip] = useState(false)
  const emoji = game.is_mobile(550) ?  '' : '⚠️';
  setTimeout(() => {setSkip(true)}, 2500) //2.5 seconds before user can decide.
  return (
    <div
      style={{
        width: '100%', height: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15vh', 
        boxShadow: "inset 0 0 0 1px black",
      }}
      onClick={() => {setSkip(true)}}
    >

      <MyText title={!game.is_mobile()} bold={game.is_mobile()} fontSize='4.5vh' className={!skip ? 'title' : ''}>{emoji} Handelsangebot {emoji}</MyText>

      <MyText className={!skip ? 'description' : ''}>Jemand möchte dir <MyText bold>{amount}</MyText> anbieten.</MyText>
      <div style={{
        width: '80%', 
        display: 'flex', justifyContent: 'center', gap: '5vw',
        flexDirection: !game.is_mobile() ? 'row' : 'column'
      }} className={!skip ? 'buttons' : ''}
      >
        <MyButton answer={'accept'} onClick={() => {if (skip) game.answer_offer(true)}}>Annehmen</MyButton>
        <MyButton answer={'decline'} onClick={() => {if (skip) game.answer_offer(false)}}>Ablehnen</MyButton>
      </div>
    </div>
  );
}
