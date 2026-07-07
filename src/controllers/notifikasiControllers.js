const { personil, suratJalan, mitra } = require("../models");

const emitNotifikasiSuratJalanDraft = async (io) => {
  try {
    const countDraft = await suratJalan.count({
      where: { statusSuratJalanId: 1 },
    });

    const recentDraft = await suratJalan.findAll({
      where: { statusSuratJalanId: 1 },
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [{ model: mitra, attributes: ["id", "nama"] }],
    });

    const message =
      countDraft === 0
        ? "Tidak ada surat jalan draft"
        : countDraft === 1
          ? "Ada 1 surat jalan berstatus DRAFT menunggu verifikasi"
          : `Ada ${countDraft} surat jalan berstatus DRAFT menunggu verifikasi`;

    const notifikasi = recentDraft.map((item) => ({
      id: item.id,
      message: `Surat jalan #${item.nomor || item.id} — ${item.mitra?.nama || "Mitra"} (DRAFT)`,
      tanggal: item.tanggal,
      mitra: item.mitra?.nama || "-",
      timestamp: item.createdAt,
    }));

    const payload = {
      count: countDraft,
      message,
      suratJalanDraft: {
        count: countDraft,
        message,
      },
      notifikasi,
      timestamp: new Date().toISOString(),
    };

    if (io) {
      console.log(
        "🚀 Emit notifikasi:kpbpn:terbaru - Surat Jalan DRAFT:",
        countDraft,
      );
      io.emit("notifikasi:kpbpn:terbaru", payload);
    }

    return payload;
  } catch (err) {
    console.error("❌ Error emit notifikasi surat jalan draft:", err);
    throw err;
  }
};

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

  getNotifikasiKPBPN: async (req, res) => {
    try {
      const io = req.app.get("socketio");
      const data = await emitNotifikasiSuratJalanDraft(io);

      res.status(200).json({
        count: data.count,
        total: data.count,
        suratJalanDraft: data.suratJalanDraft,
        notifikasi: data.notifikasi,
        message: data.message,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Export helper function agar bisa digunakan di controller lain
  emitNotifikasiPersonil,
  emitNotifikasiSuratJalanDraft,
};
