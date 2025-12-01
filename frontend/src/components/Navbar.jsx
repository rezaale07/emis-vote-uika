export default function Navbar({ title = "EMIS-Vote UIKA" }) {
  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <span className="text-xs text-gray-500">Powered by UIKA IT Division</span>
      </div>
    </header>
  )
}
