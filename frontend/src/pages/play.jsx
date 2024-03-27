import useGameManager from "../service/useGameManager";

export default function Play() {
  const game = useGameManager();
  return (
    <div>
      <h1>Play</h1>
    </div>
  );
}