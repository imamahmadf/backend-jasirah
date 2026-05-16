const { personil } = require("../models");

// Helper function untuk emit notifikasi
// Menghitung jumlah personil dengan statusId == 2 (pengajuan) dan statusId == 4 (ditolak)
// Bisa dipanggil dari controller manapun yang memiliki akses ke io
const emitNotifikasiPersonil = async (io) => {
  try {
    // Hitung jumlah personil dengan statusId == 2 (pengajuan kwitansi)
    const countPengajuan = await personil.count({
      where: { statusId: 2 },
    });

    // Hitung jumlah personil dengan statusId == 4 (kwitansi ditolak)
    const countDitolak = await personil.count({
      where: { statusId: 4 },
    });

    const totalCount = countPengajuan + countDitolak;

    console.log(
      "🚀 Emit notifikasi:terbaru - Pengajuan:",
      countPengajuan,
      "Ditolak:",
      countDitolak
    );

    // Siapkan pesan
    let messages = [];
    if (countPengajuan > 0) {
      messages.push(
        countPengajuan === 1
          ? "Ada 1 pengajuan kwitansi"
          : `Ada ${countPengajuan} pengajuan kwitansi`
      );
    }
    if (countDitolak > 0) {
      messages.push(
        countDitolak === 1
          ? "Ada 1 kwitansi yang ditolak"
          : `Ada ${countDitolak} kwitansi yang ditolak`
      );
    }

    const combinedMessage =
      messages.length > 0 ? messages.join(", ") : "Tidak ada notifikasi baru";

    // Emit notifikasi dengan format yang lebih lengkap
    io.emit("notifikasi:terbaru", {
      message: combinedMessage,
      pengajuan: {
        count: countPengajuan,
        message:
          countPengajuan === 1
            ? "Ada 1 pengajuan kwitansi"
            : `Ada ${countPengajuan} pengajuan kwitansi`,
      },
      ditolak: {
        count: countDitolak,
        message:
          countDitolak === 1
            ? "Ada 1 kwitansi yang ditolak"
            : `Ada ${countDitolak} kwitansi yang ditolak`,
      },
      count: totalCount, // Total count untuk backward compatibility
      timestamp: new Date().toISOString(),
    });

    return {
      pengajuan: countPengajuan,
      ditolak: countDitolak,
      total: totalCount,
    };
  } catch (err) {
    console.error("❌ Error emit notifikasi:", err);
    throw err;
  }
};

module.exports = {
  getNotifikasi: async (req, res) => {
    try {
      const io = req.app.get("socketio");
      const counts = await emitNotifikasiPersonil(io);

      res.status(200).json({
        count: counts.total, // Backward compatibility
        pengajuan: counts.pengajuan,
        ditolak: counts.ditolak,
        total: counts.total,
        message: "Notifikasi berhasil dikirim",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Export helper function agar bisa digunakan di controller lain
  emitNotifikasiPersonil,
};
