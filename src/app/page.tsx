export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">
          SQLA Visitor Management
        </h1>
        <p className="text-xl mb-8 text-gray-300">
          Welcome to Squeak E. Clean Studios
        </p>
        <div className="space-y-4">
          <button className="w-full bg-white text-black py-4 px-8 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors">
            Start Registration
          </button>
          <div className="flex gap-4">
            <button className="flex-1 border border-white py-3 px-6 rounded-lg text-lg hover:bg-white hover:text-black transition-colors">
              English
            </button>
            <button className="flex-1 border border-white py-3 px-6 rounded-lg text-lg hover:bg-white hover:text-black transition-colors">
              Español
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
