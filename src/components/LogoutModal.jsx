import { motion, AnimatePresence } from "framer-motion";

export default function LogoutModal({ show, onClose, onConfirm, role = "User" }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* Background Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-xl border"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Logout {role}?
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Kamu yakin ingin keluar? Semua sesi akan diakhiri.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition"
              >
                Batal
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
