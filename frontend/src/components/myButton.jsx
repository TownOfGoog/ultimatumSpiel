import Button from "@mui/joy/Button";
import { styled } from '@mui/material/styles';


export default function MyButton({
  shouldFillAll,
  answer,
  onClick,
  sx,
  children,
  disabled=false
}) {


  const MyButton = styled(Button)(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
      fontSize: "2.5em",
    },
    [theme.breakpoints.down('lg')]: {
      fontSize: "2em",
    },
    [theme.breakpoints.down('md')]: {
      fontSize: "1.2em",
    },

    borderRadius: 12,
    fontWeight: "100",


  }));

  let defaultStyle = {
    width: shouldFillAll ? "100%" : answer ? "7em" : "60%",
    height: shouldFillAll ? "100%" : "2em",
    ...(answer === "accept" && {
      backgroundColor: "lightGreen",
      "&:hover": {
        backgroundColor: "green",
      },
    }),
    ...(answer === "decline" && {
      backgroundColor: "tomato",
      "&:hover": {
        backgroundColor: "red",
      },
    }),
    ...sx,
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: shouldFillAll ? "100%" : "auto",
        height: shouldFillAll ? "100%" : "auto",
      }}
    >
      <MyButton
        onClick={onClick}
        sx={defaultStyle}
        color="neutral"
        variant="solid"
        disabled={disabled}
        slotProps={{
          button: {
            sx: {
              width: shouldFillAll ? "100%" : "auto",
              height: shouldFillAll ? "100%" : "auto",
            },
          },
        }}
      >
        {children}
      </MyButton>
    </div>
  );
}
