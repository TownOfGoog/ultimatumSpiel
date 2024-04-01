import Slider from "@mui/joy/Slider";

export default function MySlider({ value, setValue }) {
  return (
    <Slider
      value={value}
      onChange={(e) => setValue(e.target.value)}
      defaultValue={0}
      step={10}
      min={0}
      max={100}
      disabled={false}
      // marks
      size="lg"
      color="neutral"
      variant="solid"
      orientation="horizontal"
      valueLabelDisplay="off"
      sx={{
        "--Slider-trackSize": "25px",
        "--Slider-thumbWidth": "50px",
        "--Slider-thumbSize": "70px",
      }}
      slotProps={{
        thumb: { sx: { backgroundColor: "black" } },
        track: { sx: { backgroundColor: "black" } },
        input: { sx: { borderColor: 'black'}}
      }}
    />
  );
}
