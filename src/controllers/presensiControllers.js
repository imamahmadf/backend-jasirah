const {
  pegawai,
  Presensi,
  statusPegawai,
  statusPresensi,
  sequelize,
  daftarUnitKerja,
} = require("../models");
const { Op } = require("sequelize");

const normalizePresensiInput = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (body?.pegawaiId) return [body];
  return [];
};

const toTanggalRange = (tanggal) => {
  const startOfDay = new Date(`${tanggal}T00:00:00.000Z`);
  if (Number.isNaN(startOfDay.getTime())) return null;
  const endOfDay = new Date(`${tanggal}T23:59:59.999Z`);
  return { startOfDay, endOfDay, tanggalDate: startOfDay };
};

const buildJamPayload = (item) => {
  const payload = {};
  if (item.tipeJam === "jamMasuk" && item.jamMasuk) {
    payload.jamMasuk = new Date(item.jamMasuk);
  }
  if (item.tipeJam === "jamPulang" && item.jamPulang) {
    payload.jamPulang = new Date(item.jamPulang);
  }
  if (!item.tipeJam) {
    if (item.jamMasuk) payload.jamMasuk = new Date(item.jamMasuk);
    if (item.jamPulang) payload.jamPulang = new Date(item.jamPulang);
  }
  if (item.statusPresensiId != null) {
    payload.statusPresensiId = Number(item.statusPresensiId);
  }
  if (item.lemburHarian != null && item.lemburHarian !== "") {
    payload.lemburHarian = Number(item.lemburHarian);
  }
  return payload;
};

const hitungJamKerja = (jamMasuk, jamPulang) => {
  if (!jamMasuk || !jamPulang) return null;

  const masuk = new Date(jamMasuk);
  const pulang = new Date(jamPulang);
  if (Number.isNaN(masuk.getTime()) || Number.isNaN(pulang.getTime())) {
    return null;
  }

  const selisihMs = pulang.getTime() - masuk.getTime();
  if (selisihMs < 0) return null;

  return Math.round(selisihMs / (1000 * 60));
};

const enrichPresensiJamKerja = (presensi) => {
  if (!presensi) return presensi;

  const data = presensi.toJSON ? presensi.toJSON() : { ...presensi };
  data.jamKerja =
    data.jamKerja ?? hitungJamKerja(data.jamMasuk, data.jamPulang);
  return data;
};

const toDateKeyUtc = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const getMonthRangeUtc = (tahun, bulan) => {
  const startOfMonth = new Date(Date.UTC(tahun, bulan - 1, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(tahun, bulan, 0, 23, 59, 59, 999));
  const daysInMonth = endOfMonth.getUTCDate();
  return { startOfMonth, endOfMonth, daysInMonth };
};

const buildAllDayEvent = (tanggal, jumlahMasuk, jumlahPulang) => {
  const start = new Date(`${tanggal}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    title: `Masuk: ${jumlahMasuk} | Pulang: ${jumlahPulang}`,
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: true,
    jumlahMasuk,
    jumlahPulang,
    tanggal,
  };
};

module.exports = {
  getDetailPresensiMinggunan: async (req, res) => {
    const tanggal = req.query.tanggal;
    if (!tanggal) {
      return res.status(400).json({
        message: "Query parameter `tanggal` wajib diisi.",
        code: 400,
      });
    }

    try {
      const startOfDay = new Date(`${tanggal}T00:00:00.000Z`);
      const endOfDay = new Date(`${tanggal}T23:59:59.999Z`);

      const rows = await pegawai.findAll({
        include: [
          {
            model: Presensi,
            as: "presensis",
            where: {
              tanggal: {
                [Op.between]: [startOfDay, endOfDay],
              },
            },
            required: false,
            include: [
              { model: statusPresensi },
              { model: daftarUnitKerja, as: "daftarUnitKerja" },
            ],
          },
        ],
        where: { statusPegawaiId: 5 },
      });

      const result = rows.map((row) => {
        const data = row.toJSON();
        data.presensis = (data.presensis || []).map(enrichPresensiJamKerja);
        return data;
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  postPresensiMingguan: async (req, res) => {
    const items = normalizePresensiInput(req.body);

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data presensi wajib berupa array dan tidak boleh kosong",
        code: 400,
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const results = [];

      for (const item of items) {
        const pegawaiId = Number(item.pegawaiId);
        const unitKerjaId = Number(item.unitKerjaId);
        const { tanggal } = item;

        if (!pegawaiId || !tanggal) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Setiap item wajib memiliki pegawaiId dan tanggal",
            code: 400,
          });
        }

        const tanggalRange = toTanggalRange(tanggal);
        if (!tanggalRange) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Format tanggal tidak valid: ${tanggal}`,
            code: 400,
          });
        }

        const { startOfDay, endOfDay, tanggalDate } = tanggalRange;

        const existing = await Presensi.findOne({
          where: {
            pegawaiId,
            tanggal: { [Op.between]: [startOfDay, endOfDay] },
          },
          transaction,
        });

        const resolvedUnitKerjaId =
          unitKerjaId || existing?.unitKerjaId || null;

        if (!resolvedUnitKerjaId) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Setiap item wajib memiliki unitKerjaId (atau sudah ada presensi dengan unit kerja)",
            code: 400,
          });
        }

        const jamPayload = buildJamPayload(item);
        if (Object.keys(jamPayload).length === 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Setiap item wajib memiliki jamMasuk, jamPulang, statusPresensiId, atau lemburHarian",
            code: 400,
          });
        }

        if (existing) {
          const jamMasuk = jamPayload.jamMasuk ?? existing.jamMasuk;
          const jamPulang = jamPayload.jamPulang ?? existing.jamPulang;

          await existing.update(
            {
              ...jamPayload,
              unitKerjaId: resolvedUnitKerjaId,
              jamKerja: hitungJamKerja(jamMasuk, jamPulang),
            },
            { transaction },
          );
          await existing.reload({ transaction });
          results.push(existing);
        } else {
          const jamMasuk = jamPayload.jamMasuk ?? null;
          const jamPulang = jamPayload.jamPulang ?? null;

          const created = await Presensi.create(
            {
              pegawaiId,
              tanggal: tanggalDate,
              unitKerjaId: resolvedUnitKerjaId,
              jamMasuk,
              jamPulang,
              jamKerja: hitungJamKerja(jamMasuk, jamPulang),
              statusPresensiId: jamPayload.statusPresensiId ?? 1,
              lemburHarian: jamPayload.lemburHarian ?? null,
            },
            { transaction },
          );
          results.push(created);
        }
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Data presensi berhasil disimpan",
        result: results,
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan data presensi",
        error: err.toString(),
      });
    }
  },

  getStatusPresensi: async (req, res) => {
    try {
      const result = await statusPresensi.findAll({});
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKalenderPresensiMingguan: async (req, res) => {
    const now = new Date();
    const bulan = Number(req.query.bulan) || now.getMonth() + 1;
    const tahun = Number(req.query.tahun) || now.getFullYear();

    if (
      !Number.isInteger(bulan) ||
      !Number.isInteger(tahun) ||
      bulan < 1 ||
      bulan > 12
    ) {
      return res.status(400).json({
        message: "Query `bulan` (1-12) dan `tahun` harus valid.",
        code: 400,
      });
    }

    const { startOfMonth, endOfMonth, daysInMonth } = getMonthRangeUtc(
      tahun,
      bulan,
    );

    try {
      const pegawaiMingguan = await pegawai.findAll({
        where: { statusPegawaiId: 5 },
        attributes: ["id"],
      });
      const pegawaiIds = pegawaiMingguan.map((p) => p.id);
      const totalPegawaiMingguan = pegawaiIds.length;

      const presensiRows =
        pegawaiIds.length > 0
          ? await Presensi.findAll({
              where: {
                pegawaiId: { [Op.in]: pegawaiIds },
                tanggal: { [Op.between]: [startOfMonth, endOfMonth] },
              },
              attributes: ["pegawaiId", "tanggal", "jamMasuk", "jamPulang"],
            })
          : [];

      const agregatByTanggal = {};

      for (const row of presensiRows) {
        const tanggal = toDateKeyUtc(row.tanggal);
        if (!tanggal) continue;

        if (!agregatByTanggal[tanggal]) {
          agregatByTanggal[tanggal] = {
            masuk: new Set(),
            pulang: new Set(),
          };
        }
        if (row.jamMasuk) {
          agregatByTanggal[tanggal].masuk.add(row.pegawaiId);
        }
        if (row.jamPulang) {
          agregatByTanggal[tanggal].pulang.add(row.pegawaiId);
        }
      }

      const bulanStr = String(bulan).padStart(2, "0");
      const hari = [];

      for (let day = 1; day <= daysInMonth; day += 1) {
        const dayStr = String(day).padStart(2, "0");
        const tanggal = `${tahun}-${bulanStr}-${dayStr}`;
        const counts = agregatByTanggal[tanggal];

        hari.push({
          tanggal,
          jumlahMasuk: counts?.masuk.size ?? 0,
          jumlahPulang: counts?.pulang.size ?? 0,
        });
      }

      const events = hari.map((item) =>
        buildAllDayEvent(item.tanggal, item.jumlahMasuk, item.jumlahPulang),
      );

      return res.status(200).json({
        bulan,
        tahun,
        totalPegawaiMingguan,
        hari,
        events,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getStatusPresensi: async (req, res) => {
    try {
      const result = await statusPresensi.findAll({});
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
