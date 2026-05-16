const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
  profesi,
  statusPegawai,
  laporanUsulanPegawai,
  sequelize,
  riwayatPegawai,
  indukUnitKerja,
  user,
  userRole,
  role,
  profile,
  usulanNaikJenjang, // ubah dari usulanPegawai ke usulanNaikJenjang
} = require("../models");
const fs = require("fs");
const { Op } = require("sequelize");
const path = require("path");

module.exports = {
  getProfile: async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await profile.findOne({
        attributes: ["id", "nama"],
        where: { userId },
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitkerja", "kode"],
            as: "unitKerja_profile",
            include: [
              {
                model: indukUnitKerja,
                attributes: ["id", "indukUnitKerja", "kodeInduk"],
              },
            ],
          },
          {
            model: user,
            attributes: ["id", "namaPengguna"],
            include: [
              {
                model: userRole,
                attributes: ["id"],
                include: [{ model: role, attributes: ["nama"] }],
              },
            ],
          },
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
                model: usulanNaikJenjang,
                as: "usulanNaikJenjangs", // Tambahkan alias yang sesuai dengan relasi di model pegawai
              },
            ],
          },
        ],
      });
      return res
        .status(200)
        .json({ result, message: "Data profile berhasil diambiccl" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  postNaikJenjang: async (req, res) => {
    const { pegawaiId } = req.body;
    try {
      // req.files adalah array
      // Contoh: [{ fieldname: 'formulir_usulan', filename: 'UNDANGAN_xxx.pdf', ... }, ...]
      const files = req.files;
      const filePaths = {};

      files.forEach((file) => {
        // Simpan path file sesuai fieldname
        filePaths[file.fieldname] = `/pegawai/${file.filename}`;
      });

      // Mapping nama field dari frontend ke field DB sesuai model usulanNaikJenjang
      const dataToSave = {
        pegawaiId,
        formulir: filePaths["formulir"],
        ukom: filePaths["ukom"],
        SKPangkat: filePaths["SKPangkat"],
        SKMutasi: filePaths["SKMutasi"],
        SKJafung: filePaths["SKJafung"],
        SKP: filePaths["SKP"],
        STR: filePaths["STR"],
        SIP: filePaths["SIP"],
        rekom: filePaths["rekom"],
        petaJabatan: filePaths["petaJabatan"],
        status: "diusulkan", // ubah dari 0 ke "diusulkan"
        // tambahkan field lain jika ada
      };
      console.log(filePaths, "CEK FILE");
      // Simpan ke database
      const result = await usulanNaikJenjang.create(dataToSave);

      res.status(200).json({
        message: "File berhasil diupload dan path disimpan di database",
        data: result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDetailusulan: async (req, res) => {
    try {
      const id = req.params.id;

      const result = await usulanNaikJenjang.findOne({
        where: { pegawaiId: id },
        include: [
          {
            model: pegawai,
            as: "pegawai",
            include: [
              {
                model: daftarTingkatan,
                as: "daftarTingkatan",
              },
              { model: daftarGolongan, as: "daftarGolongan" },
              { model: daftarPangkat, as: "daftarPangkat" },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id"],
              },
              { model: profesi, as: "profesi" },
              { model: statusPegawai, as: "statusPegawai" },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id", "unitKerja", "indukUnitKerjaId"],
              },
            ],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  updateStatus: async (req, res) => {
    const { id, catatan, status } = req.body;

    // "ditolak" atau "diterima"
    console.log(req.body, "ini statusnya");

    const generateRandomCode = () => {
      const random = Math.random().toString(36).substring(2, 6); // random 4 karakter
      const time = Date.now().toString(36).slice(-4); // ambil 4 karakter terakhir dari timestamp
      return (random + time).toUpperCase(); // total 8 karakter
    };
    const kode = generateRandomCode();
    try {
      const result = await usulanNaikJenjang.update(
        { catatan, status, nomorUsulan: status === "diterima" ? kode : null },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  updateUsulan: async (req, res) => {
    try {
      const { id, field_name, nama_file_lama } = req.body;
      console.log(field_name);
      // Validasi file
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Harap unggah file" });
      }

      const uploadedFile = req.files[0];

      // Hapus file lama jika ada
      if (nama_file_lama) {
        const fullPath = path.join(__dirname, `../public${nama_file_lama}`);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error("Gagal menghapus file lama:", err);
          }
        });
      }

      // Path file baru
      const filePath = `/pegawai/${uploadedFile.filename}`;

      // Update field dinamis berdasarkan field_name
      await usulanNaikJenjang.update(
        { [field_name]: filePath },
        { where: { id } }
      );

      res.json({
        message: "Dokumen berhasil diupdate",
        path: filePath,
      });
    } catch (error) {
      console.error("Error saat update usulan pegawai:", error);
      res.status(500).json({
        message: "Terjadi kesalahan saat upload dokumen",
        error: error.message,
      });
    }
  },

  getAllLaporanUsulanPegawai: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    try {
      const result = await laporanUsulanPegawai.findAll({
        limit,

        offset,
      });
      const totalRows = await laporanUsulanPegawai.count({
        limit,
        offset,
      });
      const totalPage = Math.ceil(totalRows / limit);
      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getOneLaporanUsulanPegawai: async (req, res) => {
    try {
      const result = await laporanUsulanPegawai.findAll({
        where: { status: "Buka" },
        limit: 1,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  postLaporanUsulanPegawai: async (req, res) => {
    const { tanggalAwal, tanggalAkhir } = req.body;
    try {
      const result = await laporanUsulanPegawai.create({
        tanggalAwal,
        tanggalAkhir,
        status: "Buka",
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  updateLaporanUsulanPegawai: async (req, res) => {
    const transaction = await sequelize.transaction();
    const { id } = req.params;

    try {
      // update status laporanUsulanPegawai
      const result = await laporanUsulanPegawai.update(
        { status: "Tutup" },
        { where: { id }, transaction } // transaction harus di sini
      );

      // hapus semua data usulanNaikJenjang
      await usulanNaikJenjang.destroy({
        where: {}, // kosong artinya hapus semua
        truncate: true, // reset auto increment juga kalau perlu
        transaction,
      });

      // commit transaksi
      await transaction.commit();

      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback(); // rollback kalau error
      console.error(err);
      return res.status(500).json({
        message: "Terjadi kesalahan saat mengupdate dan menghapus data",
      });
    }
  },

  updateLink: async (req, res) => {
    const {
      linkSertifikat,
      id,
      pangkatId,
      golonganId,
      pegawaiId,
      tanggalTMT,
      profesiLamaId,
      unitKerjaLamaId,
    } = req.body;
    const transaction = await sequelize.transaction();

    try {
      // 1. Cari data usulanNaikJenjang terlebih dahulu
      const usulan = await usulanNaikJenjang.findByPk(id, { transaction });
      if (!usulan) {
        await transaction.rollback();
        return res.status(404).json({ message: "Data usulan tidak ditemukan" });
      }

      // Daftar field file sesuai model usulanNaikJenjang
      const fileFields = [
        "formulir",
        "ukom",
        "SKPangkat",
        "SKMutasi",
        "SKJafung",
        "SKP",
        "STR",
        "SIP",
        "rekom",
        "petaJabatan",
      ];

      // 2. Hapus file-file lama terlebih dahulu
      for (const field of fileFields) {
        const filePath = usulan[field];
        if (filePath) {
          const fullPath = path.join(__dirname, `../public${filePath}`);
          try {
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log(`File ${filePath} berhasil dihapus`);
            }
          } catch (err) {
            console.error(`Gagal hapus file ${filePath}:`, err.message);
            // Continue with other operations even if file deletion fails
          }
        }
      }

      // 3. Update link sertifikat dan set semua kolom file jadi null
      const updateObj = { linkSertifikat };
      fileFields.forEach((field) => (updateObj[field] = null));

      await usulanNaikJenjang.update(updateObj, { where: { id }, transaction });

      // 4. Update data pegawai
      await pegawai.update(
        {
          pangkatId: parseInt(pangkatId),
          golonganId: parseInt(golonganId),
          tanggalTMT,
        },
        { where: { id: pegawaiId }, transaction }
      );

      // 5. Create riwayat pegawai dengan nilai yang benar
      await riwayatPegawai.create(
        {
          pegawaiId,
          unitKerjaLamaId,
          golonganId: parseInt(golonganId) - 1,
          profesiLamaId,
          pangkatId: parseInt(pangkatId) - 1,
        },
        { transaction } // Fixed: proper transaction parameter
      );

      // 6. Commit transaction setelah semua operasi berhasil
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message:
          "Data pegawai berhasil diupdate, semua file usulan dihapus dan field diset null",
        pegawaiId,
        usulanId: id,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Error updateLinkAndClearFiles:", err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat update & hapus file" });
    }
  },

  getUsulan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const golonganId = parseInt(req.query.golonganId);
    const pangkatId = parseInt(req.query.pangkatId);
    const search = req.query.search_query || "";
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log(req.query, "CEK INI");
    const whereCondition = {
      nama: { [Op.like]: "%" + search + "%" },
    };

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (pangkatId) {
      whereCondition.pangkatId = pangkatId;
    }
    if (golonganId) {
      whereCondition.golonganId = golonganId;
    }

    try {
      const result = await usulanNaikJenjang.findAll({
        offset,
        limit,
        attributes: ["id", "nomorUsulan", "catatan"],
        include: [
          {
            model: pegawai,
            as: "pegawai",
            attributes: [
              "id",
              "nama",
              "pendidikan",
              "nip",
              "jabatan",
              "tanggalTMT",
            ],
            where: whereCondition,
            order: [["nama", "ASC"]],
            include: [
              {
                model: daftarGolongan,
                attributes: ["golongan", "id"],
                as: "daftarGolongan",
              },
              {
                model: daftarPangkat,
                attributes: ["pangkat", "id"],
                as: "daftarPangkat",
              },
              {
                model: profesi,
                as: "profesi",
                attributes: ["nama", "id"],
              },

              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id", "unitKerja"],
              },
            ],
          },
        ],
      });

      const totalRows = await usulanNaikJenjang.count({
        offset,
        limit,

        include: [
          {
            model: pegawai,
            as: "pegawai",
            attributes: ["id"],
            where: whereCondition,
          },
        ],
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
};
