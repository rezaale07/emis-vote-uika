import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    username: "", // ⬅ NPM
    email: "",
    password: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const addStudent = async () => {
    if (!form.name || !form.username || !form.password) {
      alert("Nama, NPM, dan Password wajib diisi!");
      return;
    }

    try {
      await api.post("/students", form);
      setShowAdd(false);
      setForm({ name: "", username: "", email: "", password: "" });
      loadData();
    } catch (err) {
      alert("Gagal menambahkan mahasiswa.");
    }
  };

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
    } catch (err) {
      alert("Gagal memperbarui mahasiswa.");
    }
  };

  const deleteStudent = async () => {
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      setShowDelete(false);
      loadData();
    } catch (err) {
      alert("Gagal menghapus mahasiswa.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Manage Students" />

      <div className="mx-auto max-w-7xl grid md:grid-cols-[16rem_1fr] gap-6 px-4 py-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Mahasiswa</h2>

            <button
              onClick={() => {
                setShowAdd(true);
                setForm({ name: "", username: "", email: "", password: "" });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
            >
              + Tambah Mahasiswa
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 text-left">Nama</th>
                <th className="py-3 text-left">NPM</th>
                <th className="py-3 text-left">Email</th>
                <th className="py-3 text-left w-32">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b">
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                    Belum ada mahasiswa.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{s.name}</td>
                    <td>{s.username}</td> {/* NPM */}
                    <td>{s.email || "-"}</td>

                    <td className="flex gap-2 py-2">
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
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowDelete(true);
                        }}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>

      {/* MODAL ADD */}
      {showAdd && (
        <Modal title="Tambah Mahasiswa" onClose={() => setShowAdd(false)}>
          <FormInput label="Nama" value={form.name} onChange={(v) => updateForm("name", v)} />
          <FormInput label="NPM" value={form.username} onChange={(v) => updateForm("username", v)} />
          <FormInput label="Email (opsional)" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput label="Password" type="password" value={form.password} onChange={(v) => updateForm("password", v)} />

          <button onClick={addStudent} className="w-full mt-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Tambah
          </button>
        </Modal>
      )}

      {/* MODAL EDIT */}
      {showEdit && (
        <Modal title="Edit Mahasiswa" onClose={() => setShowEdit(false)}>
          <FormInput label="Nama" value={form.name} onChange={(v) => updateForm("name", v)} />
          <FormInput label="NPM" value={form.username} onChange={(v) => updateForm("username", v)} />
          <FormInput label="Email (opsional)" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput label="Password (opsional)" type="password" value={form.password} onChange={(v) => updateForm("password", v)} />

          <button onClick={saveEdit} className="w-full mt-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Simpan Perubahan
          </button>
        </Modal>
      )}

      {/* MODAL DELETE */}
      {showDelete && (
        <Modal title="Hapus Mahasiswa?" onClose={() => setShowDelete(false)}>
          <p className="text-gray-600 text-sm">
            Yakin ingin menghapus akun <b>{selectedStudent?.name}</b>? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-xl border hover:bg-gray-50">
              Batal
            </button>
            <button onClick={deleteStudent} className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">
              Hapus
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-96 p-6 rounded-2xl shadow-xl animate-scaleIn">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>

      <style>{`
        .animate-scaleIn {
          animation: scaleIn .25s ease-out;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="mt-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
}
