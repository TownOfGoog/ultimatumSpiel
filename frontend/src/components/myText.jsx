import { Typography } from "@mui/joy";

export default function MyText({isInNav, bold, color, small, ...props}) {
  const sx = { color: isInNav ? '' : color ? color : 'black', fontWeight: bold ? 'bold' : 'normal', ...props.sx };

  return(
    <Typography level="h1" {...props} sx={sx}>
      {props.children}
    </Typography>
  )
}
