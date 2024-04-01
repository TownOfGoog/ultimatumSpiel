import { useState } from "react";
import MyGrid from "../components/myGrid";
import MySlider from "../components/mySlider";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";
import Coin from "../components/myCoin";
import MyButton from "../components/myButton";

export default function Play() {
  const game = useGameManager();
  const [amountToGiveAway, setAmountToGiveAway] = useState(0);

  return (
    <MyGrid container columns={5}>
      {/* left side - gold counter */}
      <MyGrid xs={1} container columns={5}>
        {/* <MyGrid xs={5} sx={{ height: "20%", justifyContent: 'center', alignItems: 'center' }}>
          <MyText>
            Geld: <MyText bold>100</MyText>
          </MyText>
        </MyGrid> */}
      </MyGrid>

      {/* center */}
      <MyGrid xs={3} container columns={5} sx={{display: 'grid', alignItems: 'center', alignContent: 'center'}}>
        {/* top center */}
        <MyGrid
          xs={5}
          sx={{ alignItems: "flex-end", flexWrap: "nowrap" }}
        >
          <MyText>Wie viel Geld möchtest du vergeben?</MyText>
        </MyGrid>

        {/* center center */}
        <MyGrid xs={5} sx={{ height: '7em' }} container columns={5}>
          <MyGrid xs={4} container columns={5}>
            <MyGrid xs={5}>
              <MySlider
                value={amountToGiveAway}
                setValue={setAmountToGiveAway}
              />
            </MyGrid>
          </MyGrid>
          <MyGrid xs={1}>
            <MyButton shouldFillAll onClick={() => {game.place_offer(amountToGiveAway)}}>okay</MyButton>
          </MyGrid>
        </MyGrid>

        {/* bottom center */}
        <MyGrid xs={5}>
          <MyText>
            Du bietest: <MyText bold color='red'>{amountToGiveAway}</MyText> <br/>
            Du behälst: <MyText bold color='lightGreen'>{100 - amountToGiveAway}</MyText> 
          </MyText>
        </MyGrid>
      </MyGrid>
      <MyGrid xs={1}></MyGrid>
    </MyGrid>
  );
}
