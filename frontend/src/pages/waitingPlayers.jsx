import MyGrid from "../components/myGrid";
import { Grid } from "@mui/joy";

export default function WaitingPlayers() {
  return (
    <MyGrid container columns={3} sx={{height: '100%', flexWrap: 'nowrap'}}>
      <MyGrid xs={1} sx={{height: '100%'}}/>
      <MyGrid container xs={1} columns={1} sx={{height: '100%', width: 'auto'}}>
        <MyGrid xs={1} sx={{height: '20%'}}>
          hallo
        </MyGrid>
      </MyGrid>
      <MyGrid xs={1} sx={{height: '100%'}} />
    </MyGrid>
  )
}