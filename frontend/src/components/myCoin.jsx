import { RiCoinFill } from "react-icons/ri";
import { FaCoins } from "react-icons/fa6";
import { GiCoins } from "react-icons/gi";


export default function Coin({ amount }) {
  return (
    // below 10:
    amount < 10 ? <div/> :
    // below 40:
    amount < 40 ? <RiCoinFill /> :
    // below 70:
    amount < 70 ? <FaCoins /> :
    // below 100:
    <GiCoins />
  )
}