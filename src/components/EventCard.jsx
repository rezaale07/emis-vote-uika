import { Link } from "react-router-dom";

export default function EventCard({ id, img, title, desc, date, time, quota, status }) {

  // STATUS BADGE COLOR
  const badgeColor =
    status === "ongoing"
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700"; // default upcoming

  return (
    <div className="group bg-white rounded-2xl border border-gray-100
                    shadow-sm hover:shadow-md hover:-translate-y-1
                    transition-all overflow-hidden">

      {/* IMAGE */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
        />

        {/* STATUS BADGE */}
        <span
          className={`
            absolute top-3 right-3 px-2 py-1 text-xs rounded-full font-medium shadow-sm
            ${badgeColor}
          `}
        >
          {status}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4">

        {/* TITLE */}
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {desc || "Tidak ada deskripsi."}
        </p>

        {/* INFO */}
        <div className="text-sm text-gray-500 mt-3 space-y-1">

          {/* DATE */}
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            {date || "-"}
          </div>

          {/* TIME → sembunyikan jika null */}
          {time && (
            <div className="flex items-center gap-2">
              <span className="text-base">⏰</span>
              {time}
            </div>
          )}

          {/* QUOTA → sembunyikan jika "-" */}
          {quota && quota !== "-" && (
            <div className="flex items-center gap-2">
              <span className="text-base">👥</span>
              {quota}
            </div>
          )}
        </div>

        {/* BUTTON */}
        <Link
          to={`/event/${id}`}
          className="
            mt-4 block text-center bg-blue-600 hover:bg-blue-700
            text-white py-2 rounded-xl font-medium transition
          "
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
