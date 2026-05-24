const { pegawai, presensi } = require("../models");
const { Op } = require("sequelize");

const HARI_MINGGU = [
  { key: "senin", label: "Senin" },
  { key: "selasa", label: "Selasa" },
  { key: "rabu", label: "Rabu" },
  { key: "kamis", label: "Kamis" },
  { key: "jumat", label: "Jumat" },
  { key: "sabtu", label: "Sabtu" },
  { key: "minggu", label: "Minggu" },
];

const formatTanggal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getRentangMinggu = (tanggalRef) => {
  const ref = new Date(tanggalRef);
  const hari = ref.getDay();
  const selisihSenin = hari === 0 ? -6 : 1 - hari;

  const senin = new Date(ref);
  senin.setHours(0, 0, 0, 0);
  senin.setDate(ref.getDate() + selisihSenin);

  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);
  minggu.setHours(23, 59, 59, 999);

  return { senin, minggu };
};

module.exports = {
  getPresensi: async (req, res) => {
    try {
      const unitKerjaId = req.query.unitKerjaId
        ? parseInt(req.query.unitKerjaId)
        : null;
      const tanggalRef = req.query.tanggal
        ? new Date(req.query.tanggal)
        : new Date();

      const { senin, minggu } = getRentangMinggu(tanggalRef);

      const columns = HARI_MINGGU.map((hari, i) => {
        const tanggal = new Date(senin);
        tanggal.setDate(senin.getDate() + i);
        return {
          key: hari.key,
          label: hari.label,
          tanggal: formatTanggal(tanggal),
        };
      });

      const pegawaiWhere = {};
      if (unitKerjaId) pegawaiWhere.unitKerjaId = unitKerjaId;

      const daftarPegawai = await pegawai.findAll({
        where: pegawaiWhere,
        attributes: ["id", "nama", "nip"],
        order: [["nama", "ASC"]],
      });

      const presensiWhere = {
        jamMasuk: { [Op.between]: [senin, minggu] },
      };
      if (unitKerjaId) presensiWhere.unitKerjaId = unitKerjaId;

      const daftarPresensi = await presensi.findAll({
        where: presensiWhere,
      });

      const presensiMap = {};
      for (const item of daftarPresensi) {
        const tanggalKey = formatTanggal(new Date(item.jamMasuk));
        presensiMap[`${item.pegawaiId}_${tanggalKey}`] = {
          id: item.id,
          jamMasuk: item.jamMasuk,
          jamPulang: item.jamPulang,
        };
      }

      const rows = daftarPegawai.map((pg) => {
        const row = {
          pegawaiId: pg.id,
          nama: pg.nama,
          nip: pg.nip,
        };
        for (const col of columns) {
          row[col.key] =
            presensiMap[`${pg.id}_${col.tanggal}`] || null;
        }
        return row;
      });

      return res.status(200).json({
        columns: [{ key: "nama", label: "Nama" }, ...columns],
        rows,
        periode: {
          mulai: formatTanggal(senin),
          selesai: formatTanggal(minggu),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
