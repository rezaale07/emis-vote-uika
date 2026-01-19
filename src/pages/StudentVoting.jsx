import { useEffect, useState } from "react";
import { getVotings, checkUserVote } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function StudentVoting() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("user_id"));

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await getVotings();
        const list = res.data || [];

        const withStatus = await Promise.all(
          list.map(async (v) => {
            try {
              const check = await checkUserVote(v.id, userId);
              return {
                ...v,
                hasVoted: check.data?.voted ?? false,
              };
            } catch {
              return { ...v, hasVoted: false };
            }
          })
        );

        setVotings(withStatus);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Tidak dapat memuat daftar voting.",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  // ======================== LOADING ========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse space-y-3 w-64">
          <div className="h-6 bg-slate-300 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // ======================== UI ========================
  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      <StudentNavbar />

      <Container className="py-8 md:py-10">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-500 uppercase">
            EMIS-Vote UIKA
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            Voting Kampus
          </h1>
          <p className="mt-2 text-slate-600 max-w-xl text-sm md:text-base">
            Ikuti voting yang tersedia atau lihat hasil voting yang sudah kamu ikuti.
          </p>
        </div>

        {votings.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-500 shadow-sm">
            <p className="font-medium">Belum ada voting tersedia</p>
          </div>
        )}

        <div className="space-y-6">
          {votings.map((v) => {
            const isActive = v.status === "active";
            const isClosed = v.status === "closed";
            const hasVoted = v.hasVoted;

            const handleClick = () => {
              if (hasVoted) {
                navigate(`/student/voting/${v.id}/results`);
                return;
              }

              if (isActive) {
                navigate(`/student/voting/${v.id}`);
                return;
              }

              Swal.fire({
                icon: "info",
                title: "Voting Tidak Aktif",
                text:
                  v.status === "draft"
                    ? "Voting ini belum dibuka."
                    : "Voting telah ditutup.",
                confirmButtonColor: "#2563eb",
              });
            };

            return (
              <div
                key={v.id}
                onClick={handleClick}
                className={[
                  "bg-white rounded-2xl border shadow-sm p-5 md:p-7 flex flex-col md:flex-row justify-between gap-5 transition",
                  (isActive || hasVoted) &&
                    "cursor-pointer hover:shadow-md hover:-translate-y-[2px]",
                  isClosed && !hasVoted && "opacity-80",
                ].join(" ")}
              >
                {/* LEFT */}
                <div className="flex items-start gap-4">
                  {v.poster_url ? (
                    <img
                      src={v.poster_url}
                      alt="poster"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-dashed">
                      No Poster
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                      {v.title}
                    </h2>

                    {v.description && (
                      <p className="mt-1 text-xs md:text-sm text-slate-600 line-clamp-2">
                        {v.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] md:text-xs text-slate-600">
                      {v.start_date && (
                        <span className="px-3 py-1 rounded-full bg-slate-100">
                          Mulai: {formatDate(v.start_date)}
                        </span>
                      )}
                      {v.end_date && (
                        <span className="px-3 py-1 rounded-full bg-slate-100">
                          Selesai: {formatDate(v.end_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={[
                      "px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full border",
                      hasVoted
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-300",
                    ].join(" ")}
                  >
                    {hasVoted ? "SUDAH VOTING" : v.status.toUpperCase()}
                  </span>

                  {hasVoted && (
                    <span className="text-[11px] md:text-xs font-medium text-blue-600">
                      Lihat hasil voting →
                    </span>
                  )}

                  {!hasVoted && isActive && (
                    <span className="text-[11px] md:text-xs font-medium text-blue-600">
                      Ikuti voting →
                    </span>
                  )}

                  {isClosed && !hasVoted && (
                    <span className="text-[11px] md:text-xs text-slate-500">
                      Voting telah ditutup
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      <footer className="text-center text-[11px] text-slate-400 border-t py-4 mt-8">
        © UIKA IT Division
      </footer>
    </div>
  );
}
