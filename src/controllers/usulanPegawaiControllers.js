const {
  pegawai,
  golongan,
  pangkat,

  daftarUnitKerja,
  dalamKota,
  profesi,
  statusPegawai,
  laporanUsulanPegawai,
  sequelize,

  riwayatPegawai,
  usulanPegawai,
  usulanNaikJenjang,
} = require("../models");
const fs = require("fs");
const { Op } = require("sequelize");
const path = require("path");

module.exports = {
  postNaikGOlongan: async (req, res) => {
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

      // Mapping nama field dari frontend ke field DB
      const dataToSave = {
        pegawaiId,
        formulirUsulan: filePaths["formulirUsulan"],
        skCpns: filePaths["skCpns"],
        skPns: filePaths["skPns"],
        PAK: filePaths["PAK"],
        skJafung: filePaths["skJafung"],
        skp: filePaths["skp"],
        skMutasi: filePaths["skMutasi"],
        STR: filePaths["STR"],
        suratCuti: filePaths["suratCuti"],
        status: 0,
        // tambahkan field lain jika ada
      };
      console.log(filePaths, "CEK FILE");
      // Simpan ke database
      const result = await usulanPegawai.create(dataToSave);

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

      const result = await usulanPegawai.findOne({
        where: { pegawaiId: id },
        include: [
          {
            model: pegawai,
            include: [
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

    //2 ditolak, 1 diterima
    console.log(status, "ini statusnya");

    const generateRandomCode = () => {
      const random = Math.random().toString(36).substring(2, 6); // random 4 karakter
      const time = Date.now().toString(36).slice(-4); // ambil 4 karakter terakhir dari timestamp
      return (random + time).toUpperCase(); // total 8 karakter
    };
    const kode = generateRandomCode();
    try {
      const result = await usulanPegawai.update(
        { catatan, status, nomorUsulan: status === 1 ? kode : null },
        { where: { id } },
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
      await usulanPegawai.update({ [field_name]: filePath }, { where: { id } });

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
        { where: { id }, transaction }, // transaction harus di sini
      );

      // hapus semua data usulanPegawai
      await usulanPegawai.destroy({
        where: {}, // kosong artinya hapus semua
        truncate: true, // reset auto increment juga kalau perlu
        transaction,
      });
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
      // 1. Cari data usulanPegawai terlebih dahulu
      const usulan = await usulanPegawai.findByPk(id, { transaction });
      if (!usulan) {
        await transaction.rollback();
        return res.status(404).json({ message: "Data usulan tidak ditemukan" });
      }

      // Daftar field file
      const fileFields = [
        "formulirUsulan",
        "skCpns",
        "skPns",
        "PAK",
        "skJafung",
        "skp",
        "skMutasi",
        "STR",
        "suratCuti",
        "gelar",
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

      await usulanPegawai.update(updateObj, { where: { id }, transaction });

      // 4. Update data pegawai
      await pegawai.update(
        {
          pangkatId: parseInt(pangkatId),
          golonganId: parseInt(golonganId),
          tanggalTMT,
        },
        { where: { id: pegawaiId }, transaction },
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
        { transaction }, // Fixed: proper transaction parameter
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
};
