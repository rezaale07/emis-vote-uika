import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// ============================================================
// PREMIUM SKELETON ROW
// ============================================================
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b">
      <td className="py-4 px-2">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-8 w-24 bg-gray-200 rounded-xl"></div>
      </td>
    </tr>
  );
}

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const updateForm = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal memuat daftar mahasiswa.", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // TAMBAH MAHASISWA
  // ============================================================
  const addStudent = async () => {
    if (!form.name || !form.username || !form.password) {
      Swal.fire("Perhatian", "Nama, NPM, dan Password wajib diisi.", "warning");
      return;
    }

    try {
      await api.post("/students", form);

      setShowAdd(false);
      setForm({ name: "", username: "", email: "", password: "" });
      loadData();

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Mahasiswa berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Gagal menambahkan mahasiswa.", "error");
    }
  };

  // ============================================================
  // EDIT MAHASISWA
  // ============================================================
  const saveEdit = async () => {
    try {
      await api.put(`/students/${selectedStudent.id}`, {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password || undefined,
      });

      setShowEdit(false);
      loadData();

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data mahasiswa diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Gagal memperbarui mahasiswa.", "error");
    }
  };

  // ============================================================
  // HAPUS MAHASISWA (SweetAlert2 Confirm)
  // ============================================================
  const deleteStudent = async (student) => {
    const confirm = await Swal.fire({
      title: "Hapus Mahasiswa?",
      html: `Yakin ingin menghapus <b>${student.name}</b>?<br/>Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/students/${student.id}`);
      loadData();

      Swal.fire("Terhapus!", "Mahasiswa berhasil dihapus.", "success");
    } catch {
      Swal.fire("Error", "Gagal menghapus mahasiswa.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Manage Students" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-[16rem_1fr] gap-6 px-4 py-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="bg-white rounded-2xl border shadow-sm p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Daftar Mahasiswa
            </h2>

            <button
              onClick={() => {
                setForm({ name: "", username: "", email: "", password: "" });
                setShowAdd(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              + Tambah Mahasiswa
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b bg-gray-50">
                  <th className="py-3 text-left px-2">Nama</th>
                  <th className="py-3 text-left px-2">NPM</th>
                  <th className="py-3 text-left px-2">Email</th>
                  <th className="py-3 text-left px-2">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                      Belum ada mahasiswa.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-2">{s.name}</td>
                      <td className="px-2">{s.username}</td>
                      <td className="px-2">{s.email || "-"}</td>
                      <td className="py-3 px-2 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setForm({
                              name: s.name,
                              username: s.username,
                              email: s.email,
                              password: "",
                            });
                            setShowEdit(true);
                          }}
                          className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteStudent(s)}
                          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition shadow-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Tambah Mahasiswa" onClose={() => setShowAdd(false)}>
          <FormInput label="Nama" value={form.name} onChange={(v) => updateForm("name", v)} />
          <FormInput label="NPM" value={form.username} onChange={(v) => updateForm("username", v)} />
          <FormInput label="Email (opsional)" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput label="Password" type="password" value={form.password} onChange={(v) => updateForm("password", v)} />

          <button
            onClick={addStudent}
            className="w-full mt-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Tambah
          </button>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <Modal title="Edit Mahasiswa" onClose={() => setShowEdit(false)}>
          <FormInput label="Nama" value={form.name} onChange={(v) => updateForm("name", v)} />
          <FormInput label="NPM" value={form.username} onChange={(v) => updateForm("username", v)} />
          <FormInput label="Email (opsional)" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput label="Password (opsional)" type="password" value={form.password} onChange={(v) => updateForm("password", v)} />

          <button
            onClick={saveEdit}
            className="w-full mt-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Simpan Perubahan
          </button>
        </Modal>
      )}

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// MODAL COMPONENT
// ============================================================
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative bg-white w-96 p-6 rounded-2xl shadow-xl animate-scaleIn">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn .2s ease-out; }
        .animate-scaleIn { animation: scaleIn .25s ease-out; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { transform: scale(.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// INPUT COMPONENT
// ============================================================
function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="mt-3">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
      />
    </div>
  );
}
