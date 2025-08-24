export default function Twitch() {
  return (
    <div className="grid h-screen grid-cols-[1fr_250px] grid-rows-[auto_1fr]">
      <div className="col-start-1 row-start-1 border bg-gray-100">
      <div className="aspect-[1512/982] w-full bg-blue-100"></div>
    </div>
      <div className="col-start-2 row-start-1 border bg-gray-100"></div>
      <div className="col-start-1 row-start-2 border bg-gray-100"></div>
      <div className="col-start-2 row-start-2 border bg-gray-100"></div>
    </div>
  );
}
