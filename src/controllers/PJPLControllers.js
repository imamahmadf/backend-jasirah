const {
  sequelize,
  user,
  userRole,
  role,
  profile,
  pejabatVerifikator,
  pegawai,
  indikatorPejabat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  profesi,
  statusPegawai,
  kontrakPJPL,
  kinerjaPJPL,
  realisasiPJPL,
  realisasiKinerjaPJPL,
  hasilKerjaPJPL,
  hasilKerjaKualitatifPJPL,
  kualitatifPJPL,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getPejabatVerifikator: async (req, res) => {
    try {
      const result = await pejabatVerifikator.findAll({
        attributes: [
          "id",
          "pegawaiId",
          "unitKerjaId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          { model: pegawai, attributes: ["id", "nama", "NIP", "jabatan"] },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postPejabatVerifikator: async (req, res) => {
    const { pegawaiId, unitKerjaId } = req.body;

    console.log("test", pegawaiId);
    try {
      const result = await pejabatVerifikator.create({
        pegawaiId,
        unitKerjaId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postIndikator: async (req, res) => {
    const { indikator, pejabatVerifikatorId } = req.body;

    console.log("test", indikator);
    try {
      const result = await indikatorPejabat.create({
        indikator,
        pejabatVerifikatorId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getIndikatorPejabat: async (req, res) => {
    const id = req.params.id;
    console.log("ID PEH+GAWAI", id);
    try {
      const result = await pejabatVerifikator.findOne({
        attributes: ["id"],
        include: [
          {
            model: indikatorPejabat,
            attributes: ["id", "indikator"],
          },
        ],
        where: { pegawaiId: id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getIndikatorKinerja: async (req, res) => {
    const unitKerjaId = req.params.id;
    console.log("ID PEH+GAWAI", unitKerjaId);
    try {
      const result = await indikatorPejabat.findAll({
        attributes: ["id", "indikator"],
        include: [
          {
            model: pejabatVerifikator,
            attributes: ["id"],
            where: { unitKerjaId },
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getPJPLPegawai: async (req, res) => {
    const unitKerjaId = req.query.unitKerjaId;
    const pegawaiWhere = { statusPegawaiId: 5 };

    // Filter berdasarkan unitKerjaId jika diberikan
    if (unitKerjaId) {
      pegawaiWhere.unitKerjaId = unitKerjaId;
    }

    const daftarUnitKerjaInclude = {
      model: daftarUnitKerja,
      as: "daftarUnitKerja",
      attributes: ["id", "unitKerja", "indukUnitKerjaId"],
    };

    try {
      const result = await pegawai.findAll({
        where: pegawaiWhere,
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
          { model: profesi, as: "profesi" },
          { model: statusPegawai, as: "statusPegawai" },
          daftarUnitKerjaInclude,
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postKontrak: async (req, res) => {
    const { tanggalAwal, tanggalAkhir, pegawaiIds } = req.body;

    try {
      // Siapkan array object untuk bulkCreate
      const kontrakData = pegawaiIds.map((id) => ({
        tanggalAwal,
        tanggalAkhir,
        pegawaiId: id,
      }));

      const result = await kontrakPJPL.bulkCreate(kontrakData);

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKontrakPegawai: async (req, res) => {
    const { id } = req.params;
    console.log("berhail masuk");

    try {
      const result = await kontrakPJPL.findAll({ where: { pegawaiId: id } });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getDetailKontrak: async (req, res) => {
    const { id } = req.params;
    console.log("berhasil masuk");

    try {
      const result = await kontrakPJPL.findAll({
        where: { id },
        include: [
          {
            model: kinerjaPJPL,
            attributes: ["id"],
            include: [
              {
                model: indikatorPejabat,
                as: "indikatorPejabat",
                attributes: ["id"],
                include: [
                  {
                    model: pejabatVerifikator,
                    attributes: [
                      "id",
                      "pegawaiId",
                      "unitKerjaId",
                      "createdAt",
                      "updatedAt",
                    ],
                  },
                ],
              },
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

  // ========== KINERJA PJPL CONTROLLERS ==========
  postKinerjaPJPL: async (req, res) => {
    const {
      kontrakPJPLId,
      indikatorPejabatId,
      rencanaHasilKerja,
      target,
      satuan,
    } = req.body;

    try {
      const result = await kinerjaPJPL.create({
        kontrakPJPLId,
        indikatorPejabatId,
        indikator: rencanaHasilKerja,
        target,
        status: "diajukan",
        satuan,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKinerjaPJPL: async (req, res) => {
    const { kontrakPJPLId } = req.query;

    try {
      const where = {};
      if (kontrakPJPLId) {
        where.kontrakPJPLId = kontrakPJPLId;
      }

      const result = await kinerjaPJPL.findAll({
        where,
        include: [
          {
            model: kontrakPJPL,
            as: "kontrakPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
              },
            ],
          },
          {
            model: indikatorPejabat,
            as: "indikatorPejabat",
            attributes: ["id", "indikator"],
            include: [
              {
                model: pejabatVerifikator,
                attributes: ["id"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKinerjaPJPLById: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await kinerjaPJPL.findOne({
        where: { id },
        include: [
          {
            model: kontrakPJPL,
            as: "kontrakPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
              },
            ],
          },
          {
            model: indikatorPejabat,
            as: "indikatorPejabat",
            attributes: ["id", "indikator"],
            include: [
              {
                model: pejabatVerifikator,
                attributes: ["id"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
            ],
          },
          {
            model: realisasiPJPL,
            as: "realisasiPJPLs",
            attributes: [
              "id",
              "tanggalAwal",
              "tanggalAkhir",
              "status",
              "createdAt",
            ],
            include: [
              {
                model: hasilKerjaPJPL,
                as: "hasilKerjaPJPLs",
                attributes: ["id", "hasil", "nilai", "status"],
              },
            ],
          },
        ],
      });

      if (!result) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateKinerjaPJPL: async (req, res) => {
    const { id } = req.params;
    const { indikator, target, status } = req.body;

    try {
      const kinerja = await kinerjaPJPL.findByPk(id);
      if (!kinerja) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      const updateData = {};
      if (indikator !== undefined) updateData.indikator = indikator;
      if (target !== undefined) updateData.target = target;
      if (status !== undefined) updateData.status = status;

      await kinerja.update(updateData);

      const result = await kinerjaPJPL.findByPk(id, {
        include: [
          {
            model: kontrakPJPL,
            as: "kontrakPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
          },
          {
            model: indikatorPejabat,
            as: "indikatorPejabat",
            attributes: ["id", "indikator"],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteKinerjaPJPL: async (req, res) => {
    const { id } = req.params;

    try {
      const kinerja = await kinerjaPJPL.findByPk(id);
      if (!kinerja) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      await kinerja.destroy();

      return res.status(200).json({ message: "Kinerja PJPL berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  /** POST /update/kinerja-pjpl/:id — hanya update status (disetujui → diterima, ditolak → ditolak) */
  updateStatusKinerjaPJPL: async (req, res) => {
    const { id } = req.params;
    const { status: statusBaru } = req.body;

    try {
      if (!statusBaru) {
        return res.status(400).json({
          error: "status wajib diisi",
        });
      }

      const statusMap = { disetujui: "diterima", ditolak: "ditolak" };
      const statusValue =
        statusMap[statusBaru.toLowerCase()] || statusBaru.toLowerCase();

      const allowed = ["diajukan", "ditolak", "diterima"];
      if (!allowed.includes(statusValue)) {
        return res.status(400).json({
          error: `status harus salah satu dari: ${allowed.join(", ")}`,
        });
      }

      const kinerja = await kinerjaPJPL.findByPk(id);
      if (!kinerja) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      await kinerja.update({ status: statusValue });

      const result = await kinerjaPJPL.findByPk(id, {
        include: [
          {
            model: kontrakPJPL,
            as: "kontrakPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
          },
          {
            model: indikatorPejabat,
            as: "indikatorPejabat",
            attributes: ["id", "indikator"],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message || "Gagal mengubah status" });
    }
  },

  // ========== REALISASI PJPL CONTROLLERS ==========
  postRealisasiPJPL: async (req, res) => {
    const { tanggalAwal, tanggalAkhir, kinerjaPJPLId, status } = req.body;

    try {
      // Validasi input
      if (!tanggalAwal || !tanggalAkhir) {
        return res.status(400).json({
          error: "Tanggal awal dan tanggal akhir harus diisi",
        });
      }

      if (
        !kinerjaPJPLId ||
        !Array.isArray(kinerjaPJPLId) ||
        kinerjaPJPLId.length === 0
      ) {
        return res.status(400).json({
          error: "kinerjaPJPLId harus berupa array dan tidak boleh kosong",
        });
      }

      // Validasi tanggal
      if (new Date(tanggalAwal) > new Date(tanggalAkhir)) {
        return res.status(400).json({
          error: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
        });
      }

      // 1. Buat data di realisasiPJPL terlebih dahulu
      const result = await realisasiPJPL.create({
        tanggalAwal,
        tanggalAkhir,
        status: status || "diajukan",
      });

      // 2. Hubungkan kinerjaPJPL dengan realisasiPJPL menggunakan relasi many-to-many
      // Menggunakan kinerjaPJPLId dari frontend untuk menentukan data mana yang dihubungkan
      const kinerjaPJPLRecords = await kinerjaPJPL.findAll({
        where: { id: kinerjaPJPLId },
      });

      if (kinerjaPJPLRecords.length > 0) {
        await result.setKinerjaPJPLs(kinerjaPJPLRecords);
      }

      // 3. Buat data di hasilKerjaKualitatifPJPL untuk setiap data di kualitatifPJPL
      const semuaKualitatifPJPL = await kualitatifPJPL.findAll();
      if (semuaKualitatifPJPL.length > 0) {
        await hasilKerjaKualitatifPJPL.bulkCreate(
          semuaKualitatifPJPL.map((kual) => ({
            tanggalAwal: result.tanggalAwal,
            tanggalAkhir: result.tanggalAkhir,
            kualitatifPJPLId: kual.id,
            realisasiPJPLId: result.id,
          }))
        );
      }

      // Reload untuk mendapatkan data lengkap dengan relasi
      await result.reload({
        include: [
          {
            model: kinerjaPJPL,
            as: "kinerjaPJPLs",
            attributes: ["id", "indikator", "target", "status"],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getRealisasiPJPL: async (req, res) => {
    const { kontrakPJPLId } = req.query;

    try {
      const where = {};

      // Setup include untuk kinerjaPJPL
      const kinerjaInclude = {
        model: kinerjaPJPL,
        as: "kinerjaPJPLs",
        attributes: ["id", "indikator", "target", "status"],
        include: [
          {
            model: kontrakPJPL,
            as: "kontrakPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
              },
            ],
          },
        ],
      };

      // Jika kontrakPJPLId diberikan, tambahkan where clause di kontrakPJPL
      if (kontrakPJPLId) {
        kinerjaInclude.include[0].where = { id: kontrakPJPLId };
        kinerjaInclude.required = true; // INNER JOIN untuk memastikan hanya data dengan kontrakPJPL yang sesuai
      }

      const result = await realisasiPJPL.findAll({
        where,
        include: [
          kinerjaInclude,
          {
            model: hasilKerjaPJPL,
            as: "hasilKerjaPJPLs",
            attributes: ["id", "hasil", "nilai", "status"],
          },
        ],
        order: [["tanggalAwal", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getRealisasiPJPLById: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await realisasiPJPL.findOne({
        where: { id },
        include: [
          {
            model: kinerjaPJPL,
            as: "kinerjaPJPLs",
            attributes: ["id", "indikator", "target", "status", "satuan"],
            through: {
              attributes: [
                "id",
                "kinerjaPJPLId",
                "realisasiPJPLId",
                "hasil",
                "nilai",
                "status",
                "buktiDukung",
                "createdAt",
                "updatedAt",
              ],
            },
            include: [
              {
                model: kontrakPJPL,
                as: "kontrakPJPL",
                attributes: ["id", "tanggalAwal", "tanggalAkhir"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
              {
                model: indikatorPejabat,
                as: "indikatorPejabat",
                attributes: ["id", "indikator"],
              },
            ],
          },
          {
            model: hasilKerjaPJPL,
            as: "hasilKerjaPJPLs",
            attributes: ["id", "hasil", "nilai", "status", "createdAt"],
          },
          {
            model: hasilKerjaKualitatifPJPL,
            as: "hasilKerjaKualitatifPJPLs",
            attributes: ["id", "tanggalAwal", "tanggalAkhir", "nilai", "catatan", "kualitatifPJPLId", "realisasiPJPLId", "pejabatVerifikatorId"],
            include: [
              {
                model: kualitatifPJPL,
                as: "kualitatifPJPL",
                attributes: ["id", "indikator"],
              },
            ],
          },
        ],
      });

      if (!result) {
        return res
          .status(404)
          .json({ error: "Realisasi PJPL tidak ditemukan" });
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateRealisasiPJPL: async (req, res) => {
    const { id } = req.params;
    const { tanggalAwal, tanggalAkhir, status } = req.body;

    try {
      const realisasi = await realisasiPJPL.findByPk(id);
      if (!realisasi) {
        return res
          .status(404)
          .json({ error: "Realisasi PJPL tidak ditemukan" });
      }

      // Validasi tanggal jika ada perubahan
      if (tanggalAwal && tanggalAkhir) {
        if (new Date(tanggalAwal) > new Date(tanggalAkhir)) {
          return res.status(400).json({
            error: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
          });
        }
      }

      const updateData = {};
      if (tanggalAwal !== undefined) updateData.tanggalAwal = tanggalAwal;
      if (tanggalAkhir !== undefined) updateData.tanggalAkhir = tanggalAkhir;
      if (status !== undefined) updateData.status = status;

      await realisasi.update(updateData);

      const result = await realisasiPJPL.findByPk(id, {
        include: [
          {
            model: kinerjaPJPL,
            attributes: ["id", "indikator", "target"],
          },
          {
            model: hasilKerjaPJPL,
            as: "hasilKerjaPJPLs",
            attributes: ["id", "hasil", "nilai", "status"],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteRealisasiPJPL: async (req, res) => {
    const { id } = req.params;

    try {
      const realisasi = await realisasiPJPL.findByPk(id);
      if (!realisasi) {
        return res
          .status(404)
          .json({ error: "Realisasi PJPL tidak ditemukan" });
      }

      await realisasi.destroy();

      return res
        .status(200)
        .json({ message: "Realisasi PJPL berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postHasilKerjaPJPL: async (req, res) => {
    const { realisasiKinerjaPJPLId, capaian, buktiDukung, status } = req.body;
    console.log(req.body);
    try {
      // Validasi input
      if (!realisasiKinerjaPJPLId) {
        return res.status(400).json({
          error: "realisasiKinerjaPJPLId harus diisi",
        });
      }

      // Cek apakah data ada
      const existingData = await realisasiKinerjaPJPL.findByPk(
        realisasiKinerjaPJPLId,
      );

      if (!existingData) {
        return res.status(404).json({
          error: "Realisasi Kinerja PJPL tidak ditemukan",
        });
      }

      // Update data
      await realisasiKinerjaPJPL.update(
        {
          hasil: capaian,
          buktiDukung,
          status,
        },
        { where: { id: realisasiKinerjaPJPLId } },
      );

      // Ambil data yang sudah diupdate
      const result = await realisasiKinerjaPJPL.findByPk(
        realisasiKinerjaPJPLId,
        {
          include: [
            {
              model: kinerjaPJPL,
              as: "kinerjaPJPL",
              attributes: ["id", "indikator", "target", "status"],
            },
            {
              model: realisasiPJPL,
              as: "realisasiPJPL",
              attributes: ["id", "tanggalAwal", "tanggalAkhir", "status"],
            },
          ],
        },
      );

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getLaporanKinerjaPJPL: async (req, res) => {
    const { id } = req.params; // pegawaiId

    try {
      const result = await realisasiKinerjaPJPL.findAll({
        attributes: [
          "id",
          "kinerjaPJPLId",
          "realisasiPJPLId",
          "hasil",
          "nilai",
          "status",
          "buktiDukung",
          "createdAt",
          "updatedAt",
        ],
        required: true,
        include: [
          {
            model: kinerjaPJPL,
            as: "kinerjaPJPL",
            attributes: ["id", "indikator", "target", "status"],
            required: true,
            include: [
              {
                model: kontrakPJPL,
                as: "kontrakPJPL",
                attributes: ["id", "tanggalAwal", "tanggalAkhir"],
                required: true,
              },
              {
                model: indikatorPejabat,
                as: "indikatorPejabat",
                attributes: ["id", "indikator"],
                required: true,
                include: [
                  {
                    model: pejabatVerifikator,
                    attributes: ["id", "pegawaiId", "unitKerjaId"],
                    where: { pegawaiId: id },
                    required: true,
                  },
                ],
              },
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

  updateStatusLaporanPJPL: async (req, res) => {
    const { id } = req.params; // id realisasiKinerjaPJPL
    const { status, nilai } = req.body;
    console.log("CEKK", req.body, id);
    const allowedStatus = ["diajukan", "ditolak", "diterima"];
    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        error: "Status harus diisi dan bernilai diajukan/ditolak/diterima",
      });
    }

    try {
      const [updated] = await realisasiKinerjaPJPL.update(
        { status, nilai },
        { where: { id } },
      );

      if (updated === 0) {
        return res
          .status(404)
          .json({ error: "Realisasi Kinerja PJPL tidak ditemukan" });
      }

      const result = await realisasiKinerjaPJPL.findByPk(id, {
        attributes: [
          "id",
          "kinerjaPJPLId",
          "realisasiPJPLId",
          "hasil",
          "nilai",
          "status",
          "buktiDukung",
          "createdAt",
          "updatedAt",
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getRencanaHasilKerja: async (req, res) => {
    const { id } = req.params; // id = pegawaiId dari table pejabatVerifikator (dikirim dari frontend)
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;

    const includeOptions = [
      {
        model: indikatorPejabat,
        as: "indikatorPejabat",
        required: true,
        include: [
          {
            model: pejabatVerifikator,
            where: { pegawaiId: id },
            required: true,
          },
        ],
      },
      {
        model: kontrakPJPL,
        as: "kontrakPJPL",
        include: [{ model: pegawai }],
      },
    ];

    const orderOptions = [
      [{ model: kontrakPJPL, as: "kontrakPJPL" }, "pegawaiId", "ASC"],
      [{ model: kontrakPJPL, as: "kontrakPJPL" }, "tanggalAwal", "ASC"],
    ];

    try {
      const result = await kinerjaPJPL.findAll({
        include: includeOptions,
        order: orderOptions,
        offset,
        limit,
      });

      const totalRows = await kinerjaPJPL.count({
        include: includeOptions,
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

  getIndikatorKualitatif: async (req, res) => {
    console.log("berhasil masuk");

    try {
      const result = await kualitatifPJPL.findAll({});

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postIndikatorKualitatif: async (req, res) => {
    const { indikator } = req.body;

    try {
      const result = await kualitatifPJPL.create({
        indikator,
      });
      return res.status(201).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateHasilKerjaKualitatifPJPL: async (req, res) => {
    const { id } = req.params;
    const { nilai, catatan } = req.body;

    const nilaiNum = nilai != null ? parseFloat(nilai) : null;
    if (nilaiNum === null || Number.isNaN(nilaiNum) || nilaiNum < 1 || nilaiNum > 10) {
      return res.status(400).json({
        error: "Nilai harus angka antara 1 sampai 10.",
      });
    }

    try {
      const row = await hasilKerjaKualitatifPJPL.findByPk(id);
      if (!row) {
        return res
          .status(404)
          .json({ error: "Hasil kerja kualitatif PJPL tidak ditemukan" });
      }

      const updateData = {
        nilai: Math.round(nilaiNum),
        catatan: catatan != null && String(catatan).trim() !== "" ? String(catatan).trim() : null,
      };
      await row.update(updateData);

      const result = await hasilKerjaKualitatifPJPL.findByPk(id, {
        attributes: ["id", "tanggalAwal", "tanggalAkhir", "nilai", "catatan", "kualitatifPJPLId", "realisasiPJPLId", "pejabatVerifikatorId", "createdAt", "updatedAt"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: err.message || "Gagal menyimpan penilaian",
      });
    }
  },
};
