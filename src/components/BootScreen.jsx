export default function BootScreen() {
  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="text-3xl font-semibold mb-6">
        Portfolio OS
      </div>

      <div className="flex gap-2">
        <span className="animate-pulse">●</span>
        <span className="animate-pulse delay-150">●</span>
        <span className="animate-pulse delay-300">●</span>
      </div>
    </div>
  );
}
