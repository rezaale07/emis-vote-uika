import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* =========================
   SKELETON
========================= */
function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b">
            <td className="py-4 px-4">
                <div className="h-4 w-40 bg-gray-200 rounded" />
            </td>
            <td className="py-4 px-4">
                <div className="h-4 w-28 bg-gray-200 rounded" />
            </td>
            <td className="py-4 px-4">
                <div className="h-4 w-40 bg-gray-200 rounded" />
            </td>
            <td className="py-4 px-4">
                <div className="h-8 w-24 bg-gray-200 rounded-xl" />
            </td>
        </tr>
    );
}

export default function ManageStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [excelFile, setExcelFile] = useState(null);

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
            setStudents(res.data || []);
        } catch {
            Swal.fire("Error", "Gagal memuat data mahasiswa", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    /* =========================
     CRUD
  ========================= */
    const addStudent = async () => {
        if (!form.name || !form.username || !form.password) {
            return Swal.fire(
                "Validasi",
                "Nama, NPM, dan password wajib diisi",
                "warning",
            );
        }

        try {
            await api.post("/students", form);
            setShowAdd(false);
            setForm({ name: "", username: "", email: "", password: "" });
            loadData();
            Swal.fire("Berhasil", "Mahasiswa ditambahkan", "success");
        } catch {
            Swal.fire("Error", "Gagal menambahkan mahasiswa", "error");
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
            loadData();
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
                "warning",
            );
        }

        const formData = new FormData();
        formData.append("file", excelFile);

        try {
            const res = await api.post("/students/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setShowImport(false);
            setExcelFile(null);
            loadData();

            Swal.fire({
                title: "Import Selesai",
                html: `
          <p>✅ Berhasil: <b>${res.data.success}</b></p>
          <p>❌ Gagal: <b>${res.data.failed}</b></p>
          ${
              res.data.errors.length
                  ? `<hr><pre style="text-align:left">${res.data.errors.join("\n")}</pre>`
                  : ""
          }
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
                            Students
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                            Daftar Mahasiswa
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImport(true)}
                            className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
                        >
                            Import Excel
                        </button>

                        <button
                            onClick={() => {
                                setForm({
                                    name: "",
                                    username: "",
                                    email: "",
                                    password: "",
                                });
                                setShowAdd(true);
                            }}
                            className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700"
                        >
                            + Tambah Mahasiswa
                        </button>
                    </div>
                </div>

                {/* ===== DESKTOP TABLE ===== */}
                <div className="hidden md:block overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="py-3 px-4 text-left">Nama</th>
                                <th className="py-3 px-4 text-left">NPM</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Aksi</th>
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
                                    <td
                                        colSpan="4"
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Belum ada mahasiswa
                                    </td>
                                </tr>
                            ) : (
                                students.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="py-3 px-4">{s.name}</td>
                                        <td className="px-4">{s.username}</td>
                                        <td className="px-4">
                                            {s.email || "-"}
                                        </td>
                                        <td className="px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(s);
                                                        setForm({
                                                            name: s.name,
                                                            username:
                                                                s.username,
                                                            email: s.email,
                                                            password: "",
                                                        });
                                                        setShowEdit(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg border hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteStudent(s)
                                                    }
                                                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
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

                {/* ===== MOBILE CARD ===== */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                            <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-gray-50 py-10 text-center text-gray-500">
                            Belum ada mahasiswa
                        </div>
                    ) : (
                        students.map((s) => (
                            <div
                                key={s.id}
                                className="rounded-2xl border p-4 shadow-sm flex justify-between items-start gap-4"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {s.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {s.username}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {s.email || "-"}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
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
                                        className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteStudent(s)}
                                        className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* MODAL ADD */}
            {showAdd && (
                <Modal
                    title="Tambah Mahasiswa"
                    onClose={() => setShowAdd(false)}
                >
                    <FormInput
                        label="Nama"
                        value={form.name}
                        onChange={(v) => updateForm("name", v)}
                    />
                    <FormInput
                        label="NPM"
                        value={form.username}
                        onChange={(v) => updateForm("username", v)}
                    />
                    <FormInput
                        label="Email"
                        value={form.email}
                        onChange={(v) => updateForm("email", v)}
                    />
                    <FormInput
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(v) => updateForm("password", v)}
                    />
                    <PrimaryButton
                        onClick={addStudent}
                        text="Tambah Mahasiswa"
                    />
                </Modal>
            )}

            {/* MODAL EDIT */}
            {showEdit && (
                <Modal
                    title="Edit Mahasiswa"
                    onClose={() => setShowEdit(false)}
                >
                    <FormInput
                        label="Nama"
                        value={form.name}
                        onChange={(v) => updateForm("name", v)}
                    />
                    <FormInput
                        label="NPM"
                        value={form.username}
                        onChange={(v) => updateForm("username", v)}
                    />
                    <FormInput
                        label="Email"
                        value={form.email}
                        onChange={(v) => updateForm("email", v)}
                    />
                    <FormInput
                        label="Password (opsional)"
                        type="password"
                        value={form.password}
                        onChange={(v) => updateForm("password", v)}
                    />
                    <PrimaryButton onClick={saveEdit} text="Simpan Perubahan" />
                </Modal>
            )}

            {/* MODAL IMPORT */}
            {showImport && (
                <Modal
                    title="Import Mahasiswa (Excel)"
                    onClose={() => setShowImport(false)}
                >
                    <input
                        type="file"
                        accept=".xlsx"
                        onChange={(e) => setExcelFile(e.target.files[0])}
                        className="w-full border rounded-xl p-2.5"
                    />
                    <p className="text-xs text-gray-500">
                        Format: nama | npm | email | fakultas | prodi | angkatan
                    </p>
                    <PrimaryButton
                        onClick={importExcel}
                        text="Import Sekarang"
                    />
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
                value={value}
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
