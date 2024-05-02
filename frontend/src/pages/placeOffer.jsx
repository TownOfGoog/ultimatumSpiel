import { useState } from "react";
import MyGrid from "../components/myGrid";
import MySlider from "../components/mySlider";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";
import MyButton from "../components/myButton";
import Slider from "@mui/joy/Slider";
import MyCoin from "../components/myCoin";

export default function PlaceOffer() {
  const game = useGameManager();
  const [amountToGiveAway, setAmountToGiveAway] = useState(0);

  return !game.is_mobile() ? (
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
                setValue={(num) => {setAmountToGiveAway(num); game.dispatch({type: 'error', payload: ''})}}
              />
            </MyGrid>
          </MyGrid>
          <MyGrid xs={1}>
            <MyButton shouldFillAll onClick={() => {game.place_offer(amountToGiveAway)}}>okay</MyButton>
          </MyGrid>
        </MyGrid>
          {game.state.error && (
            <div style={{color: 'red', width: '100%'}}>{game.state.error}</div>
          )}
        {/* bottom center */}
        <MyGrid xs={5}>
          {process.env.NODE_ENV === 'development' && (
            <button onClick={() => {game.place_offer(999)}}>gebe 999 geld</button>
          )}
          <MyText sx={{textAlign: 'left'}}>
            Du bietest: <MyText bold color='red'>{amountToGiveAway}</MyText> <br/>
            Du behälst: <MyText bold color='lightGreen'>{100 - amountToGiveAway}</MyText> 
          </MyText>
        </MyGrid>
      </MyGrid>
      <MyGrid xs={1}></MyGrid>
    </MyGrid>
  )
  
  :
  
  // for mobile screens
  (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-evenly'
    }}>
      <div style={{
        width: 140, height: '80%',
        backgroundColor: 'lightgray', borderRadius: 12, 
        display: 'flex', alignItems: 'center', flexDirection: 'column'
      }}>
        <div style={{margin: '10% 5% 5% 5%'}}>100</div>
        <Slider
          value={amountToGiveAway}
          onChange={(e) => {setAmountToGiveAway(e.target.value)}}
          defaultValue={0}
          step={10}
          min={0}
          max={100}
          disabled={false}
          size="lg"
          color="neutral"
          
          variant="solid"
          orientation="vertical"
          valueLabelDisplay="auto"
          sx={{
            "--Slider-trackSize": "25px",
            "--Slider-thumbWidth": "70px",
            "--Slider-thumbSize": "3em",
            width: '77%',
            marginInline: '1.8em'
          }}
          slotProps={{
            thumb: { sx: { backgroundColor: "black" } },
            track: { sx: { backgroundColor: "black" } },
            input: { sx: { borderColor: "black" } },
          }}
        />
        <div style={{margin: '5% 5% 10% 5%'}}>0</div>
      </div>
      {/* container for text */}
      <div style={{
        width: '60%', height: '81%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '9vh'
      }}>
        <MyText sx={{textAlign: 'left'}}>Wie viel Geld möchtest du vergeben?</MyText>
        
        {game.is_mobile() && 
        <MyText sx={{textAlign: 'left'}}>{game.state.game_name}</MyText>
        }
        
        <MyText sx={{textAlign: 'left'}}>
          Du bietest: <MyText bold color='red'>{amountToGiveAway}</MyText> <br/>
          Du behälst: <MyText bold color='lightGreen'>{100 - amountToGiveAway}</MyText> 
        </MyText>

        <MyButton isCoinContainer onClick={() => {game.place_offer(amountToGiveAway)}} sx={{height:'3em', width: '9em'}}><MyCoin amount={amountToGiveAway} color='white'></MyCoin></MyButton>
      </div>
    </div>
  )
}
