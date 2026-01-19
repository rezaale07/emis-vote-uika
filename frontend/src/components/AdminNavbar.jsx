export default function AdminNavbar({ title, subtitle, onMenu }) {
  return (
    <header className="bg-white border-b">
      {/* ✅ samakan dengan konten: max-w-7xl */}
      <div className="mx-auto w-full max-w-7xl px-4 h-16 flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-700"
          aria-label="Buka menu"
        >
          <span className="text-xl leading-none">☰</span>
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-base sm:text-lg font-semibold text-gray-900">
            {title}
          </h2>

          {subtitle ? (
            <p className="truncate text-xs sm:text-sm text-gray-500 -mt-0.5">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="ml-auto" />
      </div>
    </header>
  );
}
