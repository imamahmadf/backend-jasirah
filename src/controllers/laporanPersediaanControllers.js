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
  pengeluaran,
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
        { where: { id } },
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
    const sumberDanaId = req.query.sumberDanaId;
    const q = req.query.q?.trim();
    const tanggalFrom = req.query.tanggalFrom;
    const tanggalTo = req.query.tanggalTo;
    const page = parseInt(req.query.page, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = page * limit;

    try {
      const laporan = await laporanPersediaan.findByPk(id);
      if (!laporan) {
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      }

      const where = { laporanPersediaanId: id };
      if (unitKerjaId) where.unitKerjaId = unitKerjaId;
      if (sumberDanaId) where.sumberDanaId = sumberDanaId;
      if (tanggalFrom && tanggalTo) {
        where.tanggal = { [Op.between]: [tanggalFrom, `${tanggalTo} 23:59:59`] };
      } else if (tanggalFrom) {
        where.tanggal = { [Op.gte]: tanggalFrom };
      } else if (tanggalTo) {
        where.tanggal = { [Op.lte]: `${tanggalTo} 23:59:59` };
      }
      if (q) {
        where[Op.or] = [
          { spesifikasi: { [Op.like]: `%${q}%` } },
          { keterangan: { [Op.like]: `%${q}%` } },
          { "$persediaan.nama$": { [Op.like]: `%${q}%` } },
          { "$persediaan.NUSP$": { [Op.like]: `%${q}%` } },
          { "$persediaan.kodeBarang$": { [Op.like]: `%${q}%` } },
          { "$suratPesanan.nomor$": { [Op.like]: `%${q}%` } },
        ];
      }

      const stokInclude = [
        {
          model: persediaan,
          required: false,
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
        { model: suratPesanan, attributes: ["id", "nomor"], required: false },
        { model: satuanPersediaan },
        { model: pengeluaran, attributes: ["id", "foto"] },
        { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
      ];

      const stokResult = await stokMasuk.findAndCountAll({
        where,
        include: stokInclude,
        limit,
        offset,
        order: [
          ["tanggal", "DESC"],
          ["id", "DESC"],
        ],
        distinct: true,
        subQuery: false,
      });

      const result = [
        {
          ...laporan.toJSON(),
          stokMasuks: stokResult.rows,
        },
      ];

      const resultSumberDana = await sumberDana.findAll({
        attributes: ["id", "sumber"],
      });

      const suratPesananInclude = unitKerjaId
        ? [
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
          ]
        : [];

      const resultSuratPesanan = await suratPesanan.findAll({
        attributes: ["id", "nomor"],
        include: suratPesananInclude,
      });

      const resultSatuan = await satuanPersediaan.findAll({});
      return res.status(200).json({
        result,
        resultSumberDana,
        resultSuratPesanan,
        resultSatuan,
        page,
        limit,
        totalRows: stokResult.count,
        totalPage: Math.ceil(stokResult.count / limit),
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

  hapusStokMasuk: async (req, res) => {
    const { id } = req.params;
    try {
      // 1. Ambil data laporan persediaan dari DB lokal
      const result = await stokMasuk.destroy({ where: { id } });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus data stok masuk",
        error: err.toString(),
      });
    }
  },

  editStokMasuk: async (req, res) => {
    const {
      id,
      jumlah,
      hargaSatuan,
      keterangan,
      sumberDanaId,
      satuanPersediaanId,
      spesifikasi,
      foto: fotoExisting,
    } = req.body;

    const toInt = (val) => {
      if (val === "" || val == null || val === undefined) return null;
      const n = parseInt(val, 10);
      return Number.isNaN(n) ? null : n;
    };

    try {
      let foto = fotoExisting || null;
      if (req.file) {
        foto = `/persediaan/${req.file.filename}`;
      }

      const result = await stokMasuk.update(
        {
          jumlah: toInt(jumlah),
          hargaSatuan: toInt(hargaSatuan),
          keterangan: keterangan || null,
          sumberDanaId: toInt(sumberDanaId),
          satuanPersediaanId: toInt(satuanPersediaanId),
          spesifikasi: spesifikasi || null,
          foto,
        },
        { where: { id: toInt(id) } },
      );

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengubah data stok masuk",
        error: err.toString(),
      });
    }
  },
};
