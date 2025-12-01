import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function VotingResults() {
  const [searchParams] = useSearchParams();
  const votingId = searchParams.get("v");

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!votingId) return;

    setLoading(true);

    api
      .get(`/votings/${votingId}`)
      .then((res) => setVoting(res.data))
      .catch((err) => console.error("Gagal load results:", err))
      .finally(() => setLoading(false));
  }, [votingId]);

  if (!votingId)
    return <div className="p-4 text-red-600">Voting ID tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Voting Results" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block"><Sidebar /></div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Hasil Voting</h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Memuat hasil...</p>
          ) : !voting ? (
            <p className="mt-4 text-red-500">Data voting tidak ditemukan.</p>
          ) : (
            <div>
              <h3 className="mt-3 text-xl font-bold">{voting.title}</h3>
              <p className="text-gray-500">{voting.description}</p>

              <div className="mt-6 space-y-4">
                {Array.isArray(voting.options) && voting.options.length > 0 ? (
                  voting.options.map((o) => (
                    <div
                      key={o.id}
                      className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between"
                    >
                      <div className="font-medium">{o.name}</div>

                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {o.votes_count ?? 0}
                        </div>
                        <div className="text-sm text-gray-500">votes</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Belum ada kandidat.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
