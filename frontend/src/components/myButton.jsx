import Button from "@mui/joy/Button";

export default function MyButton({
  shouldFillAll = false,
  onClick,
  sx,
  children,
}) {
  let defaultStyle = {
    width: shouldFillAll ? "100%" : "60%",
    height: shouldFillAll ? "100%" : "2em",
    fontSize: "2.5em",
    borderRadius: 12,
    fontWeight: "100",
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
