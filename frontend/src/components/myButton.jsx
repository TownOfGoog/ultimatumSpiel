import Button from '@mui/joy/Button';

export default function MyButton({onClick, sx, children}) {
  let defaultStyle = {
    width: "60%", height: "2em", fontSize: '2.5em', borderRadius: 12, fontWeight: "100", ...sx
  }
  return (
    <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      marginTop: "1.3em",
    }}
    > 
      <Button onClick={onClick} sx={defaultStyle} color='neutral' variant='solid'>{children}</Button>
    </div>
  )
}