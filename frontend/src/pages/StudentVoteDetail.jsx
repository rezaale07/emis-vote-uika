import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { submitVote } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";
import Swal from "sweetalert2";

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const cfg =
    s === "active"
      ? {
          label: "ACTIVE",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-200/60",
          dot: "bg-emerald-500",
        }
      : s === "closed"
      ? {
          label: "CLOSED",
          cls: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-200/60",
          dot: "bg-rose-500",
        }
      : {
          label: (status || "DRAFT").toUpperCase(),
          cls: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-200/60",
          dot: "bg-slate-500",
        };

  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold",
        "border ring-1 shadow-sm whitespace-nowrap",
        cfg.cls,
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", cfg.dot].join(" ")} />
      {cfg.label}
    </span>
  );
}

function OptionCard({ ev, selected, disabled, onSelect, index }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={[
        "group w-full text-left rounded-2xl border bg-white p-4 md:p-5 shadow-sm",
        "transition-all duration-200",
        disabled ? "opacity-80 cursor-default" : "hover:shadow-md hover:-translate-y-[2px]",
        selected
          ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50/60"
          : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={
              ev.photo_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                ev.name || `Event ${index + 1}`
              )}&background=EEF2FF&color=1D4ED8`
            }
            alt={ev.name}
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border bg-slate-100"
            loading="lazy"
          />
          {selected && (
            <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-blue-600 text-white grid place-items-center text-xs shadow">
              ✓
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-slate-900 leading-snug line-clamp-2">
              {ev.name}
            </p>

            <span className="text-[11px] text-slate-500 shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {ev.bio && (
            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              {ev.bio}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span
              className={[
                "text-[11px] font-medium",
                selected ? "text-blue-700" : "text-slate-500",
              ].join(" ")}
            >
              {selected ? "Dipilih" : "Klik untuk memilih"}
            </span>

            <span
              className={[
                "text-[11px] font-semibold transition",
                selected ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600",
              ].join(" ")}
              aria-hidden
            >
              →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function StudentVoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const userId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get(`/votings/${id}`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setVoting(data);

        if (data?.has_voted && data?.voted_option_id) {
          setSelectedId(data.voted_option_id);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setVoting(null);
        Swal.fire({
          icon: "error",
          title: "Voting tidak ditemukan",
          text: "Voting yang kamu cari tidak tersedia atau terjadi kesalahan.",
          confirmButtonColor: "#2563eb",
        });
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const alreadyVoted = useMemo(
    () => Boolean(voting?.has_voted) || Boolean(voting?.voted_option_id),
    [voting]
  );

  const isActive = voting?.status === "active";
  const events = voting?.options || [];

  const metaLine = useMemo(() => {
    const start = voting?.start_date ? formatDate(voting.start_date) : null;
    const end = voting?.end_date ? formatDate(voting.end_date) : null;

    if (start && end) return `Periode: ${start} — ${end}`;
    if (start) return `Mulai: ${start}`;
    if (end) return `Selesai: ${end}`;
    return null;
  }, [voting]);

  const handleVote = async () => {
    if (alreadyVoted) {
      return Swal.fire({
        icon: "info",
        title: "Kamu sudah memilih",
        text: "Kamu sudah memberikan suara untuk voting ini.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (!isActive) {
      return Swal.fire({
        icon: "warning",
        title: "Voting tidak aktif",
        text: "Voting ini sudah ditutup. Kamu tidak bisa mengirim suara.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (!selectedId) {
      return Swal.fire({
        icon: "warning",
        title: "Belum memilih event",
        text: "Silakan pilih salah satu event terlebih dahulu.",
        confirmButtonColor: "#2563eb",
      });
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await submitVote({
        voting_id: Number(id),
        vote_option_id: selectedId,
        user_id: userId,
      });

      await Swal.fire({
        icon: "success",
        title: "Suara terkirim",
        text: "Terima kasih, pilihan kamu berhasil direkam.",
        timer: 1400,
        showConfirmButton: false,
      });

      navigate(`/student/voting/${id}/results`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengirim suara.";
      setErrorMsg(msg);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: msg,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ========================= LOADING UI =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-36 bg-slate-200 rounded-3xl" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-24 bg-slate-200 rounded-2xl" />
              <div className="h-24 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ========================= NOT FOUND =========================
  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-14 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Voting tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Voting yang kamu cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <button
            onClick={() => navigate("/student/voting")}
            className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            ← Kembali ke daftar voting
          </button>
        </Container>
      </div>
    );
  }

  // ========================= MAIN UI =========================
  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <Container className="py-7 md:py-10">
        {/* top nav */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/student/voting")}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            ← Kembali
          </button>

          <div className="flex items-center gap-2">
            {alreadyVoted && (
              <span className="hidden sm:inline-flex text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                Kamu sudah memilih
              </span>
            )}
            <StatusPill status={voting.status} />
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_55%)]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_85%_30%,white_0,transparent_50%)]" />

          <div className="relative p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.35em] text-blue-100/90">
                  EMIS-Vote UIKA
                </p>
                <h1 className="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
                  {voting.title}
                </h1>
                {voting.description && (
                  <p className="mt-2 text-sm md:text-base text-blue-50/90">
                    {voting.description}
                  </p>
                )}
                {metaLine && (
                  <p className="mt-3 text-xs text-blue-100/90">{metaLine}</p>
                )}
              </div>

              {/* mini info */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-blue-100">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {(voting.status || "-").toUpperCase()}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-blue-100">
                    Pilihan
                  </p>
                  <p className="mt-1 text-sm font-semibold">{events.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Poster */}
          {voting.poster_url && (
            <div className="bg-white">
              <div className="p-4 md:p-6">
                <div className="relative overflow-hidden rounded-3xl border bg-slate-100 shadow-sm">
                  <img
                    src={voting.poster_url}
                    alt="Voting Poster"
                    className="w-full max-h-[520px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CONTENT */}
        <section className="mt-8 md:mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                {alreadyVoted ? "Event Pilihan Kamu" : "Pilih Event"}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {alreadyVoted
                  ? "Kamu sudah memilih. Kamu tetap bisa melihat pilihanmu dan hasil voting."
                  : isActive
                  ? "Klik salah satu event untuk memilih. Kamu hanya bisa memilih satu."
                  : "Voting tidak aktif. Kamu tidak dapat mengirim suara."}
              </p>
            </div>

            {!alreadyVoted && (
              <span className="text-[11px] text-slate-500">
                {selectedId ? "1 dipilih" : "Belum memilih"}
              </span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
              Belum ada event tersedia untuk voting ini.
            </div>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 gap-4 md:gap-5">
              {events.map((ev, idx) => (
                <OptionCard
                  key={ev.id}
                  ev={ev}
                  index={idx}
                  selected={selectedId === ev.id}
                  disabled={alreadyVoted || !isActive}
                  onSelect={() => {
                    if (alreadyVoted || !isActive) return;
                    setSelectedId(ev.id);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sticky bottom action */}
        <div className="mt-10">
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="sticky bottom-4 z-10">
            <div className="rounded-3xl border bg-white/90 backdrop-blur shadow-lg p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                <p className="font-semibold text-slate-900">
                  {alreadyVoted
                    ? "Kamu sudah memberikan suara."
                    : selectedId
                    ? "Siap mengirim suara?"
                    : "Pilih event terlebih dahulu."}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {alreadyVoted
                    ? "Kamu bisa langsung melihat hasil voting."
                    : isActive
                    ? "Pastikan pilihanmu sudah benar sebelum mengirim."
                    : "Voting ini sedang tidak aktif."}
                </p>
              </div>

              {alreadyVoted ? (
                <button
                  onClick={() => navigate(`/student/voting/${id}/results`)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow"
                >
                  Lihat Hasil Voting →
                </button>
              ) : (
                <button
                  disabled={!selectedId || submitting || !isActive}
                  onClick={handleVote}
                  className={[
                    "inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold shadow transition",
                    !selectedId || submitting || !isActive
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700",
                  ].join(" ")}
                >
                  {submitting ? "Mengirim..." : "Kirim Suara"}
                </button>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 pt-10">
          © UIKA IT Division — EMIS-Vote UIKA
        </footer>
      </Container>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
