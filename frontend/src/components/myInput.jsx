import Input from '@mui/joy/Input';
import './workaround.css'
export default function MyInput({label, title, value, setValue, password, style, sx, big}) {
  function handleChange(event) {
    if (big) {
      const code = event.target.value; //string from the input
      const sanitizedCode = code.replace(/[^\d]/g, '').slice(0, 5); //remove nondigits and limit length to 5
      setValue(sanitizedCode);//save the value
    }
  }

  let defaultStyle = {
    width: "60%", height: "2em", fontSize: '2.5em', borderRadius: 12, ...sx
  }

  //if the input is ment to be big (landing page)
  if (big) {
    defaultStyle = {
      ...defaultStyle,
      textAlign: 'center', //styles do not affect the <input> itself sadly
    }
  }

  //because i couldnt find a way to influence the <input> component directly in Joy UI, i use this workaround
  let workaround = big ? 'workaround' : ''

  return (
    <Input variant='plain' onChange={handleChange} sx={defaultStyle} className={workaround} value={value}/>
  )
}