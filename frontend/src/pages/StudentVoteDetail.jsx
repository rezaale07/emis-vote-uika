import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { submitVote } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";

export default function StudentVoteDetail() {
  const { id } = useParams(); // voting_id
  const navigate = useNavigate();

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load detail voting
  useEffect(() => {
    setLoading(true);
    api
      .get(`/votings/${id}`)
      .then((res) => setVoting(res.data))
      .catch((err) => {
        console.error(err);
        setVoting(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!selectedId || !voting) return;

    const userId = Number(localStorage.getItem("user_id"));
    if (!userId) {
      alert("Sesi login Anda berakhir. Silakan login ulang.");
      return navigate("/login");
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await submitVote({
        voting_id: Number(id),
        vote_option_id: selectedId,
        user_id: userId,
      });

      // kecilin delay biar kerasa "smooth"
      setTimeout(() => {
        navigate(`/student/voting/${id}/results`);
      }, 350);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 409) {
        setErrorMsg("Anda sudah pernah memberikan suara pada voting ini.");
      } else if (err.response?.status === 422) {
        const msg =
          err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          "Voting tidak dapat diproses.";
        setErrorMsg(msg);
      } else if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Gagal mengirim suara. Coba lagi beberapa saat.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ================= LOADING & NOT FOUND =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-center space-y-3">
          <div className="h-6 w-64 bg-slate-300 rounded mx-auto" />
          <div className="h-6 w-40 bg-slate-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-16 text-center">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Voting tidak ditemukan
          </h1>
          <p className="text-slate-500 mb-6">
            Voting yang Anda cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <button
            onClick={() => navigate("/student/voting")}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            ← Kembali ke daftar voting
          </button>
        </Container>
      </div>
    );
  }

  const options = voting.options || [];
  const selectedOption = options.find((o) => o.id === selectedId);
  const isActive = voting.status === "active";

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <Container className="py-8 md:py-10">
        {/* BACK */}
        <button
          onClick={() => navigate("/student/voting")}
          className="mb-6 inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          ← Kembali ke daftar voting
        </button>

        {/* HEADER */}
        <div className="mb-8 md:mb-10">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-500 uppercase">
            Voting Kampus
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            {voting.title}
          </h1>
          {voting.description && (
            <p className="mt-2 text-slate-600 max-w-2xl text-sm md:text-base">
              {voting.description}
            </p>
          )}
        </div>

        {/* POSTER */}
        {voting.poster_url && (
          <div className="mb-10">
            <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-200 bg-slate-100">
              <img
                src={voting.poster_url}
                alt="Poster voting"
                className="w-full max-h-[320px] object-cover"
              />
            </div>
          </div>
        )}

        {/* KANDIDAT TITLE */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
            Pilih Kandidat
          </h2>
          {!isActive && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Voting tidak aktif
            </span>
          )}
        </div>

        {/* LIST KANDIDAT */}
        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;

            return (
              <button
                type="button"
                key={opt.id}
                disabled={!isActive}
                onClick={() => isActive && setSelectedId(opt.id)}
                className={[
                  "group relative text-left rounded-2xl border bg-white p-5 md:p-6 shadow-sm transition-all duration-200",
                  !isActive
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-lg",
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/40"
                    : "border-slate-200 hover:border-blue-300",
                ].join(" ")}
              >
                <div className="flex items-center gap-4 md:gap-5">
                  {/* FOTO */}
                  {opt.photo_url ? (
                    <img
                      src={opt.photo_url}
                      alt={opt.name}
                      className={[
                        "w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2",
                        isSelected
                          ? "border-blue-500 shadow-lg"
                          : "border-white shadow-md",
                      ].join(" ")}
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 flex items-center justify-center text-xl md:text-2xl font-bold text-blue-700">
                      {opt.name?.[0] || "?"}
                    </div>
                  )}

                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={[
                          "text-base md:text-lg font-semibold",
                          isSelected ? "text-blue-700" : "text-slate-900",
                        ].join(" ")}
                      >
                        {opt.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-slate-600 line-clamp-3">
                      {opt.bio || "Tidak ada deskripsi kandidat."}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 text-[11px] font-medium text-blue-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Kandidat terpilih
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ACTION BAR */}
        <div className="mt-8 md:mt-10 border-t border-slate-200 pt-6 md:pt-8">
          {errorMsg && (
            <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-slate-500">
              {selectedOption ? (
                <>
                  Anda akan memberikan suara untuk{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedOption.name}
                  </span>
                  . Pastikan pilihan Anda sudah benar.
                </>
              ) : (
                "Pilih salah satu kandidat terlebih dahulu untuk mengirim suara."
              )}
            </div>

            <button
              type="button"
              disabled={!selectedId || submitting || !isActive}
              onClick={handleVote}
              className={[
                "inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition",
                !selectedId || !isActive
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-lg",
                submitting && "opacity-80 cursor-wait",
              ].join(" ")}
            >
              {submitting
                ? "Mengirim suara..."
                : selectedOption
                ? `Kirim Suara untuk ${selectedOption.name}`
                : "Pilih Kandidat Terlebih Dahulu"}
            </button>
          </div>
        </div>
      </Container>

      <footer className="text-center text-[11px] text-slate-400 border-t py-4 mt-6">
        © UIKA IT Division — All Rights Reserved
      </footer>
    </div>
  );
}
