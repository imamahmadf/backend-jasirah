const {
  laporanPersediaan,
  stokMasuk,
  persediaan,
  tipePersediaan,
  rinObPersediaan,
  obPersediaan,
  sumberDana,
  suratPesanan,
  indukUnitKerja,
  daftarUnitKerja,
  satuanPersediaan,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getLaporan: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;

    try {
      // 1. Ambil data laporan persediaan dari DB lokal
      const resultLaporan = await laporanPersediaan.findAndCountAll({
        limit,
        offset,
        order: [["tanggalAwal", "ASC"]],
      });

      // 2. Implementasi pagination
      const totalRows = resultLaporan.count;
      const totalPage = Math.ceil(totalRows / limit);
      const result = resultLaporan.rows;

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
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data laporan persediaan",
        error: err.toString(),
      });
    }
  },

  postLaporan: async (req, res) => {
    const { nama, awal, akhir } = req.body;
    try {
      // 1. Ambil data laporan persediaan dari DB lokal
      const result = await laporanPersediaan.create({
        nama,
        status: "buka",
        tanggalAwal: awal,
        tanggalAkhir: akhir,
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data laporan persediaan",
        error: err.toString(),
      });
    }
  },

  editStatus: async (req, res) => {
    const { id, status } = req.body;
    try {
      // 1. Ambil data laporan persediaan dari DB lokal
      const result = await laporanPersediaan.update(
        {
          status: status == "buka" ? "tutup" : "buka",
        },
        { where: { id } }
      );

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data laporan persediaan",
        error: err.toString(),
      });
    }
  },

  getDetailLaporan: async (req, res) => {
    const id = req.params.id;
    const unitKerjaId = req.query.unitKerjaId;
    console.log(req.query, id, "CEKKKKKKKK");

    try {
      // 1. Ambil data laporan persediaan dari DB lokal
      const result = await laporanPersediaan.findAll({
        where: { id },
        include: [
          {
            model: stokMasuk,
            include: [
              {
                model: persediaan,
                include: [
                  {
                    model: tipePersediaan,
                    include: [
                      {
                        model: rinObPersediaan,
                        include: [{ model: obPersediaan }],
                      },
                    ],
                  },
                ],
              },
              { model: sumberDana, attributes: ["id", "sumber"] },
              { model: suratPesanan, attributes: ["id", "nomor"] },
              { model: satuanPersediaan },
            ],
            where: { unitKerjaId },
          },
        ],
      });

      const resultSumberDana = await sumberDana.findAll({
        attributes: ["id", "sumber"],
      });
      const resultSuratPesanan = await suratPesanan.findAll({
        attributes: ["id", "nomor"],
        include: [
          {
            model: indukUnitKerja,
            attributes: ["id"],
            required: true,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id"],
                required: true,
                where: { id: unitKerjaId },
              },
            ],
          },
        ],
      });

      const resultSatuan = await satuanPersediaan.findAll({});
      return res.status(200).json({
        result,
        resultSumberDana,
        resultSuratPesanan,
        resultSatuan,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data laporan persediaan",
        error: err.toString(),
      });
    }
  },
};
