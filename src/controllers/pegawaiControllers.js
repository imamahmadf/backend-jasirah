const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  perjalanan,
  personil,
  rincianBPD,
  jenisPerjalanan,
  sequelize,
  rill,
  tempat,
  dalamKota,
  profesi,
  statusPegawai,
  indukUnitKerja,
  usulanPegawai,
  riwayatPegawai,
  user,
  profile,
  userRole,
  daftarNomorSurat,
  jenisSurat,
} = require("../models");

const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
module.exports = {
  getPegawaiStatistik: async (req, res) => {
    try {
      const result = await pegawai.findAll({
        attributes: [
          "unitKerjaId",
          "profesiId",
          "statusPegawaiId",
          [sequelize.fn("COUNT", sequelize.col("pegawai.id")), "jumlah"],
        ],
        where: {
          // PNS=1, CPNS=2, P3K=3, P3K Paruh Waktu=4, PJLP=5
          statusPegawaiId: { [Op.in]: [1, 2, 3, 4, 5] },
        },
        group: ["unitKerjaId", "profesiId", "statusPegawaiId"],
        include: [
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["unitKerja"],
          },
          {
            model: profesi,
            as: "profesi",
            attributes: ["nama"],
          },
          {
            model: statusPegawai,
            as: "statusPegawai",
            attributes: ["status"],
          },
        ],
      });

      // Mengelompokkan data berdasarkan unitKerjaId
      const groupedData = result.reduce((acc, curr) => {
        const unitKerjaId = curr.unitKerjaId;
        if (!acc[unitKerjaId]) {
          acc[unitKerjaId] = {
            unitKerjaId,
            namaUnitKerja: curr.daftarUnitKerja.unitKerja,
            totalPegawai: 0,
            statusPegawai: {},
            profesi: {},
          };
        }

        // Menambah total pegawai
        acc[unitKerjaId].totalPegawai += parseInt(curr.getDataValue("jumlah"));

        // Menambah jumlah per status pegawai
        const statusPegawai = curr.statusPegawai.status;
        if (!acc[unitKerjaId].statusPegawai[statusPegawai]) {
          acc[unitKerjaId].statusPegawai[statusPegawai] = 0;
        }
        acc[unitKerjaId].statusPegawai[statusPegawai] += parseInt(
          curr.getDataValue("jumlah")
        );

        // Menambah jumlah per profesi
        const profesiId = curr.profesiId;
        if (!acc[unitKerjaId].profesi[profesiId]) {
          acc[unitKerjaId].profesi[profesiId] = {
            namaProfesi: curr.profesi.nama,
            jumlah: {},
          };
        }

        acc[unitKerjaId].profesi[profesiId].jumlah[statusPegawai] =
          curr.getDataValue("jumlah");

        return acc;
      }, {});

      return res.status(200).json({ result: Object.values(groupedData) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getPegawaiUnitKerja: async (req, res) => {
    const indukUnitKerjaId = req.params.id;

    const whereCondition = {};

    if (indukUnitKerjaId) {
      whereCondition.indukUnitKerjaId = indukUnitKerjaId;
    }

    try {
      const result = await pegawai.findAll({
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `ASC`],
        ],
        attributes: ["id", "nama", "nip", "jabatan", "pendidikan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
          { model: profesi, as: "profesi" },
          { model: statusPegawai, as: "statusPegawai" },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja", "indukUnitKerjaId"],
            where: whereCondition,
          },
        ],
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
  getPegawai: async (req, res) => {
    try {
      const result = await pegawai.findAll({
        attributes: ["id", "nama", "nip", "jabatan", "profesiId"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
        ],
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
  getPegawaiKadis: async (req, res) => {
    try {
      const result = await pegawai.findAll({
        attributes: ["id", "nama", "nip", "jabatan", "profesiId"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
        ],
        where: { profesiId: 1 },
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
  getDaftarPegawai: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const statusPegawaiId = parseInt(req.query.statusPegawaiId);
    const profesiId = parseInt(req.query.profesiId);
    const golonganId = parseInt(req.query.golonganId);
    const tingkatanId = parseInt(req.query.tingkatanId);
    const pangkatId = parseInt(req.query.pangkatId);
    const search = req.query.search_query || "";
    const filterPendidikan = req.query.filterPendidikan || "";
    const filterNip = req.query.filterNip || "";
    const filterJabatan = req.query.filterJabatan || "";
    const alfabet = req.query.alfabet || "ASC";
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log(req.query);
    const whereCondition = {
      nama: { [Op.like]: "%" + search + "%" },
      nip: { [Op.like]: "%" + filterNip + "%" },
      jabatan: { [Op.like]: "%" + filterJabatan + "%" },
      pendidikan: { [Op.like]: "%" + filterPendidikan + "%" },
    };

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    if (profesiId) {
      whereCondition.profesiId = profesiId;
    }

    if (statusPegawaiId) {
      whereCondition.statusPegawaiId = statusPegawaiId;
    }
    if (pangkatId) {
      whereCondition.pangkatId = pangkatId;
    }
    if (golonganId) {
      whereCondition.golonganId = golonganId;
    }
    if (tingkatanId) {
      whereCondition.tingkatanId = tingkatanId;
    }
    try {
      const result = await pegawai.findAll({
        where: whereCondition,
        offset,
        limit,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `${alfabet}`],
        ],
        attributes: ["id", "nama", "nip", "jabatan", "pendidikan", "nik"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: statusPegawai, as: "statusPegawai" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: profesi, as: "profesi" },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja"],
          },
        ],
      });
      const totalRows = await pegawai.count({
        where: whereCondition,
        offset,
        limit,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `${alfabet}`],
        ],
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getOnePegawai: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pegawai.findOne({
        where: { id },
        attributes: ["id", "nama", "nip", "nik", "jabatan", "pendidikan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          {
            model: profesi,
            as: "profesi",
            attributes: ["nama", "id"],
          },
          {
            model: statusPegawai,
            as: "statusPegawai",
            attributes: ["status", "id"],
          },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja"],
          },
          {
            model: riwayatPegawai,
            include: [
              { model: daftarGolongan, as: "golongan" },
              { model: daftarPangkat, as: "pangkat" },
              {
                model: profesi,
                as: "profesiLama",
                attributes: ["nama", "id"],
              },

              {
                model: daftarUnitKerja,
                as: "unitKerjaLama",
                attributes: ["id", "unitKerja"],
              },
            ],
          },
        ],
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
  getSeedPegawai: async (req, res) => {
    try {
      const resultGolongan = await daftarGolongan.findAll({});
      const resultPangkat = await daftarPangkat.findAll({});
      const resultTingkatan = await daftarTingkatan.findAll({});
      const resultStatusPegawai = await statusPegawai.findAll({});
      const resultUnitKerja = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });
      const resultProfesi = await profesi.findAll({});

      return res.status(200).json({
        resultGolongan,
        resultPangkat,
        resultTingkatan,
        resultStatusPegawai,
        resultUnitKerja,
        resultProfesi,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  editPegawai: async (req, res) => {
    const { id, dataPegawai } = req.body;
    console.log(req.body);
    try {
      const result = await pegawai.update(
        {
          nama: dataPegawai.nama,
          jabatan: dataPegawai.jabatan,
          nip: dataPegawai.nip,
          nik: dataPegawai.nik,
          golonganId: dataPegawai.daftarGolongan.id,
          tingkatanId: dataPegawai.daftarTingkatan.id,
          pangkatId: dataPegawai.daftarPangkat.id,
          unitKerjaId: dataPegawai.daftarUnitKerja.id,
        },
        { where: { id } }
      );

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  addPegawai: async (req, res) => {
    const {
      nama,
      nip,
      nik,
      jabatan,
      pangkatId,
      golonganId,
      tingkatanId,
      unitKerjaId,
      statusPegawaiId,
      profesiId,
      pendidikan,
      tanggalTMT,
    } = req.body;
    console.log(req.body);
    const transaction = await sequelize.transaction();
    const nipBaru = nip.replace(/\s+/g, "");
    const nikBaru = nik.replace(/\s+/g, "");
    const password = "paserkab";

    // Validasi tanggalTMT: jika kosong atau tidak valid, set ke null
    let validatedTanggalTMT = null;
    if (tanggalTMT && tanggalTMT.trim() !== "") {
      const dateObj = new Date(tanggalTMT);
      if (!isNaN(dateObj.getTime())) {
        validatedTanggalTMT = dateObj;
      }
    }

    try {
      const result = await pegawai.create(
        {
          nama,
          jabatan,
          nip,
          nik,
          golonganId,
          tingkatanId,
          pangkatId,
          unitKerjaId,
          statusPegawaiId,
          profesiId,
          pendidikan,
          tanggalTMT: validatedTanggalTMT,
        },
        { transaction }
      );
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await user.findOne({ where: { nama } });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      if (
        statusPegawaiId === 1 ||
        statusPegawaiId === 2 ||
        statusPegawaiId === 3 ||
        statusPegawaiId === 4 ||
        statusPegawaiId === 5
      ) {
        const newUser = await user.create(
          {
            nama,
            namaPengguna: statusPegawaiId === 5 ? nikBaru : nipBaru,
            password: hashedPassword,
          },
          { transaction }
        );

        const newProfile = await profile.create(
          {
            nama,
            userId: newUser.id,
            unitKerjaId,
            pegawaiId: result.id,
          },
          { transaction }
        );

        const newUserRole = await userRole.create(
          {
            userId: newUser.id,
            roleId: 9,
          },
          { transaction }
        );
      }

      await transaction.commit();
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      await transaction.rollback();
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getDetailPegawai: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log("TES FRONT END11");
    try {
      const result = await pegawai.findAll({
        include: [
          {
            offset,
            limit,
            model: personil,
            attributes: ["id", "nomorSPD", "statusId"],
            where: { statusId: 3 },
            include: [
              {
                model: perjalanan,
                attributes: ["id"],

                include: [
                  {
                    model: jenisPerjalanan,
                    attributes: ["id", "jenis"],
                  },
                  {
                    model: tempat,
                    attributes: [
                      "id",
                      "tempat",
                      "tanggalBerangkat",
                      "tanggalPulang",
                    ],
                    include: [
                      {
                        model: dalamKota,
                        as: "dalamKota",
                        attributes: ["id", "nama"],
                      },
                    ],
                  },
                ],
              },
              { model: rincianBPD },
            ],
          },
        ],
        where: { id },
      });

      const totalRows = await pegawai.count({
        include: [{ model: personil }],
        where: { id },
      });
      const totalPage = Math.ceil(totalRows / limit);

      // Menyusun data sesuai permintaan
      const response = result.map((pegawai) => ({
        nama: pegawai.nama,
        nip: pegawai.nip,
        jabatan: pegawai.jabatan,
        personils: pegawai.personils.map((personil) => ({
          id: personil.id,
          nomorSPD: personil.nomorSPD,
          tujuan:
            personil.perjalanan.jenisPerjalanan.jenis ===
            "Perjalanan Dinas Biasa"
              ? personil.perjalanan.tempats.map((tempat) => tempat.tempat)
              : personil.perjalanan.tempats.map(
                  (tempat) => tempat.dalamKota.nama
                ),
          tanggalBerangkat:
            personil.perjalanan.tempats[0]?.tanggalBerangkat || null,
          tanggalPulang:
            personil.perjalanan.tempats[personil.perjalanan.tempats.length - 1]
              ?.tanggalPulang || null,
          totaluang:
            personil.statusId === 3 && personil.rincianBPDs
              ? personil.rincianBPDs.reduce(
                  (total, rincian) => total + rincian.nilai,
                  0
                )
              : 0,
        })),
      }));

      return res
        .status(200)
        .json({ result: response, page, limit, totalRows, totalPage });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  searchPegawai: async (req, res) => {
    try {
      const { q } = req.query;

      const result = await pegawai.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },
        attributes: [
          "id",
          "nama",
          "nip",
          "statusPegawaiId",
          "nik",
          "unitKerjaId",
        ],
        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  getDownloadPegawai: async (req, res) => {
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId);

    console.log(req.query);
    const whereCondition = {};

    if (indukUnitKerjaId) {
      whereCondition.indukUnitKerjaId = indukUnitKerjaId;
    }

    try {
      const result = await pegawai.findAll({
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `ASC`],
        ],
        attributes: ["id", "nama", "nip", "jabatan", "pendidikan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: statusPegawai, as: "statusPegawai" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: profesi, as: "profesi" },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja"],
            where: whereCondition,
          },
        ],
      });

      // Generate Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Pegawai");

      // Header
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama", key: "nama", width: 30 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "Jabatan", key: "jabatan", width: 25 },
        { header: "Pangkat", key: "pangkat", width: 25 },
        { header: "Golongan", key: "golongan", width: 25 },
        { header: "Profesi", key: "profesi", width: 25 },
        { header: "Pendidikan", key: "pendidikan", width: 20 },
        { header: "Status pegawai", key: "status", width: 20 },
        { header: "Unit Kerja", key: "unitKerja", width: 25 },
      ];

      // Data rows
      result.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          nama: item.nama,
          nip: item.nip,
          jabatan: item.jabatan,
          pangkat: item.daftarPangkat?.pangkat || "-",
          golongan: item.daftarGolongan?.golongan || "-",
          status: item.statusPegawai?.status || "-",
          profesi: item.profesi.nama || "-",
          pendidikan: item.pendidikan,
          unitKerja: item.daftarUnitKerja?.unitKerja || "-",
        });
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=data-pegawai.xlsx"
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
  getPegawaiBatch: async (req, res) => {
    try {
      const { ids } = req.body; // array of pegawaiId
      const result = await pegawai.findAll({
        where: { id: ids },
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          {
            model: daftarUnitKerja,
            as: "daftarUnitKerja",
            attributes: ["id", "unitKerja"],
          },
        ],
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.toString(),
      });
    }
  },
  editPersonil: async (req, res) => {
    try {
      const { personilId, pegawaiBaruId, pegawaiLamaId } = req.body;
      const result = await personil.update(
        { pegawaiId: pegawaiBaruId },
        { where: { id: personilId } }
      );
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.toString(),
      });
    }
  },

  hapusPersonil: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await personil.destroy({ where: { id } });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.toString(),
      });
    }
  },

  tambahPersonil: async (req, res) => {
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
        perjalananId,
        pegawaiId,
        indukUnitKerjaId,
        kode,
        tanggalPengajuan,
      } = req.body;
      let noSpd;

      const dbNoSPD = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 3 } }],
        transaction,
      });

      if (!dbNoSPD) {
        throw new Error("Data nomor surat tidak ditemukan.");
      }

      let nomorAwalSPD = parseInt(dbNoSPD.nomorLoket);
      noSpd = dbNoSPD.jenisSurat.nomorSurat
        .replace("NOMOR", (nomorAwalSPD + 1).toString())
        .replace("KODE", kode)
        .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan)));

      await daftarNomorSurat.update(
        { nomorLoket: nomorAwalSPD + 1 }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSPD.id }, transaction }
      );

      await personil.create({
        pegawaiId,
        statusId: 1,
        perjalananId,
        nomorSPD: noSpd,
      });

      await transaction.commit();
      return res.status(200).json({ success: true });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.toString(),
      });
    }
  },
  uploadBerkas: async (req, res) => {
    const { id, pegawaiId } = req.body;
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      await usulanPegawai.create({
        dokumen: `/pegawai/${req.file.filename}`, // Nama asli
        status: 0,
        pegawaiId,
      });

      return res.status(200).json({
        message: "File template berhasil diunggah",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getDokumen: async (req, res) => {
    const pegawaiId = req.params.id;

    try {
      const result = await usulanPegawai.findOne({ where: { pegawaiId } });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getUsulan: async (req, res) => {
    try {
      const result = await usulanPegawai.findAll({
        include: [
          {
            model: pegawai,
            attributes: [
              "id",
              "nama",
              "pendidikan",
              "nip",
              "jabatan",
              "tanggalTMT",
            ],
            include: [
              {
                model: daftarTingkatan,
                as: "daftarTingkatan",
              },
              { model: daftarGolongan, as: "daftarGolongan" },
              { model: daftarPangkat, as: "daftarPangkat" },
              {
                model: profesi,
                as: "profesi",
                attributes: ["nama", "id"],
              },
              {
                model: statusPegawai,
                as: "statusPegawai",
                attributes: ["status", "id"],
              },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id", "unitKerja"],
              },
              {
                model: personil,
                attributes: ["id"],
                include: [{ model: rincianBPD }],
              },
            ],
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  mutasiPegawai: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { pegawaiId, unitKerjaId, unitKerjaIdLama } = req.body;
      const result = await pegawai.update(
        { unitKerjaId },
        { where: { id: pegawaiId }, transaction }
      );

      const resultProfil = await profile.update(
        { unitKerjaId },
        { where: { pegawaiId }, transaction }
      );

      await transaction.commit();
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: err.toString(),
      });
    }
  },
};
