const {
  SP,
  akunBelanja,
  barjas,
  dokumenBarjas,
  jenisDokumenBarjas,
  rekanan,
  jenisBelanja,
  jenisBarjas,
  subKegPer,
  nomorSP,

  indukUnitKerja,
  daftarUnitKerja,
  sequelize,
  itemDokumenBarjas,
  kendaraan,
  bangunan,
  persediaan,
  stokMasuk,
} = require("../models");

const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

module.exports = {
  postSP: async (req, res) => {
    const {
      tanggal,
      rekananId,
      akunBelanjaId,
      subKegPerId,
      indukUnitKerjaId,
      nomorSPId,
      unitKerjaId,
      nomorSPManual,
    } = req.body;
    const transaction = await sequelize.transaction();
    console.log(req.body);
    try {
      let nomorSuratBaru;

      if (!nomorSPManual) {
        // 1️⃣ Ambil nomor terakhir dengan lock untuk menghindari race condition
        const nomorAwal = await nomorSP.findOne({
          where: { id: nomorSPId },
          transaction,
          lock: true, // lock row untuk menghindari race condition
        });

        if (!nomorAwal) {
          throw new Error(
            "Nomor loket belum diinisialisasi untuk unit kerja ini"
          );
        }

        // 2️⃣ Hitung nomor baru
        const nomorTerbaru = nomorAwal.nomorLoket + 1;

        // 3️⃣ Update nomor berikutnya
        await nomorSP.update(
          { nomorLoket: nomorTerbaru },
          { where: { id: nomorAwal.id }, transaction }
        );

        // 4️⃣ Format nomor surat dengan nomor terbaru
        nomorSuratBaru = nomorAwal.nomorSurat
          .replace("NOMOR", nomorTerbaru)
          .replace("TAHUN", new Date(tanggal).getFullYear());
      }

      // 4️⃣ Buat entri SP baru
      const result = await SP.create(
        {
          nomor: nomorSPManual ? nomorSPManual : nomorSuratBaru,
          tanggal,
          rekananId,
          akunBelanjaId,
          subKegPerId,
          nomorSPId,
          unitKerjaId,
        },
        { transaction }
      );

      // 5️⃣ Commit transaksi
      await transaction.commit();
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDokumen: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await SP.findOne({
        where: { id },
        include: [
          {
            model: dokumenBarjas,
            include: [
              { model: jenisDokumenBarjas },
              {
                model: itemDokumenBarjas,
                attributes: ["id", "jumlah", "barjasId"],
                include: [
                  {
                    model: barjas,
                    attributes: ["id", "nama", "jumlah", "harga"],
                  },
                ],
              },
            ],
          },
          { model: rekanan },
          { model: akunBelanja, include: [{ model: jenisBelanja }] },
          { model: barjas, include: [{ model: jenisBarjas }] },
          {
            model: subKegPer,
            paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
            include: [
              { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
            ],
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getSeed: async (req, res) => {
    const id = req.params.id;
    const { indukUnitKerjaId } = req.body;
    console.log(req.body, id, "ini dr FE");
    try {
      const resultAkunBelanja = await akunBelanja.findAll({
        include: [{ model: jenisBelanja }],
      });
      const resultNomorSP = await nomorSP.findAll({
        include: [
          {
            model: indukUnitKerja,
            attributes: ["id"],
            required: true,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id"],
                where: { id },
                required: true,
              },
            ],
          },
        ],
      });
      // const resultUnitKerja = await daftarUnitKerja.findAll({
      //   attributes: ["id", "unitKerja"],
      // });
      return res.status(200).json({ resultNomorSP, resultAkunBelanja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postDokumenBarjas: async (req, res) => {
    const {
      tanggal,
      nomor,
      SPId,
      jenisDokumenBarjasId,
      indukUnitKerjaId,
      barjasData, // array of objects: [{ barjasId, jumlah }]
    } = req.body;

    const transaction = await sequelize.transaction();
    try {
      // 1️⃣ Ambil nomor awal dari jenis dokumen
      const nomorAwal = await jenisDokumenBarjas.findOne({
        where: { id: jenisDokumenBarjasId, indukUnitKerjaId },
        transaction,
      });

      if (!nomorAwal) {
        throw new Error("Jenis dokumen tidak ditemukan.");
      }

      // 2️⃣ Update nomor loket +1
      const nomorTerbaru = nomorAwal.nomorLoket + 1;
      await jenisDokumenBarjas.update(
        { nomorLoket: nomorTerbaru },
        { where: { id: nomorAwal.id }, transaction }
      );

      // 3️⃣ Format nomor surat terbaru
      const nomorSuratTerbaru = nomorAwal.nomorSurat
        .replace("NOMOR", nomorTerbaru)
        .replace("TAHUN", new Date(tanggal).getFullYear());

      // 4️⃣ Simpan dokumen utama
      const dokumen = await dokumenBarjas.create(
        {
          tanggal,
          nomor: nomorSuratTerbaru,
          SPId,
          jenisDokumenBarjasId,
        },
        { transaction }
      );

      // 5️⃣ Siapkan data item dokumen dari array barjasData
      if (Array.isArray(barjasData) && barjasData.length > 0) {
        const items = barjasData.map((item) => ({
          dokumenBarjasId: dokumen.id, // foreign key ke dokumenBarjas
          barjasId: item.barjasId, // pastikan kolom di model sesuai
          jumlah: item.jumlah,
        }));

        // 6️⃣ Simpan semua item sekaligus
        await itemDokumenBarjas.bulkCreate(items, { transaction });
      }

      // 7️⃣ Commit transaksi
      await transaction.commit();

      return res.status(201).json({
        message: "Dokumen dan item berhasil disimpan",
        dokumen,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Error simpan dokumenBarjas:", err);
      res.status(500).json({ error: err.message });
    }
  },

  editDokumenBarjas: async (req, res) => {
    const { id, tanggal } = req.body;

    try {
      if (!id) {
        return res.status(400).json({ error: "id wajib diisi" });
      }

      const dokumen = await dokumenBarjas.findOne({ where: { id } });
      if (!dokumen) {
        return res.status(404).json({ error: "Dokumen tidak ditemukan" });
      }

      const tanggalBaru = tanggal ?? dokumen.tanggal;

      // Jika nomor mengandung tahun 4 digit, sesuaikan dengan tahun dari tanggal baru.
      const tahunBaru =
        tanggalBaru && !Number.isNaN(new Date(tanggalBaru).getTime())
          ? String(new Date(tanggalBaru).getFullYear())
          : null;

      let nomorBaru = dokumen.nomor;
      if (tahunBaru && typeof nomorBaru === "string") {
        // Prefer mengganti 4 digit tahun paling akhir jika ada, fallback ke digit pertama yang cocok.
        if (/\d{4}\s*$/.test(nomorBaru)) {
          nomorBaru = nomorBaru.replace(/\d{4}\s*$/, tahunBaru);
        } else if (/\d{4}/.test(nomorBaru)) {
          nomorBaru = nomorBaru.replace(/\d{4}/, tahunBaru);
        }
      }

      await dokumenBarjas.update(
        {
          tanggal: tanggalBaru,
          nomor: nomorBaru,
        },
        { where: { id } }
      );

      const result = await dokumenBarjas.findOne({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  postBarjas: async (req, res) => {
    const { data } = req.body; // array of object
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Data tidak boleh kosong" });
      }

      const result = await barjas.bulkCreate(data, {
        validate: true, // pastikan semua record divalidasi sesuai model
      });

      return res.status(201).json({
        message: `${result.length} dokumen berhasil disimpan`,
        result,
      });
    } catch (err) {
      console.error("Error simpan dokumenBarjas:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegPerId = parseInt(req.query.subKegPerId);
    const nomor = parseInt(req.query.nomor) || "";
    const whereCondition = { nomor: { [Op.like]: "%" + nomor + "%" } };
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId);

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (subKegPerId) {
      whereCondition.subKegPerId = subKegPerId;
    }

    // Siapkan include untuk subKegPer dengan filter indukUnitKerjaId
    const subKegPerInclude = {
      model: subKegPer,
      attributes: ["id", "nama"],
      paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
      include: [
        {
          model: daftarUnitKerja,
          attributes: ["id", "unitKerja"],
        },
      ],
    };

    // Jika indukUnitKerjaId ada, tambahkan filter
    if (indukUnitKerjaId) {
      subKegPerInclude.include[0].where = { indukUnitKerjaId };
      subKegPerInclude.required = true;
    }

    try {
      const result = await SP.findAll(
        {
          limit,
          where: whereCondition,
          offset,
          include: [
            {
              model: dokumenBarjas,
              include: [{ model: jenisDokumenBarjas }],
              attributes: ["id"],
            },
            { model: rekanan },
            { model: akunBelanja, include: [{ model: jenisBelanja }] },
            {
              model: barjas,
              include: [{ model: jenisBarjas, attributes: ["id"] }],
              attributes: ["id", "jumlah", "harga"],
            },
            // { model: nomorSP },
            subKegPerInclude,
          ],
        }
        // { where: { id } }
      );
      const totalRows = await SP.count({
        where: whereCondition,
        include: indukUnitKerjaId
          ? [
              {
                model: subKegPer,
                required: true,
                paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
                include: [
                  {
                    model: daftarUnitKerja,
                    where: { indukUnitKerjaId },
                    required: true,
                  },
                ],
              },
            ]
          : [],
      });
      const totalPage = Math.ceil(totalRows / limit);
      // 2. Ambil semua ID unik dari pegawaiId dan PJId

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  searchSubKegiatan: async (req, res) => {
    try {
      const { q, indukUnitKerjaId } = req.query;

      const result = await subKegPer.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },
        attributes: ["id", "nama", "unitKerjaId"],
        required: true,
        paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            required: true,
            where: { indukUnitKerjaId },
          },
        ],
        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
  searchRekanan: async (req, res) => {
    try {
      const { q } = req.query;

      const result = await rekanan.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },

        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  getDetilSeed: async (req, res) => {
    try {
      const resultJenisBarjas = await jenisBarjas.findAll({});
      const resultJenisDokumenBarjas = await jenisDokumenBarjas.findAll({});

      return res
        .status(200)
        .json({ resultJenisBarjas, resultJenisDokumenBarjas });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postRekanan: async (req, res) => {
    const nama = req.body.nama;
    try {
      const result = await rekanan.create({ nama });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDownloadBarjas: async (req, res) => {
    try {
      // Ambil semua dokumen barjas dengan relasi yang diperlukan
      const result = await dokumenBarjas.findAll({
        include: [
          {
            model: jenisDokumenBarjas,
            attributes: ["id", "jenis"],
          },
          {
            model: SP,
            attributes: ["id", "nomor", "tanggal"],
            include: [
              {
                model: rekanan,
                attributes: ["id", "nama"],
              },
              {
                model: akunBelanja,
                attributes: ["id", "akun", "kode"],
                include: [
                  {
                    model: jenisBelanja,
                    attributes: ["id", "jenis"],
                  },
                ],
              },
              {
                model: subKegPer,
                attributes: ["id", "nama"],
                paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
                include: [
                  {
                    model: daftarUnitKerja,
                    attributes: ["id", "unitKerja"],
                  },
                ],
              },
            ],
          },
          {
            model: itemDokumenBarjas,
            attributes: ["id", "jumlah", "barjasId"],
            include: [
              {
                model: barjas,
                attributes: ["id", "nama", "harga"],
              },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      // Generate Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekapan Barjas");

      // Header
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nomor Dokumen Barjas", key: "nomorDokumen", width: 30 },
        { header: "Jenis Dokumen Barjas", key: "jenisDokumen", width: 25 },
        { header: "Nomor SP", key: "nomorSP", width: 30 },
        { header: "Tanggal SP", key: "tanggalSP", width: 20 },
        { header: "Subkegiatan", key: "subkegiatan", width: 30 },
        { header: "Jenis Belanja", key: "jenisBelanja", width: 20 },
        { header: "Akun Belanja", key: "akunBelanja", width: 20 },
        { header: "Unit Kerja", key: "unitKerja", width: 30 },
        { header: "Nama Rekanan", key: "namaRekanan", width: 30 },
        { header: "Total Jumlah", key: "totalJumlah", width: 15 },
        { header: "Total Harga", key: "totalHarga", width: 20 },
      ];

      // Data rows - setiap item dokumen barjas menjadi satu baris
      let rowIndex = 0;
      result.forEach((dokumen) => {
        const nomorDokumen = dokumen?.nomor || "-";
        const jenisDokumen = dokumen?.jenisDokumenBarjas?.jenis || "-";
        const nomorSP = dokumen?.SP?.nomor || "-";
        const tanggalSP = dokumen?.SP?.tanggal
          ? new Date(dokumen.SP.tanggal).toLocaleDateString("id-ID")
          : "-";
        const subkegiatan = dokumen?.SP?.subKegPer?.nama || "-";
        const jenisBelanja =
          dokumen?.SP?.akunBelanja?.jenisBelanja?.jenis || "-";
        const akunBelanja = dokumen?.SP?.akunBelanja?.akun || "-";
        const unitKerja =
          dokumen?.SP?.subKegPer?.daftarUnitKerja?.unitKerja || "-";
        const namaRekanan = dokumen?.SP?.rekanan?.nama || "-";

        // Jika ada item dokumen barjas, buat baris untuk setiap item
        if (
          dokumen?.itemDokumenBarjas &&
          dokumen.itemDokumenBarjas.length > 0
        ) {
          dokumen.itemDokumenBarjas.forEach((item) => {
            const jumlah = item?.jumlah || 0;
            const harga = item?.barjas?.harga || 0;
            const totalHarga = jumlah * harga;

            worksheet.addRow({
              no: rowIndex + 1,
              nomorDokumen,
              jenisDokumen,
              nomorSP,
              tanggalSP,
              subkegiatan,
              jenisBelanja,
              akunBelanja,
              unitKerja,
              namaRekanan,
              totalJumlah: jumlah,
              totalHarga: totalHarga,
            });
            rowIndex++;
          });
        } else {
          // Jika tidak ada item, tetap buat baris dengan data dokumen
          worksheet.addRow({
            no: rowIndex + 1,
            nomorDokumen,
            jenisDokumen,
            nomorSP,
            tanggalSP,
            subkegiatan,
            jenisBelanja,
            akunBelanja,
            unitKerja,
            namaRekanan,
            totalJumlah: 0,
            totalHarga: 0,
          });
          rowIndex++;
        }
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=rekapan-barjas.xlsx"
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

  postAkunBelanja: async (req, res) => {
    const { akun, kode } = req.body;
    try {
      const result = await akunBelanja.create({ akun, kode });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getJenisDokumen: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await jenisDokumenBarjas.findAll({
        where: { indukUnitKerjaId: id },
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postJenisDokumen: async (req, res) => {
    const { jenis, indukUnitKerjaId, nomorSurat } = req.body;
    try {
      const result = await jenisDokumenBarjas.create({
        jenis,
        nomorSurat,
        nomorLoket: 0,
        indukUnitKerjaId,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editJenisDokumen: async (req, res) => {
    const { jenis, indukUnitKerjaId, nomorSurat, id, nomorLoket } = req.body;
    try {
      const result = await jenisDokumenBarjas.update(
        {
          jenis,
          indukUnitKerjaId,
          nomorSurat,

          nomorLoket,
        },
        { where: { id } }
      );

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postJenisBarjas: async (req, res) => {
    const { jenis } = req.body;
    try {
      const result = await jenisBarjas.create({ jenis });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postAkunBelanja: async (req, res) => {
    const { akun, jenisBelanjaId } = req.body;
    try {
      const result = await akunBelanja.create({ akun, jenisBelanjaId });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postJenisBelanja: async (req, res) => {
    const { jenis } = req.query;
    try {
      const result = await jenisBelanja.create({ jenis });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getPengaturan: async (req, res) => {
    try {
      const resultJenisBarjas = await jenisBarjas.findAll();
      const resultAkunBelanja = await akunBelanja.findAll({
        include: [{ model: jenisBelanja }],
      });
      const resultJenisBelanja = await jenisBelanja.findAll();

      return res
        .status(200)
        .json({ resultJenisBarjas, resultAkunBelanja, resultJenisBelanja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editNomorSP: async (req, res) => {
    const { nomorSurat, id } = req.body;
    try {
      const result = await nomorSP.update({ nomorSurat }, { where: { id } });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteBarjas: async (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    try {
      const result = await barjas.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteSP: async (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    try {
      const result = await SP.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getNomorSP: async (req, res) => {
    const { id } = req.query;

    try {
      const result = await nomorSP.findAll({ where: { indukUnitKerjaId: id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postNomorSP: async (req, res) => {
    const { indukUnitKerjaId, nomorSurat } = req.body;

    try {
      const result = await nomorSP.create({
        indukUnitKerjaId,
        nomorSurat,
        nomorLoket: 0,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editNomorSP: async (req, res) => {
    const { id, nomorSurat, nomorLoket } = req.body;

    try {
      const result = await nomorSP.update(
        {
          nomorSurat,
          nomorLoket,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDashboardAset: async (req, res) => {
    try {
      const { indukUnitKerjaId } = req.query;

      // Siapkan where condition untuk filter indukUnitKerja jika ada
      const whereConditionBarjas = {};
      const whereConditionKendaraan = {};
      const whereConditionBangunan = {};
      const whereConditionPersediaan = {};

      // Filter berdasarkan indukUnitKerjaId jika ada
      let barjasInclude = [];
      let kendaraanInclude = [];

      if (indukUnitKerjaId) {
        whereConditionBangunan.indukUnitKerjaId = parseInt(indukUnitKerjaId);

        // Untuk barjas, filter melalui subKegPer -> daftarUnitKerja
        barjasInclude = [
          {
            model: subKegPer,
            required: true,
            paranoid: true,
            attributes: ["id", "nama", "kode", "kegiatanId", "unitKerjaId"],
            include: [
              {
                model: daftarUnitKerja,
                where: { indukUnitKerjaId: parseInt(indukUnitKerjaId) },
                required: true,
                attributes: [
                  "id",
                  "unitKerja",
                  "kode",
                  "asal",
                  "indukUnitKerjaId",
                ],
              },
            ],
          },
        ];

        // Untuk kendaraan, filter melalui daftarUnitKerja
        kendaraanInclude = [
          {
            model: daftarUnitKerja,
            as: "kendaraanUK",
            where: { indukUnitKerjaId: parseInt(indukUnitKerjaId) },
            required: true,
            attributes: ["id", "unitKerja", "kode", "asal", "indukUnitKerjaId"],
          },
        ];
      }

      // 1. Statistik Barjas (Barang dan Jasa)
      // Include jenisBelanja untuk membedakan barang dan jasa
      // Gabungkan include untuk jenisBelanja dengan filter indukUnitKerjaId
      const spIncludeBase = [
        {
          model: akunBelanja,
          required: true,
          include: [
            {
              model: jenisBelanja,
              required: true,
              attributes: ["id", "jenis"],
            },
          ],
          attributes: ["id", "akun", "kode", "jenisBelanjaId"],
        },
      ];

      // Jika ada filter indukUnitKerjaId, tambahkan include subKegPer
      const spIncludeWithFilter =
        barjasInclude.length > 0
          ? [...spIncludeBase, ...barjasInclude]
          : spIncludeBase;

      const totalSP = await SP.count({
        where: whereConditionBarjas,
        include: spIncludeWithFilter,
      });

      const totalBarjas = await barjas.count({
        include: [
          {
            model: SP,
            required: true,
            include: spIncludeWithFilter,
          },
        ],
      });

      // Hitung total nilai barjas dengan include jenisBelanja
      const barjasData = await barjas.findAll({
        attributes: [
          "harga",
          "jumlah",
          [sequelize.literal("harga * jumlah"), "totalNilai"],
        ],
        include: [
          {
            model: SP,
            required: true,
            include: spIncludeWithFilter,
          },
        ],
      });

      // Pisahkan barjas berdasarkan jenis belanja (barang vs jasa)
      let totalNilaiBarjasBarang = 0;
      let totalNilaiBarjasJasa = 0;
      let totalBarjasBarang = 0; // Jumlah item barjas jenis barang
      let totalBarjasJasa = 0; // Jumlah item barjas jenis jasa

      barjasData.forEach((item) => {
        const nilai = (item.harga || 0) * (item.jumlah || 0);
        const jenisBelanja =
          item?.SP?.akunBelanja?.jenisBelanja?.jenis?.toLowerCase() || "";

        if (jenisBelanja === "barang") {
          totalNilaiBarjasBarang += nilai;
          totalBarjasBarang += 1; // Hitung jumlah item, bukan jumlah unit
        } else if (jenisBelanja === "jasa") {
          totalNilaiBarjasJasa += nilai;
          totalBarjasJasa += 1; // Hitung jumlah item, bukan jumlah unit
        }
      });

      // 2. Statistik Kendaraan
      const totalKendaraan = await kendaraan.count({
        where: whereConditionKendaraan,
        include: kendaraanInclude,
      });

      // Hitung total nilai kendaraan (nilaiPerolehan)
      const kendaraanData = await kendaraan.findAll({
        attributes: ["nilaiPerolehan"],
        where: whereConditionKendaraan,
        include: kendaraanInclude,
      });

      const totalNilaiKendaraan = kendaraanData.reduce((sum, item) => {
        return sum + (parseInt(item.nilaiPerolehan) || 0);
      }, 0);

      // 3. Statistik Bangunan
      const totalBangunan = await bangunan.count({
        where: whereConditionBangunan,
      });

      // 4. Statistik Persediaan
      // Filter persediaan melalui stokMasuk -> daftarUnitKerja
      let stokMasukInclude = [];
      if (indukUnitKerjaId) {
        stokMasukInclude = [
          {
            model: daftarUnitKerja,
            where: { indukUnitKerjaId: parseInt(indukUnitKerjaId) },
            required: true,
            attributes: ["id", "unitKerja", "kode", "asal", "indukUnitKerjaId"],
          },
        ];
      }

      // Hitung total stok masuk untuk persediaan
      const stokMasukData = await stokMasuk.findAll({
        attributes: [
          "jumlah",
          "hargaSatuan",
          "persediaanId",
          [sequelize.literal("jumlah * hargaSatuan"), "totalNilai"],
        ],
        include: [
          {
            model: persediaan,
            required: true,
            where: whereConditionPersediaan,
          },
          ...stokMasukInclude,
        ],
      });

      const totalNilaiPersediaan = stokMasukData.reduce((sum, item) => {
        const total =
          (parseFloat(item.hargaSatuan) || 0) * (parseInt(item.jumlah) || 0);
        return sum + total;
      }, 0);

      // Hitung jumlah unik persediaan dari stokMasuk
      const persediaanUnikIds = [
        ...new Set(stokMasukData.map((item) => item.persediaanId)),
      ];
      const totalPersediaan = persediaanUnikIds.length;

      // Total stok masuk entries
      const totalStokMasuk = stokMasukData.length;

      // 5. Kategorisasi nilai aset
      // Belanja Modal = kendaraan + bangunan + barjas (jenis = "barang")
      const totalNilaiBelanjaModal =
        totalNilaiKendaraan + totalNilaiBarjasBarang;

      // Belanja Jasa = barjas (jenis = "jasa")
      const totalNilaiBelanjaJasa = totalNilaiBarjasJasa;

      // Persediaan = persediaan
      const totalNilaiPersediaanValue = totalNilaiPersediaan;

      // Total nilai semua aset
      const totalNilaiAset =
        totalNilaiBelanjaModal +
        totalNilaiBelanjaJasa +
        totalNilaiPersediaanValue;

      // 6. Ringkasan per kategori
      const ringkasan = {
        belanjaModal: {
          kendaraan: {
            total: totalKendaraan,
            totalNilai: totalNilaiKendaraan,
          },
          bangunan: {
            total: totalBangunan,
            totalNilai: 0, // Bangunan tidak memiliki nilai perolehan di model
          },
          barjasBarang: {
            total: totalBarjasBarang,
            totalNilai: totalNilaiBarjasBarang,
          },
          totalNilai: totalNilaiBelanjaModal,
        },
        belanjaJasa: {
          barjasJasa: {
            total: totalBarjasJasa,
            totalNilai: totalNilaiBelanjaJasa,
          },
          totalNilai: totalNilaiBelanjaJasa,
        },
        persediaan: {
          total: totalPersediaan,
          totalStokMasuk: totalStokMasuk,
          totalNilai: totalNilaiPersediaanValue,
        },
        ringkasanBarjas: {
          totalSP,
          totalBarjas,
          totalBarjasBarang,
          totalBarjasJasa,
          totalNilaiBarang: totalNilaiBarjasBarang,
          totalNilaiJasa: totalNilaiBarjasJasa,
        },
        total: {
          totalAset:
            totalBarjas + totalKendaraan + totalBangunan + totalPersediaan,
          totalNilai: totalNilaiAset,
        },
      };

      return res.status(200).json({
        success: true,
        data: ringkasan,
      });
    } catch (err) {
      console.error("Error getDashboardAset:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard aset",
        error: err.message,
      });
    }
  },
};
