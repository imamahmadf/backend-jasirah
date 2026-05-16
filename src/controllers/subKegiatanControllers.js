const {
  daftarSubKegiatan,
  perjalanan,
  profile,
  personil,
  rincianBPD,
  tipePerjalanan,
  tempat,
  jenisPerjalanan,
  anggaran,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getSubKegiatan: async (req, res) => {
    const unitKerjaId = req.params.id;
    try {
      const result = await daftarSubKegiatan.findAll({
        where: { unitKerjaId },
        attributes: ["id", "kodeRekening", "subKegiatan", "anggaran"],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getSubKegiatanLaporan: async (req, res) => {
    const unitKerjaId = req.params.id;
    const filterTahun = req.query.filterTahun;

    console.log(filterTahun, "tahun");

    const whereTempat = {};
    const whereAnggaran = {};

    if (filterTahun) {
      const awalTahun = new Date(`${filterTahun}-01-01`);
      const akhirTahun = new Date(`${Number(filterTahun) + 1}-01-01`);

      whereTempat.tanggalBerangkat = {
        [Op.gte]: awalTahun,
        [Op.lt]: akhirTahun,
      };

      whereAnggaran.tahun = {
        [Op.gte]: awalTahun,
        [Op.lt]: akhirTahun,
      };
    }

    try {
      const result = await daftarSubKegiatan.findAll({
        where: { unitKerjaId },
        attributes: ["id", "kodeRekening", "subKegiatan"],
        include: [
          {
            model: perjalanan,
            attributes: ["id"],
            include: [
              {
                model: personil,
                attributes: ["id", "statusId"],
                include: [{ model: rincianBPD, attributes: ["nilai"] }],
              },
              {
                model: jenisPerjalanan,
                attributes: ["id", "tipePerjalananId"],
              },
              {
                model: tempat,
                attributes: ["id", "tanggalBerangkat"],
                where: filterTahun ? whereTempat : undefined,
              },
            ],
          },
          {
            model: anggaran,
            attributes: ["id", "nilai", "tahun", "tipePerjalananId"],
            where: filterTahun ? whereAnggaran : undefined,
            required: false,
          },
        ],
      });

      const formattedResult = result.map((item) => {
        const groupedAnggaran = {};

        item.anggarans.forEach((a) => {
          const tahun = new Date(a.tahun).getFullYear();
          const key = `${tahun}-${a.tipePerjalananId}`;
          groupedAnggaran[key] = {
            tahun,
            tipePerjalananId: a.tipePerjalananId,
            anggaran: a.nilai,
            totalRealisasi: 0,
            id: a.id,
          };
        });

        item.perjalanans.forEach((perjalanan) => {
          const tipeId = perjalanan.jenisPerjalanan?.tipePerjalananId;
          const tanggalBerangkat = perjalanan.tempats?.[0]?.tanggalBerangkat;
          const tahunBerangkat = tanggalBerangkat
            ? new Date(tanggalBerangkat).getFullYear()
            : null;

          if (!tipeId || !tahunBerangkat) return;

          const key = `${tahunBerangkat}-${tipeId}`;
          if (!groupedAnggaran[key]) return;

          perjalanan.personils.forEach((personil) => {
            if (personil.statusId !== null) {
              personil.rincianBPDs.forEach((rincian) => {
                groupedAnggaran[key].totalRealisasi += rincian.nilai || 0;
              });
            }
          });
        });

        return {
          id: item.id,
          kodeRekening: item.kodeRekening,
          subKegiatan: item.subKegiatan,
          anggaranByTipe: Object.values(groupedAnggaran),
        };
      });

      const resultTipe = await tipePerjalanan.findAll({});

      return res.status(200).json({ result: formattedResult, resultTipe });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteSubKegiatan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await daftarSubKegiatan.destroy({
        where: { id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editSubKegiatan: async (req, res) => {
    const { subKegiatan, kodeRekening, anggaran } = req.body;
    const id = req.params.id;
    console.log(req.body, "bukan ini");
    try {
      const result = await daftarSubKegiatan.update(
        {
          subKegiatan,
          kodeRekening,
          anggaran,
        },
        {
          where: { id },
        }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postSubKegiatan: async (req, res) => {
    console.log(req.body);
    const { subKegiatan, kodeRekening, unitKerjaId } = req.body;
    try {
      const result = await daftarSubKegiatan.create({
        subKegiatan,
        kodeRekening,

        unitKerjaId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postAnggaran: async (req, res) => {
    console.log(req.body, "bukan ini");
    const { nilai, tahun, tipePerjalananId, subKegiatanId } = req.body;
    console.log("Tahun dikirim ke DB:", new Date(`${tahun}-01`));

    try {
      const result = await anggaran.create({
        nilai,
        tahun: new Date(`${tahun}-01`),
        tipePerjalananId,
        subKegiatanId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editAnggaran: async (req, res) => {
    console.log(req.body, "cek data ya");
    const { nilai, id } = req.body;

    try {
      const result = await anggaran.update(
        {
          nilai,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
