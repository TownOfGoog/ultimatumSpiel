import { Typography } from "@mui/joy";
import { styled } from '@mui/material/styles';

export default function MyText({isInNav, title, bold, color, small, ...props}) {
  

  const MyText = styled(Typography)(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
      fontSize: title ? 64 : props.fontSize,
    },

    color: color ? color : isInNav ? 'white' : 'black',
     fontWeight: bold || title ? 'bold' : 'normal',  ...props.sx,
    // color: 'green'
  }));
  const sx = { color: color ? color : isInNav ? 'white' : 'black', fontWeight: bold ? 'bold' : 'normal', fontSize: title ? '3.5em' : props.fontSize, ...props.sx };

  return(
    <MyText level="h1" {...props}>
      {props.children}
    </MyText>
  )
}
