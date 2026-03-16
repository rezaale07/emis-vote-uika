import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* =========================
   SKELETON ROW
========================= */
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔍 SEARCH */
  const [search, setSearch] = useState("");

  /* MODAL STATES */
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  /* FORM STATE */
  const initialForm = {
    name: "",
    username: "",
    email: "",
    password: "",
    fakultas: "",
    prodi: "",
    angkatan: "",
  };

  const [form, setForm] = useState(initialForm);
  const updateForm = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  /* =========================
     LOAD DATA + SEARCH
  ========================= */
  const loadData = async (keyword = "") => {
    setLoading(true);
    try {
      const res = await api.get("/students", {
        params: { search: keyword },
      });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire("Error", "Gagal memuat data mahasiswa", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* 🔍 debounce search */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* =========================
     CRUD
  ========================= */
  const addStudent = async () => {
    if (!form.name || !form.username || !form.password) {
      return Swal.fire(
        "Validasi",
        "Nama, NPM, dan password wajib diisi",
        "warning"
      );
    }

    try {
      await api.post("/students", {
        ...form,
        email: form.email || null,
        fakultas: form.fakultas || null,
        prodi: form.prodi || null,
        angkatan: form.angkatan || null,
      });

      setShowAdd(false);
      setForm(initialForm);
      loadData(search);

      Swal.fire("Berhasil", "Mahasiswa ditambahkan", "success");
    } catch {
      Swal.fire("Error", "Gagal menambahkan mahasiswa", "error");
    }
  };

  const saveEdit = async () => {
    if (!selectedStudent?.id) return;

    try {
      await api.put(`/students/${selectedStudent.id}`, {
        ...form,
        password: form.password || undefined,
      });

      setShowEdit(false);
      setSelectedStudent(null);
      setForm(initialForm);
      loadData(search);

      Swal.fire("Berhasil", "Data mahasiswa diperbarui", "success");
    } catch {
      Swal.fire("Error", "Gagal memperbarui mahasiswa", "error");
    }
  };

  const deleteStudent = async (s) => {
    const confirm = await Swal.fire({
      title: "Hapus Mahasiswa?",
      html: `Yakin ingin menghapus <b>${s.name}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/students/${s.id}`);
      loadData(search);
      Swal.fire("Terhapus", "Mahasiswa berhasil dihapus", "success");
    } catch {
      Swal.fire("Error", "Gagal menghapus mahasiswa", "error");
    }
  };

  /* =========================
     IMPORT EXCEL
  ========================= */
  const importExcel = async () => {
    if (!excelFile) {
      return Swal.fire(
        "Validasi",
        "Silakan pilih file Excel (.xlsx)",
        "warning"
      );
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const res = await api.post("/students/import", formData);

      setShowImport(false);
      setExcelFile(null);
      loadData(search);

      Swal.fire({
        title: "Import Selesai",
        html: `
          <p>✅ Berhasil: <b>${res.data.success}</b></p>
          <p>❌ Gagal: <b>${res.data.failed}</b></p>
        `,
        icon: "success",
      });
    } catch {
      Swal.fire("Error", "Gagal import data", "error");
    }
  };

  return (
    <AdminLayout title="Manage Students" subtitle="Kelola data mahasiswa">
      <main className="bg-white rounded-2xl border shadow-sm p-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
              Students
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Daftar Mahasiswa
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Cari nama, NPM, email, fakultas, prodi, angkatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => setShowImport(true)}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              Import Excel
            </button>

            <button
              onClick={() => {
                setForm(initialForm);
                setShowAdd(true);
              }}
              className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700"
            >
              + Tambah Mahasiswa
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NPM</th>
                <th>Email</th>
                <th>Fakultas</th>
                <th>Prodi</th>
                <th>Angkatan</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td>{i + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.username}</td>
                    <td>{s.email || "-"}</td>
                    <td>{s.fakultas || "-"}</td>
                    <td>{s.prodi || "-"}</td>
                    <td>{s.angkatan || "-"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setForm({ ...s, password: "" });
                            setShowEdit(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStudent(s)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      {/* MODAL ADD */}
      {showAdd && (
        <Modal title="Tambah Mahasiswa" onClose={() => setShowAdd(false)}>
          <FormInput label="Nama" value={form.name} onChange={(v) => updateForm("name", v)} />
          <FormInput label="NPM" value={form.username} onChange={(v) => updateForm("username", v)} />
          <FormInput label="Email" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput label="Fakultas" value={form.fakultas} onChange={(v) => updateForm("fakultas", v)} />
          <FormInput label="Prodi" value={form.prodi} onChange={(v) => updateForm("prodi", v)} />
          <FormInput label="Angkatan" value={form.angkatan} onChange={(v) => updateForm("angkatan", v)} />
          <FormInput label="Password" type="password" value={form.password} onChange={(v) => updateForm("password", v)} />
          <PrimaryButton onClick={addStudent} text="Tambah Mahasiswa" />
        </Modal>
      )}

      {/* MODAL EDIT */}
      {showEdit && (
        <Modal title="Edit Mahasiswa" onClose={() => setShowEdit(false)}>
          <FormInput label="Nama" value={form.name} onChange={(v) => updateForm("name", v)} />
          <FormInput label="NPM" value={form.username} onChange={(v) => updateForm("username", v)} />
          <FormInput label="Email" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput label="Fakultas" value={form.fakultas} onChange={(v) => updateForm("fakultas", v)} />
          <FormInput label="Prodi" value={form.prodi} onChange={(v) => updateForm("prodi", v)} />
          <FormInput label="Angkatan" value={form.angkatan} onChange={(v) => updateForm("angkatan", v)} />
          <FormInput label="Password (opsional)" type="password" value={form.password} onChange={(v) => updateForm("password", v)} />
          <PrimaryButton onClick={saveEdit} text="Simpan Perubahan" />
        </Modal>
      )}

      {/* MODAL IMPORT */}
      {showImport && (
        <Modal title="Import Mahasiswa (Excel)" onClose={() => setShowImport(false)}>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded-xl p-2.5"
          />
          <p className="text-xs text-gray-500">
            Format: nama | npm | email | fakultas | prodi | angkatan
          </p>
          <PrimaryButton onClick={importExcel} text="Import Sekarang" />
        </Modal>
      )}
    </AdminLayout>
  );
}

/* =========================
   MODAL & FORM
========================= */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border rounded-xl p-2.5"
      />
    </div>
  );
}

function PrimaryButton({ onClick, text }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
    >
      {text}
    </button>
  );
}
