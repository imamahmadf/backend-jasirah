const {
  daftarUnitKerja,
  daftarSubKegiatan,
  daftarPangkat,
  daftarGolongan,
  daftarTingkatan,
  ttdNotaDinas,
  ttdSuratTugas,
  profesi,
  status,
  suratKeluar,
  personil,

  pegawai,
  perjalanan,
  tempat,
  dalamKota,
  jenisPerjalanan,
  tipePerjalanan,
  sequelize,
  daftarNomorSurat,
  jenisSurat,
  indukUnitKerja,
  KPA,
  bendahara,
} = require("../models");

const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

module.exports = {
  getPerjalanan: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.query);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegiatanId = parseInt(req.query.subKegiatanId);
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pegawaiId = parseInt(req.query.pegawaiId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const offset = limit * page;
    const whereCondition = {};
    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};

    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    const whereConditionTempat = {};

    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }
    try {
      const result = await perjalanan.findAll({
        limit,
        offset,
        subQuery: false,
        where: whereConditionSubKegiatan,
        include: [
          {
            model: personil,
            attributes: ["id", "nomorSPD"],
            include: [{ model: pegawai, attributes: ["nama", "nip"] }],
            where: whereConditionPegawaiId,
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId"],
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat, // <- Filter terapkan di sini
            attributes: ["id", "tanggalBerangkat", "tanggalPulang", "tempat"],
            include: [
              { model: dalamKota, attributes: ["id", "nama"], as: "dalamKota" },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
          },
        ],
        attributes: ["id", "noNotaDinas", "noSuratTugas"],
      });

      const totalRows = await perjalanan.count({
        where: whereConditionSubKegiatan,
        include: [
          {
            model: ttdNotaDinas,
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat,
          },
        ],
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getSuratTugas: async (req, res) => {
    console.log(req.query);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = req.query.unitKerjaId
      ? parseInt(req.query.unitKerjaId)
      : null;
    const subKegiatanId = req.query.subKegiatanId
      ? parseInt(req.query.subKegiatanId)
      : null;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pegawaiId = req.query.pegawaiId
      ? parseInt(req.query.pegawaiId)
      : null;
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const offset = limit * page;

    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};
    const whereConditionTempat = {};
    const whereConditionUnitKerja = {};

    // Filter subKegiatanId
    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }

    // Filter pegawaiId
    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    // Filter unitKerjaId
    if (unitKerjaId) {
      whereConditionUnitKerja.unitKerjaId = unitKerjaId;
    }

    // Filter tanggal berangkat
    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    // Filter tanggal pulang
    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    try {
      const { count, rows } = await perjalanan.findAndCountAll({
        offset,
        limit,
        where: whereConditionSubKegiatan,
        order: [
          ["id", time],
          [{ model: personil }, "id", "ASC"],
        ],
        attributes: [
          "id",
          "untuk",
          "asal",
          "dasar",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
          "isNotaDinas",
        ],
        include: [
          {
            model: personil,
            ...(Object.keys(whereConditionPegawaiId).length > 0 && {
              where: whereConditionPegawaiId,
            }),
            include: [
              {
                model: pegawai,
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                  { model: profesi, as: "profesi" },
                ],
              },
              { model: status },
            ],
          },
          {
            model: tempat,
            ...(Object.keys(whereConditionTempat).length > 0 && {
              where: whereConditionTempat,
            }),
            attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
            include: [
              {
                model: dalamKota,
                as: "dalamKota",
                attributes: ["id", "nama", "durasi"],
              },
            ],
          },
          {
            model: suratKeluar,
            attributes: ["id", "nomor"],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },
          {
            model: ttdSuratTugas,
            attributes: ["id", "jabatan", "indukUnitKerjaId"],
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: indukUnitKerja,
                attributes: ["id", "kodeInduk"],
                as: "indukUnitKerja_ttdSuratTugas",
              },
            ],
          },
          {
            model: KPA,
            attributes: ["id", "jabatan"],
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
            ],
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId", "jabatan"],
            ...(Object.keys(whereConditionUnitKerja).length > 0 && {
              where: whereConditionUnitKerja,
            }),
            required: unitKerjaId ? true : false,
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_notaDinas",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: daftarUnitKerja,
                attributes: ["id", "indukUnitKerjaId"],
                as: "unitKerja_notaDinas",
                include: [
                  {
                    model: indukUnitKerja,
                    attributes: ["id", "kodeInduk"],
                  },
                ],
              },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
        ],
        distinct: true,
      });

      const filteredResult = rows.filter((item) => {
        const hasProfesiId1 = item.personils?.some(
          (p) => p.pegawai?.profesi?.id === 1
        );

        // Kembalikan true jika TIDAK memiliki profesi.id == 1
        return !hasProfesiId1;
      });

      return res.status(200).json({
        result: filteredResult,
        page,
        totalPage: Math.ceil(count / limit),
        totalRows: count,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  downloadSuratTugas: async (req, res) => {
    // Helper function to format date in Indonesian format
    const formatTanggalIndonesia = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      const months = [
        "januari",
        "februari",
        "maret",
        "april",
        "mei",
        "juni",
        "juli",
        "agustus",
        "september",
        "oktober",
        "november",
        "desember",
      ];
      const day = String(d.getDate()).padStart(2, "0");
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    };

    console.log(req.query);
    const unitKerjaId = req.query.unitKerjaId
      ? parseInt(req.query.unitKerjaId)
      : null;
    const subKegiatanId = req.query.subKegiatanId
      ? parseInt(req.query.subKegiatanId)
      : null;
    const pegawaiId = req.query.pegawaiId
      ? parseInt(req.query.pegawaiId)
      : null;
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;

    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};
    const whereConditionTempat = {};
    const whereConditionUnitKerja = {};

    // Filter subKegiatanId
    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }

    // Filter pegawaiId
    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    // Filter unitKerjaId
    if (unitKerjaId) {
      whereConditionUnitKerja.unitKerjaId = unitKerjaId;
    }

    // Filter tanggal berangkat
    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    // Filter tanggal pulang
    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    try {
      const result = await perjalanan.findAll({
        where: whereConditionSubKegiatan,
        order: [
          ["id", "DESC"],
          [{ model: personil }, "id", "ASC"],
        ],
        attributes: [
          "id",
          "untuk",
          "asal",
          "dasar",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
          "isNotaDinas",
        ],
        include: [
          {
            model: personil,
            ...(Object.keys(whereConditionPegawaiId).length > 0 && {
              where: whereConditionPegawaiId,
            }),
            include: [
              {
                model: pegawai,
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                  { model: profesi, as: "profesi" },
                ],
              },
              { model: status },
            ],
          },
          {
            model: tempat,
            ...(Object.keys(whereConditionTempat).length > 0 && {
              where: whereConditionTempat,
            }),
            attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
            include: [
              {
                model: dalamKota,
                as: "dalamKota",
                attributes: ["id", "nama", "durasi"],
              },
            ],
          },
          {
            model: suratKeluar,
            attributes: ["id", "nomor"],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },
          {
            model: ttdSuratTugas,
            attributes: ["id", "jabatan", "indukUnitKerjaId"],
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: indukUnitKerja,
                attributes: ["id", "kodeInduk"],
                as: "indukUnitKerja_ttdSuratTugas",
              },
            ],
          },
          {
            model: KPA,
            attributes: ["id", "jabatan"],
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
            ],
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId", "jabatan"],
            ...(Object.keys(whereConditionUnitKerja).length > 0 && {
              where: whereConditionUnitKerja,
            }),
            required: unitKerjaId ? true : false,
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_notaDinas",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: daftarUnitKerja,
                attributes: ["id", "indukUnitKerjaId"],
                as: "unitKerja_notaDinas",
                include: [
                  {
                    model: indukUnitKerja,
                    attributes: ["id", "kodeInduk"],
                  },
                ],
              },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
        ],
        distinct: true,
      });

      // Filter out profesi.id === 1
      const filteredResult = result.filter((item) => {
        const hasProfesiId1 = item.personils?.some(
          (p) => p.pegawai?.profesi?.id === 1
        );
        return !hasProfesiId1;
      });

      // Generate Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekap Surat Tugas");

      // Header
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "No. Surat Tugas", key: "noSuratTugas", width: 30 },
        { header: "Tanggal Berangkat", key: "tanggalBerangkat", width: 20 },
        { header: "Tanggal Pulang", key: "tanggalPulang", width: 20 },
        { header: "Tujuan", key: "tujuan", width: 30 },
        { header: "Jenis Perjalanan", key: "jenisPerjalanan", width: 25 },
        { header: "Asal", key: "asal", width: 30 },
        { header: "Untuk", key: "untuk", width: 40 },
        { header: "Nama Pegawai 1", key: "namaPegawai1", width: 30 },
        { header: "Nama Pegawai 2", key: "namaPegawai2", width: 30 },
        { header: "Nama Pegawai 3", key: "namaPegawai3", width: 30 },
        { header: "Nama Pegawai 4", key: "namaPegawai4", width: 30 },
        { header: "Nama Pegawai 5", key: "namaPegawai5", width: 30 },
      ];

      // Data rows - one row per surat tugas
      let rowIndex = 0;
      filteredResult.forEach((perjalananItem) => {
        const personils = perjalananItem.personils || [];
        const tempats = perjalananItem.tempats || [];

        // Ambil tanggal berangkat dan pulang (gunakan yang pertama jika ada beberapa)
        let tanggalBerangkat = "-";
        let tanggalPulang = "-";
        if (tempats.length > 0) {
          const tempatPertama = tempats[0];
          tanggalBerangkat = formatTanggalIndonesia(
            tempatPertama.tanggalBerangkat
          );
          tanggalPulang = formatTanggalIndonesia(tempatPertama.tanggalPulang);
        }

        // Ambil tujuan (gabungkan jika ada beberapa, atau ambil yang pertama)
        let tujuan = "-";
        if (tempats.length > 0) {
          const tujuanList = tempats.map((tempatItem) => {
            if (tempatItem.dalamKota && tempatItem.dalamKota.nama) {
              return tempatItem.dalamKota.nama;
            }
            return tempatItem.tempat || "-";
          });
          tujuan = tujuanList.filter((t) => t !== "-").join(", ") || "-";
        }

        // Ambil jenis perjalanan
        const jenisPerjalanan =
          perjalananItem.jenisPerjalanan?.tipePerjalanan?.tipe || "-";

        // Ambil nama-nama personil (maksimal 5)
        const namaPegawai = personils
          .slice(0, 5)
          .map((p) => p.pegawai?.nama || "-")
          .filter((nama) => nama !== "-");

        rowIndex++;
        worksheet.addRow({
          no: rowIndex,
          noSuratTugas: perjalananItem?.noSuratTugas || "-",
          tanggalBerangkat: tanggalBerangkat,
          tanggalPulang: tanggalPulang,
          tujuan: tujuan,
          jenisPerjalanan: jenisPerjalanan,
          asal: perjalananItem?.asal || "-",
          untuk: perjalananItem?.untuk || "-",
          namaPegawai1: namaPegawai[0] || "-",
          namaPegawai2: namaPegawai[1] || "-",
          namaPegawai3: namaPegawai[2] || "-",
          namaPegawai4: namaPegawai[3] || "-",
          namaPegawai5: namaPegawai[4] || "-",
        });
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=rekap-surat-tugas.xlsx"
      );

      // Send Excel file
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getSPPD: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.query);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegiatanId = parseInt(req.query.subKegiatanId);
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pegawaiId = parseInt(req.query.pegawaiId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const offset = limit * page;
    const whereCondition = {};
    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};

    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    const whereConditionTempat = {};

    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }
    try {
      const result = await personil.findAll({
        limit,
        offset,
        subQuery: false,

        include: [
          {
            model: perjalanan,
            attributes: ["id", "noSuratTugas"],
            include: [
              {
                model: ttdNotaDinas,
                attributes: ["id", "unitKerjaId"],
                where: whereCondition,
              },
              {
                model: tempat,
                where: whereConditionTempat, // <- Filter terapkan di sini
                attributes: [
                  "id",
                  "tanggalBerangkat",
                  "tanggalPulang",
                  "tempat",
                ],
                include: [
                  {
                    model: dalamKota,
                    attributes: ["id", "nama"],
                    as: "dalamKota",
                  },
                ],
              },
              {
                model: jenisPerjalanan,
                attributes: ["id"],
                include: [
                  { model: tipePerjalanan, attributes: ["id", "tipe"] },
                ],
              },
              {
                model: daftarSubKegiatan,
                attributes: ["id", "subKegiatan"],
              },
            ],
            where: whereConditionPegawaiId,
          },
          { model: pegawai, attributes: ["nama", "nip"] },
        ],
        // attributes: ["id", "noNotaDinas", "noSuratTugas"],
      });

      const totalRows = await personil.count({
        // include: [
        //   {
        //     model: ttdNotaDinas,
        //     where: whereCondition,
        //   },
        //   {
        //     model: tempat,
        //     where: whereConditionTempat,
        //   },
        // ],
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postSPPD: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.body, "INI DARI FE");
    const transaction = await sequelize.transaction();
    const getRomanMonth = (date) => {
      const months = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ];
      return months[date.getMonth()];
    };
    try {
      const {
        jenisPerjalananId,
        tipePerjalananId,
        tempats,
        unitKerjaId,
        indukUnitKerjaFE,
        untuk,
        pegawaiIds,
        unitKerjaFE,
      } = req.body;

      const dbPerjalanan = await perjalanan.create(
        {
          untuk,
        },
        { transaction }
      );

      const dataPersonil = pegawaiIds.map((item) => ({
        perjalananId: dbPerjalanan.id,
        pegawaiId: parseInt(item),
        status: 1,
      }));
      await personil.bulkCreate(dataPersonil, { transaction });
      let dataKota = []; // Inisialisasi dataKota sebagai array kosong
      let dataDalamKota = [];

      if (tipePerjalananId === 2) {
        // Buat data kota tujuan
        dataKota = tempats.map((item) => ({
          perjalananId: dbPerjalanan.id,
          tempat: item.tempat,
          tanggalBerangkat: item.tanggalBerangkat,
          tanggalPulang: item.tanggalPulang,
          dalamKotaId: 1,
        }));

        await tempat.bulkCreate(dataKota, { transaction });
      } else if (tipePerjalananId === 1) {
        dataDalamKota = tempats.map((item) =>
          // console.log(item),
          ({
            perjalananId: dbPerjalanan.id,
            tempat: "dalam kota",
            dalamKotaId: item.dalamKotaId,
            tanggalBerangkat: item.tanggalBerangkat,
            tanggalPulang: item.tanggalPulang,
          })
        );
        await tempat.bulkCreate(dataDalamKota, { transaction });
      }

      const dbNoSPD = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId: indukUnitKerjaFE.id },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 3 } }],
      });

      let nomorAwalSPD = parseInt(dbNoSPD.nomorLoket);
      let noSpd;
      const codeNoSPD =
        unitKerjaFE.kode === indukUnitKerjaFE.kode
          ? indukUnitKerjaFE.kode
          : indukUnitKerjaFE.kode + "/" + unitKerjaFE.kode;

      noSpd = pegawaiIds.map((item, index) => ({
        nomorSPD: dbNoSPD.jenisSurat.nomorSurat
          .replace(
            "NOMOR",
            (indukUnitKerjaFE.id == 1
              ? "         "
              : nomorAwalSPD + index + 1
            ).toString()
          )
          .replace("KODE", codeNoSPD)
          .replace(
            "BULAN",
            getRomanMonth(new Date(tempats[0].tanggalBerangkat))
          ),
      }));

      await daftarNomorSurat.update(
        { nomorLoket: nomorAwalSPD + noSpd.length }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSPD.id }, transaction }
      );

      for (const [index, pegawaiId] of pegawaiIds.entries()) {
        await personil.update(
          {
            nomorSPD: noSpd[index].nomorSPD,
            statusId: 1,
          },
          {
            where: {
              perjalananId: dbPerjalanan.id,
              pegawaiId: parseInt(pegawaiId),
            },
            transaction,
          }
        );
      }
      await transaction.commit();
      return res.status(201).json({
        message: "SPPD berhasil dibuat",
        perjalananId: dbPerjalanan.id,
        nomorSPD: noSpd.map((n) => n.nomorSPD),
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getRekap: async (req, res) => {
    // Helper function to format date in Indonesian format
    const formatTanggalIndonesia = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      const months = [
        "januari",
        "februari",
        "maret",
        "april",
        "mei",
        "juni",
        "juli",
        "agustus",
        "september",
        "oktober",
        "november",
        "desember",
      ];
      const day = String(d.getDate()).padStart(2, "0");
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegiatanId = parseInt(req.query.subKegiatanId);

    const pegawaiId = parseInt(req.query.pegawaiId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;

    const whereCondition = {};
    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};

    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    const whereConditionTempat = {};

    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }

    try {
      const result = await perjalanan.findAll({
        subQuery: false,
        where: whereConditionSubKegiatan,
        include: [
          {
            model: personil,
            attributes: ["id", "nomorSPD"],
            include: [{ model: pegawai, attributes: ["nama", "nip"] }],
            where: whereConditionPegawaiId,
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId"],
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat, // <- Filter terapkan di sini
            attributes: ["id", "tanggalBerangkat", "tanggalPulang", "tempat"],
            include: [
              { model: dalamKota, attributes: ["id", "nama"], as: "dalamKota" },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
          },
        ],
        attributes: ["id", "noNotaDinas", "noSuratTugas"],
      });

      // Generate Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekap Perjalanan");

      // Header
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "No. Surat Tugas", key: "surtug", width: 35 },
        { header: "No. SPD", key: "spd", width: 35 },
        { header: "Tanggal Berangkat", key: "tanggalBerangkat", width: 21 },
        { header: "Tanggal Pulang", key: "tanggalPulang", width: 21 },
        { header: "Nama Pegawai", key: "namaPegawai", width: 35 },
        { header: "Sub Kegiatan", key: "subKegiatan", width: 35 },
        { header: "Tujuan", key: "tujuan", width: 25 },
      ];

      // Data rows - flatten personils and tempats to create one row per combination
      let rowIndex = 0;
      result.forEach((perjalananItem) => {
        const personils = perjalananItem.personils || [];
        const tempats = perjalananItem.tempats || [];
        const subKegiatan =
          perjalananItem.daftarSubKegiatan?.subKegiatan || "-";

        // If there are personils and tempats, create rows for each combination
        if (personils.length > 0 && tempats.length > 0) {
          personils.forEach((personilItem) => {
            tempats.forEach((tempatItem) => {
              rowIndex++;
              const tanggalBerangkat = formatTanggalIndonesia(
                tempatItem.tanggalBerangkat
              );
              const tanggalPulang = formatTanggalIndonesia(
                tempatItem.tanggalPulang
              );

              let tujuan = tempatItem.tempat || "-";
              if (tempatItem.dalamKota && tempatItem.dalamKota.nama) {
                tujuan = tempatItem.dalamKota.nama;
              }

              worksheet.addRow({
                no: rowIndex,
                surtug: perjalananItem?.noSuratTugas || "-",
                spd: personilItem?.nomorSPD || "-",
                tanggalBerangkat: tanggalBerangkat,
                tanggalPulang: tanggalPulang,
                namaPegawai: personilItem?.pegawai?.nama || "-",
                subKegiatan: subKegiatan,
                tujuan: tujuan,
              });
            });
          });
        } else if (personils.length > 0) {
          // If only personils exist, create rows with empty tempat data
          personils.forEach((personilItem) => {
            rowIndex++;
            worksheet.addRow({
              no: rowIndex,
              surtug: perjalananItem?.noSuratTugas || "-",
              spd: personilItem?.nomorSPD || "-",
              tanggalBerangkat: "-",
              tanggalPulang: "-",
              namaPegawai: personilItem?.pegawai?.nama || "-",
              subKegiatan: subKegiatan,
              tujuan: "-",
            });
          });
        }
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=rekap-perjalanan.xlsx"
      );

      // Send Excel file
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
