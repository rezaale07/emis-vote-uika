export default function AdminNavbar({ title, onMenu }) {
  return (
    <header className="h-16 bg-white border-b flex items-center px-4 sm:px-6">
      {/* mobile menu */}
      <button
        onClick={onMenu}
        className="md:hidden mr-3 text-xl"
      >
        ☰
      </button>

      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>
    </header>
  );
}
