import MyButton from "../components/myButton";
import MyGrid from "../components/myGrid";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

export default function AnswerOffer({ amount }) {
  const game = useGameManager();

  return (
    <MyGrid container columns={4} sx={{ flexGrow: 1, height: "100%" }}>
      {/* left margin */}
      <MyGrid xs={1} />

      {/* center */}
      <MyGrid
        container
        columns={4}
        xs={2}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
        }}
      >
        <MyGrid
          xs={4}
          sx={{
            justifyContent: "center",
            alignItems: "flex-start",
            height: "5em",
          }}
        >
          <MyText title>⚠️ Handelsangebot ⚠️</MyText>
        </MyGrid>
        <MyGrid
          xs={4}
          sx={{
            height: "15em",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <MyText>Jemand möchte dir <MyText bold>{amount}</MyText> anbieten</MyText>
        </MyGrid>
        <MyGrid
          xs={2}
          sx={{
            height: "10em",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <MyButton answer={'accept'} onClick={() => {game.answer_offer(true)}}>Annehmen</MyButton>
        </MyGrid>
        <MyGrid
          xs={2}
          sx={{
            height: "10em",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <MyButton answer={'decline'} onClick={() => {game.answer_offer(false)}}>Ablehnen</MyButton>
        </MyGrid>
      </MyGrid>

      {/* right margin */}
      <MyGrid xs={1} />
    </MyGrid>
  );
}
