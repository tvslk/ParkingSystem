import MainPageButtons from '../components/Buttons/MainPageButtons';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-zinc-100">
            <h1 className="text-2xl text-black text-center">
                Welcome to <span className="font-bold">ParkingSystem</span>
            </h1>
            <MainPageButtons />
        </div>
    );
}