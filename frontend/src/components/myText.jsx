import { Typography } from "@mui/joy";
import { styled } from '@mui/material/styles';

export default function MyText({isInNav, title, bold, color, small, fontSize, ...props}) {
  const MyText = styled(Typography)(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
      fontSize: title ? 64 : fontSize ? fontSize : 32,
    },
    [theme.breakpoints.down('lg')]: {
      
      fontSize: title ? 48 : fontSize ? fontSize : 32,
      // fontSize: 16,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: title ? 48 : fontSize ? fontSize : '3vh',
    },
    textAlign: 'center',
    color: color ? color : isInNav ? 'white' : 'black',
    fontWeight: bold || title ? 'bold' : 'normal',
    ...props.sx,
  }));

  return(
    <MyText level="h1" {...props}>
      {props.children}
    </MyText>
  )
}
