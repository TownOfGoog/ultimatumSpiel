import { Typography } from "@mui/joy";

export default function MyText({children, inNav, ...props}) {
  const sx = { ...props.sx, color: inNav ? '' : 'black'};

  return(
    <Typography  sx={sx} level="body-lg" {...props}>
      {children}
    </Typography>
  )
}