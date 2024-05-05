import Input from '@mui/joy/Input';
import './workaround.css'
import FormLabel from '@mui/joy/FormLabel';
export default function MyInput({label, title, value, setValue, password=false, style, sx, big,}) {
  //if a title is given, make the label bigger, thats the only difference
  function handleChange(event) {
    if (big) {
      const code = event.target.value; //string from the input
      const sanitizedCode = parseInt(
        code.replace(/[^\d]/g, '').slice(0, 5) //remove nondigits and limit length to 5
      ); //and then parse it
      setValue(sanitizedCode || ''); //save the value + fix NaN if empty
    } else {
      setValue(event.target.value)
    }
  }

  let defaultStyle = {
    height: "2em", 
    fontSize: '2.5em', 
    borderRadius: 12, 
    width: "60%", 
    backgroundColor: 'black',
    color: 'white',
    '&:hover': {
      color: 'white', // Change color to red on hover
    },
    backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0), #aaa, rgba(0, 0, 0, 0))',
    backgroundSize: '80% 2px',
    backgroundPosition: 'bottom center',
    backgroundRepeat: 'no-repeat',
    outline: '1px solid #ffffff3b',
  // backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0), #ffffff, rgba(0, 0, 0, 0))',
    ...sx
  }

  let defaultLabelStyle = {
    fontSize: '1.2em', color: 'black', marginBottom: 0, marginLeft: '8px',
  }

  //if the input is ment to be big (landing page)
  if (big) {
    defaultStyle = {
      ...defaultStyle,
      textAlign: 'center', //styles do not affect the <input> itself sadly
    }

    defaultLabelStyle = {
      ...defaultLabelStyle,
      fontSize: '1.6em',
      alignSelf: 'center',
    }
  }

  //because i couldnt find a way to influence the <input> component directly in Joy UI, i use this workaround
  let workaround = big ? 'workaround' : ''

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'  }}>

      {/* this div is neccessary to sync the <formlabel> with the <input> */}
      <div style={{display: 'flex', flexDirection: 'column', width: '60%'}}>
        <FormLabel sx={defaultLabelStyle}>
          {title}{label}
        </FormLabel> 
      </div>
      <Input variant='plain' type={password ? 'password' : undefined} onChange={handleChange} sx={defaultStyle} className={workaround} value={value}/>
    </div>
  )
}