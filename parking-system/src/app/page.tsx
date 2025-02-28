import MainPageButtons from './components/MainPageButtons';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-zinc-100">
      <h1 className="text-3xl text-black">Welcome to <span className="font-bold">ParkingSystem</span></h1>
      <MainPageButtons />
    </div>
  );
}