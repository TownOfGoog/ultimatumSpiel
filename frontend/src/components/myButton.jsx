import Button from '@mui/joy/Button';

export default function MyButton({onClick, sx, text}) {
  let defaultStyle = {
    width: "60%", height: "2em", fontSize: '2.5em', borderRadius: 12, fontWeight: "100", ...sx
  }
  return <Button onClick={onClick} sx={defaultStyle} color='neutral' variant='solid'>{text}</Button>
}