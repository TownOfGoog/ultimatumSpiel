import { RiCoinFill } from "react-icons/ri";
import { FaCoins } from "react-icons/fa6";
import { GiCoins } from "react-icons/gi";
import MyText from "./myText";

export default function MyCoin({ amount }) {
  return (
    <MyText sx={{display: 'flex', alignItems: 'center'}}>
      {amount}
      &nbsp;
      {
        // below 10:
        amount < 10 ? (
          <div />
        ) : // below 40:
        amount < 40 ? (
          <RiCoinFill />
        ) : // below 70:
        amount < 70 ? (
          <FaCoins />
        ) : (
          // below 100:
          <GiCoins />
        )
      }
    </MyText>
  );
}
