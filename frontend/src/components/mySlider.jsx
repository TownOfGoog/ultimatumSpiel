import Slider from "@mui/joy/Slider";
import MyText from "./myText";
import MyCoin from "./myCoin";

export default function MySlider({ value, setValue }) {
  return (
    <div style={{ width: "89%", height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'lightgray', borderRadius: 12, paddingInline: '2em' }}>
      <Slider
        value={value}
        onChange={(e) => setValue(e.target.value)}
        defaultValue={0}
        step={10}
        min={0}
        max={100}
        disabled={false}
        size="lg"
        color="neutral"
        variant="solid"
        orientation="horizontal"
        valueLabelDisplay="off"
        sx={{
          "--Slider-trackSize": "25px",
          "--Slider-thumbWidth": "3em",
          "--Slider-thumbSize": "70px",
          width: '77%',
          marginInline: '1.8em'
        }}
        slotProps={{
          thumb: { sx: { backgroundColor: "black" } },
          track: { sx: { backgroundColor: "black" } },
          input: { sx: { borderColor: "black" } },
        }}
      />

      <MyText>
        <MyCoin amount={value} />
      </MyText>
    </div>
  );
}
