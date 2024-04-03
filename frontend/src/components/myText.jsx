import { Typography } from "@mui/joy";

export default function MyText({isInNav, title, bold, color, small, ...props}) {
  const sx = { color: color ? color : isInNav ? '' : 'black', fontWeight: bold ? 'bold' : 'normal', fontSize: title ? '3.5em' : 'auto', ...props.sx };

  return(
    <Typography level="h1" {...props} sx={sx}>
      {props.children}
    </Typography>
  )
}
