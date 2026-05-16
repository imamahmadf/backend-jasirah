const {
  rincianBPD,
  rill,
  daftarUnitKerja,
  sequelize,
  pegawai,
  kendaraan,
  kendaraanDinas,
  perjalanan,
  tempat,
  dalamKota,
  personil,
} = require("../models");

const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

module.exports = {
  // postKendaraanDinas: async (req, res) => {
  //   console.log(req.body);
  //   const {
  //     tanggalAwal,
  //     tanggalAkhir,
  //     kendaraanId,
  //     pegawaiId,
  //     tujuan,
  //     unitKerjaId,
  //   } = req.body;

  //   try {
  //     // Validasi unitKerjaId
  //     // if (!unitKerjaId || unitKerjaId <= 0) {
  //     //   return res.status(400).json({
  //     //     message: "unitKerjaId harus diisi dan harus lebih dari 0",
  //     //   });
  //     // }

  //     // // Cek apakah unitKerjaId ada di database
  //     // const unitKerjaExists = await daftarUnitKerja.findByPk(unitKerjaId);
  //     // if (!unitKerjaExists) {
  //     //   return res.status(400).json({
  //     //     message: `Unit kerja dengan ID ${unitKerjaId} tidak ditemukan`,
  //     //   });
  //     // }

  //     await kendaraanDinas.create({
  //       tanggalAwal,
  //       tanggalAkhir,
  //       kendaraanId,
  //       pegawaiId,
  //       tujuan,
  //       unitKerjaId: 1,
  //       status: "dipinjam",
  //     });

  //     return res.status(200).json({
  //       message: "berhasil tambah data",
  //     });
  //   } catch (err) {
  //     console.log(err);

  //     // Handle foreign key constraint error
  //     if (err.name === "SequelizeForeignKeyConstraintError") {
  //       return res.status(400).json({
  //         message:
  //           "Data yang dikirim tidak valid. Pastikan kendaraanId, pegawaiId, dan unitKerjaId sudah ada di database.",
  //       });
  //     }

  //     return res.status(500).json({
  //       message: err.message || "Terjadi kesalahan server",
  //     });
  //   }
  // },

  // getKendaraanPegawai: async (req, res) => {
  //   try {
  //     const result = await pegawai.findAll({
  //       include: [
  //         {
  //           model: kendaraanDinas,
  //           include: [{ model: kendaraan }],
  //         },
  //       ],
  //     });
  //     return res.status(200).json({ result });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // },

  postKendaraanDinas: async (req, res) => {
    const { selectedIds, kendaraanId } = req.body;
    console.log(selectedIds, "DATA PERJLANAN");
    try {
      const resultKendaraanDinas = await kendaraanDinas.create({
        kendaraanId,

        status: "dipinjam",
      });

      await perjalanan.update(
        { kendaraanDinasId: resultKendaraanDinas.id },
        { where: { id: selectedIds } } // Langsung array ID
      );

      return res.status(200).json({
        message: "berhasil tambah data",
      });
    } catch (err) {
      console.log(err);

      // Handle foreign key constraint error
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          message:
            "Data yang dikirim tidak valid. Pastikan kendaraanId, pegawaiId, dan unitKerjaId sudah ada di database.",
        });
      }

      return res.status(500).json({
        message: err.message || "Terjadi kesalahan server",
      });
    }
  },
  getKendaraanDinas: async (req, res) => {
    try {
      const result = await kendaraanDinas.findAll({
        include: [
          {
            model: kendaraan,
          },
          {
            model: perjalanan,
            attributes: ["id"],
            include: [
              {
                model: personil,
                attributes: ["id"],
                include: [{ model: pegawai, attributes: ["id", "nama"] }],
              },
              {
                model: tempat,
                attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
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
        ],
        order: [["id", "DESC"]],
      });
      const resultUnitKerja = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });
      return res.status(200).json({ result, resultUnitKerja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKendaraanDinasSaya: async (req, res) => {
    const { id } = req.params;

    try {
      // 1️⃣ Cari data kendaraan_dinas yang sedang dipinjam oleh pegawai tertentu
      const current = await kendaraanDinas.findOne({
        include: [
          {
            model: perjalanan,
            attributes: ["id", "asal"],
            required: true,
            include: [
              {
                model: personil,
                attributes: ["id", "pegawaiId"],
                where: { pegawaiId: id },
                required: true,
              },
            ],
          },
        ],
        where: { status: "dipinjam" },
        order: [["id", "DESC"]],
      });

      // 2️⃣ Jika tidak ada data "dipinjam", kembalikan result null
      if (!current) {
        return res.status(200).json({ result: null });
      }

      // 3️⃣ Ambil data current + 1 data sebelumnya (berdasarkan ID)
      const result = await kendaraanDinas.findAll({
        include: [
          { model: kendaraan },
          { model: perjalanan, attributes: ["id", "noSuratTugas"] },
        ],
        where: {
          id: {
            [Op.lte]: current.id, // ambil current dan yang sebelumnya
          },
        },
        order: [["id", "DESC"]],
        limit: 2,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKendaraanIndukUnitKerja: async (req, res) => {
    const id = req.params.id;
    console.log(id, "cekkk IDDD");
    try {
      const result = await kendaraan.findAll({
        include: [
          { model: jenisKendaraan },
          { model: kondisi },

          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja", "indukUnitKerjaId"],
            where: { indukUnitKerjaId: id },
            foreignKey: "unitKerjaId",
            as: "kendaraanUK",
          },
        ],
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "nomor",
          "seri",
          "unitKerjaId",
          "kondisiId",
          "statusKendaraanId",
          "jenisKendaraanId",

          "foto",
          "merek",
          "warna",
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  fotoBukti: async (req, res) => {
    console.log(req.body);
    console.log(req.files);
    const { kmAkhir, kondisiAkhir } = req.files;
    const { id } = req.body;
    const filePath = "kendaraan-dinas";
    try {
      await kendaraanDinas.update(
        {
          kondisiAkhir: `/${filePath}/${kondisiAkhir[0].filename}`,
          kmAkhir: `/${filePath}/${kmAkhir[0].filename}`,
        },
        { where: { id } }
      );

      return res.status(200).json({ result: "cek" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDetailKendaraanDinas: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await kendaraan.findOne({
        where: { id },
        include: [
          {
            model: kendaraanDinas,
            include: [
              {
                model: perjalanan,
                attributes: ["id"],
                include: [
                  {
                    model: personil,
                    attributes: ["id"],
                    include: [{ model: pegawai, attributes: ["id", "nama"] }],
                  },
                  {
                    model: tempat,
                    attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
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
            ],
          },
        ],
        order: [[kendaraanDinas, "id", "DESC"]], // ✅ urutkan data kendaraanDinas dari id terbesar ke terkecil
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  updateStatus: async (req, res) => {
    const { id } = req.params;
    const { catatan, jarak } = req.body;
    console.log(id);
    try {
      await kendaraanDinas.update(
        { status: "kembali", catatan, jarak }, // ✅ data yang diupdate
        { where: { id } } // ✅ kondisi update
      );

      return res.status(200).json({ result: "berhasil" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  hapusSemuaFotoKendaraanDinas: async (req, res) => {
    try {
      const folderPath = path.join(__dirname, "../public/kendaraan-dinas");

      // Cek apakah folder ada
      if (!fs.existsSync(folderPath)) {
        return res.status(404).json({
          message: "Folder kendaraan-dinas tidak ditemukan",
        });
      }

      // Baca semua file di folder
      const files = fs.readdirSync(folderPath);

      let deletedCount = 0;
      const deletedFiles = [];

      // Hapus setiap file jika ada
      if (files.length > 0) {
        files.forEach((file) => {
          try {
            const filePath = path.join(folderPath, file);
            fs.unlinkSync(filePath);
            deletedCount++;
            deletedFiles.push(file);
          } catch (fileError) {
            console.log(`Gagal menghapus file ${file}:`, fileError.message);
          }
        });
      }

      // Update semua record kendaraanDinas untuk mengosongkan kmAkhir dan kondisiAkhir
      const [updatedCount] = await kendaraanDinas.update(
        {
          kmAkhir: null,
          kondisiAkhir: null,
        },
        {
          where: {
            [Op.or]: [
              { kmAkhir: { [Op.ne]: null } },
              { kondisiAkhir: { [Op.ne]: null } },
            ],
          },
        }
      );

      return res.status(200).json({
        message: `Berhasil menghapus ${deletedCount} file foto dan mengosongkan ${updatedCount} record di database`,
        deletedCount,
        deletedFiles,
        updatedRecords: updatedCount,
      });
    } catch (err) {
      console.log("Error menghapus foto kendaraan dinas:", err);
      return res.status(500).json({
        message:
          "Terjadi kesalahan saat menghapus file foto atau mengupdate database",
        error: err.message,
      });
    }
  },
  batalkanKendaraanDinas: async (req, res) => {
    const id = req.params.id;
    const perjalananId = req.body.perjalananId;
    console.log(perjalananId);

    try {
      const result = await kendaraanDinas.destroy({ where: { id } });
      await perjalanan.update(
        { kendaraanDinasId: null },
        { where: { id: perjalananId } } // Langsung array ID
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
