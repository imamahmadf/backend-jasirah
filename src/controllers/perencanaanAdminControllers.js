const {
  daftarUnitKerja,
  subKegPer,
  kegiatan,
  program,
  indikator,
  satuanIndikator,
  target,
  capaian,
  tahunAnggaran,
  jenisAnggaran,
  targetTriwulan,
  namaTarget,
  pegawai,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getSubKegiatan: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await subKegPer.findAll({
        paranoid: true, // Hanya ambil data yang belum di-soft delete
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            where: { indukUnitKerjaId },
          },
          {
            model: kegiatan,
            paranoid: true, // Hanya ambil kegiatan yang belum di-soft delete
            include: [
              {
                model: program,
                paranoid: true, // Hanya ambil program yang belum di-soft delete
              },
            ],
          },
          {
            model: indikator,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
              },
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
              },
              {
                model: satuanIndikator,
                attributes: ["id", "satuan"],
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

  getKegiatan: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await kegiatan.findAll({
        paranoid: true, // Hanya ambil data yang belum di-soft delete
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            where: { indukUnitKerjaId },
          },
          {
            model: subKegPer,
            paranoid: true, // Hanya ambil kegiatan yang belum di-soft delete
          },
          {
            model: program,
            paranoid: true, // Hanya ambil program yang belum di-soft delete
          },
          {
            model: indikator,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
              },
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
              },
              {
                model: satuanIndikator,
                attributes: ["id", "satuan"],
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

  getProgram: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await program.findAll({
        paranoid: true, // Hanya ambil data yang belum di-soft delete
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            where: { indukUnitKerjaId },
          },
          {
            model: kegiatan,
            paranoid: true, // Hanya ambil kegiatan yang belum di-soft delete
            include: [
              {
                model: subKegPer,
                paranoid: true, // Hanya ambil program yang belum di-soft delete
              },
            ],
          },
          {
            model: indikator,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
              },
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
              },
              {
                model: satuanIndikator,
                attributes: ["id", "satuan"],
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

  getSeedSubKegPer: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const resultKegiatan = await kegiatan.findAll({
        paranoid: true, // Hanya ambil kegiatan yang belum di-soft delete
        include: [
          {
            model: daftarUnitKerja,
            required: true,
            attributes: ["id", "unitKerja"],
            where: { indukUnitKerjaId },
          },
        ],
        attributes: ["id", "nama"],
      });

      const resultUnitKerja = await daftarUnitKerja.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "unitKerja"],
      });

      const resultSatuan = await satuanIndikator.findAll({});
      return res
        .status(200)
        .json({ resultKegiatan, resultUnitKerja, resultSatuan });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getSeedKegiatan: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const resultProgram = await program.findAll({
        paranoid: true, // Hanya ambil kegiatan yang belum di-soft delete
        include: [
          {
            model: daftarUnitKerja,
            required: true,
            attributes: ["id", "unitKerja"],
            where: { indukUnitKerjaId },
          },
        ],
        attributes: ["id", "nama"],
      });

      const resultUnitKerja = await daftarUnitKerja.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "unitKerja"],
      });
      const resultSatuan = await satuanIndikator.findAll({});
      return res
        .status(200)
        .json({ resultProgram, resultUnitKerja, resultSatuan });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getSeedProgram: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const resultUnitKerja = await daftarUnitKerja.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "unitKerja"],
      });
      const resultSatuan = await satuanIndikator.findAll({});
      return res.status(200).json({ resultUnitKerja, resultSatuan });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postSubKegiatan: async (req, res) => {
    const { kode, nama, kegiatanId, unitKerjaId } = req.body;
    try {
      const result = await subKegPer.create({
        unitKerjaId,
        kode,
        nama,
        kegiatanId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postKegiatan: async (req, res) => {
    const { kode, nama, programId, unitKerjaId } = req.body;
    try {
      const result = await kegiatan.create({
        unitKerjaId,
        kode,
        nama,
        programId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postProgram: async (req, res) => {
    const { kode, nama, unitKerjaId } = req.body;
    try {
      const result = await program.create({
        unitKerjaId,
        kode,
        nama,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postIndikator: async (req, res) => {
    const {
      indikatorFE,
      subKegPerId,
      satuanIndikatorId,
      kegiatanId,
      programId,
      unitKerjaId,
      pegawaiId,
    } = req.body;
    try {
      const result = await indikator.create({
        indikator: indikatorFE,
        subKegPerId,
        satuanIndikatorId,
        kegiatanId,
        programId,
        unitKerjaId,
        pegawaiId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editSubKegiatan: async (req, res) => {
    const { kode, nama, unitKerjaId, kegiatanId } = req.body;
    const { id } = req.params;
    try {
      const result = await subKegPer.update(
        {
          unitKerjaId,
          kode,
          nama,
          kegiatanId,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editKegiatan: async (req, res) => {
    const { kode, nama, unitKerjaId, programId } = req.body;
    const { id } = req.params;
    try {
      const result = await kegiatan.update(
        {
          unitKerjaId,
          kode,
          nama,
          programId,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editProgram: async (req, res) => {
    const { kode, nama, unitKerjaId } = req.body;
    const { id } = req.params;
    try {
      const result = await program.update(
        {
          unitKerjaId,
          kode,
          nama,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteSubKegiatan: async (req, res) => {
    const { id } = req.params;
    try {
      // Cek apakah subKegPer ada
      const subKegiatan = await subKegPer.findOne({
        where: { id },
        paranoid: true, // Hanya cek yang belum di-soft delete
      });

      if (!subKegiatan) {
        return res.status(404).json({ error: "Sub Kegiatan tidak ditemukan" });
      }

      // Soft delete menggunakan destroy() - akan mengisi deletedAt
      const result = await subKegPer.destroy({
        where: { id },
      });

      return res.status(200).json({
        message: "Sub Kegiatan berhasil dihapus",
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteKegiatan: async (req, res) => {
    const { id } = req.params;
    try {
      // Cek apakah subKegPer ada
      const cekKegiatan = await kegiatan.findOne({
        where: { id },
        paranoid: true, // Hanya cek yang belum di-soft delete
      });

      if (!cekKegiatan) {
        return res.status(404).json({ error: "Sub Kegiatan tidak ditemukan" });
      }

      // Soft delete menggunakan destroy() - akan mengisi deletedAt
      const result = await kegiatan.destroy({
        where: { id },
      });

      return res.status(200).json({
        message: "Sub Kegiatan berhasil dihapus",
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDashboard: async (req, res) => {
    const { tahun, indukUnitKerjaId } = req.query;
    try {
      // Query conditions
      const whereCondition = {};
      if (indukUnitKerjaId) {
        whereCondition.indukUnitKerjaId = indukUnitKerjaId;
      }

      const tahunAnggaranWhere = {};
      if (tahun) {
        tahunAnggaranWhere.tahun = parseInt(tahun);
      }

      // 1. Total Program, Kegiatan, Sub Kegiatan
      const totalProgram = await program.count({
        paranoid: true,
        include: [
          {
            model: daftarUnitKerja,
            where: whereCondition,
            attributes: [],
          },
        ],
      });

      const totalKegiatan = await kegiatan.count({
        paranoid: true,
        include: [
          {
            model: daftarUnitKerja,
            where: whereCondition,
            attributes: [],
          },
        ],
      });

      const totalSubKegiatan = await subKegPer.count({
        paranoid: true,
        include: [
          {
            model: daftarUnitKerja,
            where: whereCondition,
            attributes: [],
          },
        ],
      });

      const totalIndikator = await indikator.count({
        include: [
          {
            model: subKegPer,
            paranoid: true,
            include: [
              {
                model: daftarUnitKerja,
                where: whereCondition,
                attributes: [],
              },
            ],
          },
        ],
      });

      // 2. Total Target dan Capaian
      const targetData = await target.findAll({
        include: [
          {
            model: indikator,
            include: [
              {
                model: subKegPer,
                paranoid: true,
                include: [
                  {
                    model: daftarUnitKerja,
                    where: whereCondition,
                    attributes: [],
                    required: true,
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
          {
            model: targetTriwulan,
            attributes: ["id", "nilai"],
            include: [
              {
                model: namaTarget,
                attributes: ["id", "nama"],
              },
            ],
          },
          {
            model: capaian,
            attributes: ["id", "nilai", "anggaran"],
          },
          {
            model: tahunAnggaran,
            where: tahunAnggaranWhere,
            include: [
              {
                model: jenisAnggaran,
                attributes: ["id", "jenis"],
              },
            ],
          },
        ],
      });

      // Hitung total target (dari targetTriwulan)
      let totalTargetNilai = 0;
      let totalCapaianNilai = 0;
      let totalAnggaranMurni = 0;
      let totalAnggaranPerubahan = 0;
      let totalAnggaranDirealisasikan = 0;
      // Inisialisasi target dan capaian per triwulan dengan nilai 0 untuk semua triwulan
      let targetPerTriwulan = {
        T1: 0,
        T2: 0,
        T3: 0,
        T4: 0,
      };
      let capaianPerTriwulan = {
        T1: 0,
        T2: 0,
        T3: 0,
        T4: 0,
      };
      let anggaranPerJenis = {};

      targetData.forEach((targetItem) => {
        // Hitung total nilai target dari targetTriwulan dan kelompokkan per triwulan
        const targetTriwulans = targetItem.targetTriwulans || [];
        targetTriwulans.forEach((triwulanItem) => {
          const nilai = parseInt(triwulanItem.nilai) || 0;
          totalTargetNilai += nilai;

          // Dapatkan informasi triwulan dari namaTarget
          const namaTargetNama = triwulanItem.namaTarget?.nama || "";
          // Ekstrak angka triwulan dari nama (misalnya "Triwulan 1", "T1", "1", dll)
          let triwulan = 0;
          if (namaTargetNama) {
            const match = namaTargetNama.match(/(\d+)/);
            if (match) {
              triwulan = parseInt(match[1]);
            }
          }

          // Kelompokkan target per triwulan
          if (triwulan >= 1 && triwulan <= 4) {
            targetPerTriwulan[`T${triwulan}`] += nilai;
          }
        });

        // Hitung total nilai capaian
        const capaians = targetItem.capaians || [];
        capaians.forEach((cap) => {
          const nilai = parseInt(cap.nilai) || 0;
          totalCapaianNilai += nilai;

          // Hitung capaian per triwulan (bulan 1-3 = T1, 4-6 = T2, 7-9 = T3, 10-12 = T4)
          const bulan = parseInt(cap.bulan) || 0;
          let triwulan = 0;
          if (bulan >= 1 && bulan <= 3) triwulan = 1;
          else if (bulan >= 4 && bulan <= 6) triwulan = 2;
          else if (bulan >= 7 && bulan <= 9) triwulan = 3;
          else if (bulan >= 10 && bulan <= 12) triwulan = 4;

          if (triwulan > 0) {
            capaianPerTriwulan[`T${triwulan}`] += nilai;
          }

          // Hitung anggaran yang direalisasikan
          const anggaran = parseInt(cap.anggaran) || 0;
          totalAnggaranDirealisasikan += anggaran;
        });

        // Pisahkan anggaran murni dan anggaran perubahan
        const tahunAnggarans = targetItem.tahunAnggarans || [];
        tahunAnggarans.forEach((ta) => {
          const anggaran = parseInt(ta.anggaran) || 0;
          const jenisAnggaranId = ta.jenisAnggaranId;

          // Pisahkan berdasarkan jenis anggaran
          if (jenisAnggaranId === 1) {
            // Anggaran Murni
            totalAnggaranMurni += anggaran;
          } else if (jenisAnggaranId === 2) {
            // Anggaran Perubahan
            totalAnggaranPerubahan += anggaran;
          }

          // Hitung anggaran per jenis (untuk grafik, tetap tampilkan keduanya)
          const jenisNama = ta.jenisAnggaran?.jenis || "Tidak Diketahui";
          if (!anggaranPerJenis[jenisNama]) {
            anggaranPerJenis[jenisNama] = {
              direncanakan: 0,
              direalisasikan: 0,
            };
          }
          anggaranPerJenis[jenisNama].direncanakan += anggaran;
        });
      });

      // Total anggaran direncanakan: gunakan perubahan jika ada, jika tidak gunakan murni
      const totalAnggaranDirencanakan =
        totalAnggaranPerubahan > 0
          ? totalAnggaranPerubahan
          : totalAnggaranMurni;

      // Hitung anggaran direalisasikan per jenis dari capaian
      targetData.forEach((targetItem) => {
        const capaians = targetItem.capaians || [];
        const tahunAnggarans = targetItem.tahunAnggarans || [];

        capaians.forEach((cap) => {
          // Ambil jenis anggaran dari tahunAnggaran yang terkait dengan target ini
          if (tahunAnggarans.length > 0) {
            const jenisNama =
              tahunAnggarans[0].jenisAnggaran?.jenis || "Tidak Diketahui";
            const anggaran = parseInt(cap.anggaran) || 0;

            if (!anggaranPerJenis[jenisNama]) {
              anggaranPerJenis[jenisNama] = {
                direncanakan: 0,
                direalisasikan: 0,
              };
            }
            anggaranPerJenis[jenisNama].direalisasikan += anggaran;
          }
        });
      });

      // Hitung persentase capaian
      const persentaseCapaian =
        totalTargetNilai > 0
          ? ((totalCapaianNilai / totalTargetNilai) * 100).toFixed(2)
          : 0;

      // Hitung persentase serapan anggaran
      const persentaseSerapanAnggaran =
        totalAnggaranDirencanakan > 0
          ? (
              (totalAnggaranDirealisasikan / totalAnggaranDirencanakan) *
              100
            ).toFixed(2)
          : 0;

      // Format anggaran per jenis
      const anggaranPerJenisFormatted = Object.keys(anggaranPerJenis).map(
        (jenis) => {
          const data = anggaranPerJenis[jenis];
          const persentase =
            data.direncanakan > 0
              ? ((data.direalisasikan / data.direncanakan) * 100).toFixed(2)
              : 0;
          return {
            jenis,
            anggaranDirencanakan: data.direncanakan,
            anggaranDirealisasikan: data.direalisasikan,
            persentaseSerapan: parseFloat(persentase),
          };
        }
      );

      // 3. Statistik per Unit Kerja (jika tidak ada filter indukUnitKerjaId)
      let statistikPerUnitKerja = [];
      if (!indukUnitKerjaId) {
        const unitKerjas = await daftarUnitKerja.findAll({
          attributes: ["id", "unitKerja"],
        });

        statistikPerUnitKerja = await Promise.all(
          unitKerjas.map(async (unit) => {
            const unitTargets = await target.findAll({
              include: [
                {
                  model: indikator,
                  include: [
                    {
                      model: subKegPer,
                      paranoid: true,
                      include: [
                        {
                          model: daftarUnitKerja,
                          where: { id: unit.id },
                          attributes: [],
                          required: true,
                        },
                      ],
                      required: true,
                    },
                  ],
                  required: true,
                },
                {
                  model: targetTriwulan,
                  attributes: ["id", "nilai"],
                },
                {
                  model: capaian,
                  attributes: ["id", "nilai", "anggaran"],
                },
                {
                  model: tahunAnggaran,
                  where: tahunAnggaranWhere,
                  include: [
                    {
                      model: jenisAnggaran,
                      attributes: ["id", "jenis"],
                    },
                  ],
                },
              ],
            });

            let unitTargetNilai = 0;
            let unitCapaianNilai = 0;
            let unitAnggaranMurni = 0;
            let unitAnggaranPerubahan = 0;
            let unitAnggaranDirealisasikan = 0;

            unitTargets.forEach((t) => {
              (t.targetTriwulans || []).forEach((triwulan) => {
                unitTargetNilai += parseInt(triwulan.nilai) || 0;
              });
              (t.capaians || []).forEach((cap) => {
                unitCapaianNilai += parseInt(cap.nilai) || 0;
                unitAnggaranDirealisasikan += parseInt(cap.anggaran) || 0;
              });

              // Pisahkan anggaran murni dan anggaran perubahan
              (t.tahunAnggarans || []).forEach((ta) => {
                const anggaran = parseInt(ta.anggaran) || 0;
                if (ta.jenisAnggaranId === 1) {
                  // Anggaran Murni
                  unitAnggaranMurni += anggaran;
                } else if (ta.jenisAnggaranId === 2) {
                  // Anggaran Perubahan
                  unitAnggaranPerubahan += anggaran;
                }
              });
            });

            // Gunakan anggaran perubahan jika ada, jika tidak gunakan anggaran murni untuk perhitungan serapan
            const unitAnggaranDirencanakan =
              unitAnggaranPerubahan > 0
                ? unitAnggaranPerubahan
                : unitAnggaranMurni;

            const unitPersentaseCapaian =
              unitTargetNilai > 0
                ? ((unitCapaianNilai / unitTargetNilai) * 100).toFixed(2)
                : 0;

            const unitPersentaseSerapan =
              unitAnggaranDirencanakan > 0
                ? (
                    (unitAnggaranDirealisasikan / unitAnggaranDirencanakan) *
                    100
                  ).toFixed(2)
                : 0;

            return {
              unitKerjaId: unit.id,
              unitKerja: unit.unitKerja,
              totalTarget: unitTargetNilai,
              totalCapaian: unitCapaianNilai,
              persentaseCapaian: parseFloat(unitPersentaseCapaian),
              anggaranMurni: unitAnggaranMurni,
              anggaranPerubahan: unitAnggaranPerubahan,
              anggaranDirencanakan: unitAnggaranDirencanakan, // Yang digunakan untuk perhitungan serapan
              anggaranDirealisasikan: unitAnggaranDirealisasikan,
              persentaseSerapanAnggaran: parseFloat(unitPersentaseSerapan),
            };
          })
        );
      }

      return res.status(200).json({
        statistik: {
          totalProgram,
          totalKegiatan,
          totalSubKegiatan,
          totalIndikator,
        },
        capaian: {
          totalTarget: totalTargetNilai,
          totalCapaian: totalCapaianNilai,
          persentaseCapaian: parseFloat(persentaseCapaian),
          targetPerTriwulan,
          capaianPerTriwulan,
        },
        anggaran: {
          totalAnggaranDirencanakan,
          totalAnggaranDirealisasikan,
          persentaseSerapanAnggaran: parseFloat(persentaseSerapanAnggaran),
          anggaranPerJenis: anggaranPerJenisFormatted,
        },
        statistikPerUnitKerja,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
