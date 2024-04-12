import Button from "@mui/joy/Button";

export default function MyButton({
  shouldFillAll,
  answer,
  onClick,
  sx,
  children,
  disabled=false
}) {
  // todo: danger style
  let defaultStyle = {
    width: shouldFillAll ? "100%" : answer ? "7em" : "60%",
    height: shouldFillAll ? "100%" : "2em",
    borderRadius: 12,
    fontSize: "2.5em",
    fontWeight: "100",
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
      <Button
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
      </Button>
    </div>
  );
}
