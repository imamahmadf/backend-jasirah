const {
  aset,
  jenisAset,
  kondisiAset,
  pengeluaran,
  pegawai,
  daftarUnitKerja,
  mutasiAset,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const includeAset = [
  { model: jenisAset, attributes: ["id", "nama"] },
  { model: kondisiAset, attributes: ["id", "nama"] },
  {
    model: pengeluaran,
    attributes: ["id", "deskripsi", "tanggal", "nominal"],
  },
  {
    model: pegawai,
    as: "penanggungJawab",
    attributes: ["id", "nama", "nip"],
  },
  { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
];

const includeMutasi = {
  model: mutasiAset,
  separate: true,
  order: [
    ["tanggal", "DESC"],
    ["id", "DESC"],
  ],
  include: [
    {
      model: daftarUnitKerja,
      as: "unitKerjaAsal",
      attributes: ["id", "unitKerja"],
    },
    {
      model: daftarUnitKerja,
      as: "unitKerjaTujuan",
      attributes: ["id", "unitKerja"],
    },
    {
      model: pegawai,
      as: "penanggungJawabAsal",
      attributes: ["id", "nama"],
    },
    {
      model: pegawai,
      as: "penanggungJawabTujuan",
      attributes: ["id", "nama"],
    },
  ],
};

const findDetailAset = (id) =>
  aset.findOne({
    where: { id },
    include: [...includeAset, includeMutasi],
  });

const toInt = (val) => {
  if (val === "" || val == null || val === undefined) return null;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? null : n;
};

const buildPayload = (body, foto) => {
  const payload = {
    nama: body.nama?.trim() || null,
    kode: body.kode?.trim() || null,
    pengeluaranId: toInt(body.pengeluaranId),
    harga: toInt(body.harga) || 0,
    jenisAsetId: toInt(body.jenisAsetId),
    tanggal: body.tanggal || null,
    kondisiAsetId: toInt(body.kondisiAsetId),
    merek: body.merek?.trim() || null,
    spesifikasi: body.spesifikasi?.trim() || null,
    penanggungjawabId: toInt(body.penanggungjawabId),
    unitKerjaId: toInt(body.unitKerjaId),
  };
  if (foto !== undefined) payload.foto = foto;
  return payload;
};

module.exports = {
  getAset: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 0;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = limit * page;
      const q = req.query.q?.trim();
      const where = {};

      if (q) {
        where[Op.or] = [
          { nama: { [Op.like]: `%${q}%` } },
          { kode: { [Op.like]: `%${q}%` } },
          { merek: { [Op.like]: `%${q}%` } },
        ];
      }
      if (req.query.unitKerjaId) where.unitKerjaId = req.query.unitKerjaId;
      if (req.query.jenisAsetId) where.jenisAsetId = req.query.jenisAsetId;
      if (req.query.kondisiAsetId) where.kondisiAsetId = req.query.kondisiAsetId;
      if (req.query.pengeluaranId) where.pengeluaranId = req.query.pengeluaranId;

      const result = await aset.findAndCountAll({
        where,
        include: includeAset,
        limit,
        offset,
        order: [["id", "DESC"]],
        distinct: true,
      });

      return res.status(200).json({
        result: result.rows,
        page,
        limit,
        totalRows: result.count,
        totalPage: Math.ceil(result.count / limit),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal mengambil data aset",
        error: err.toString(),
      });
    }
  },

  getDetail: async (req, res) => {
    try {
      const result = await findDetailAset(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Aset tidak ditemukan" });
      }
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal mengambil detail aset",
        error: err.toString(),
      });
    }
  },

  getSeed: async (req, res) => {
    try {
      const [jenis, kondisi, unitKerja] = await Promise.all([
        jenisAset.findAll({ order: [["nama", "ASC"]] }),
        kondisiAset.findAll({ order: [["nama", "ASC"]] }),
        daftarUnitKerja.findAll({
          attributes: ["id", "unitKerja"],
          order: [["unitKerja", "ASC"]],
        }),
      ]);
      return res.status(200).json({
        jenis,
        kondisi,
        unitKerja,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal mengambil data master aset",
        error: err.toString(),
      });
    }
  },

  getKodeBerikutnya: async (req, res) => {
    try {
      const year = new Date().getFullYear();
      const prefix = `AST-${year}-`;
      const last = await aset.findOne({
        where: { kode: { [Op.like]: `${prefix}%` } },
        order: [["id", "DESC"]],
      });
      let next = 1;
      if (last?.kode) {
        const num = parseInt(String(last.kode).split("-").pop(), 10);
        if (!Number.isNaN(num)) next = num + 1;
      }
      let kode = `${prefix}${String(next).padStart(4, "0")}`;
      while (await aset.findOne({ where: { kode }, attributes: ["id"] })) {
        next += 1;
        kode = `${prefix}${String(next).padStart(4, "0")}`;
      }
      return res.status(200).json({ kode });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal membuat kode aset",
        error: err.toString(),
      });
    }
  },

  postJenis: async (req, res) => {
    try {
      const nama = req.body.nama?.trim();
      if (!nama) {
        return res.status(400).json({ message: "Nama jenis aset wajib diisi" });
      }
      const existing = await jenisAset.findOne({ where: { nama } });
      if (existing) return res.status(200).json({ result: existing });
      const result = await jenisAset.create({ nama });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal menyimpan jenis aset",
        error: err.toString(),
      });
    }
  },

  postKondisi: async (req, res) => {
    try {
      const nama = req.body.nama?.trim();
      if (!nama) {
        return res
          .status(400)
          .json({ message: "Nama kondisi aset wajib diisi" });
      }
      const existing = await kondisiAset.findOne({ where: { nama } });
      if (existing) return res.status(200).json({ result: existing });
      const result = await kondisiAset.create({ nama });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal menyimpan kondisi aset",
        error: err.toString(),
      });
    }
  },

  postAset: async (req, res) => {
    try {
      const payload = buildPayload(
        req.body,
        req.file ? `/aset/${req.file.filename}` : null,
      );
      if (!payload.nama || !payload.kode) {
        return res
          .status(400)
          .json({ message: "Nama dan kode aset wajib diisi" });
      }
      const duplikat = await aset.findOne({
        where: { kode: payload.kode },
        attributes: ["id"],
      });
      if (duplikat) {
        return res.status(400).json({ message: "Kode aset sudah digunakan" });
      }
      const result = await aset.create(payload);
      const detail = await aset.findOne({
        where: { id: result.id },
        include: includeAset,
      });
      return res.status(200).json({ result: detail });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal menyimpan aset",
        error: err.toString(),
      });
    }
  },

  editAset: async (req, res) => {
    try {
      const current = await aset.findByPk(req.params.id);
      if (!current) {
        return res.status(404).json({ message: "Aset tidak ditemukan" });
      }
      const foto = req.file
        ? `/aset/${req.file.filename}`
        : req.body.foto || current.foto;
      const payload = buildPayload(req.body, foto);
      if (!payload.nama || !payload.kode) {
        return res
          .status(400)
          .json({ message: "Nama dan kode aset wajib diisi" });
      }
      const duplikat = await aset.findOne({
        where: { kode: payload.kode, id: { [Op.ne]: current.id } },
        attributes: ["id"],
      });
      if (duplikat) {
        return res.status(400).json({ message: "Kode aset sudah digunakan" });
      }
      await current.update(payload);
      const detail = await aset.findOne({
        where: { id: current.id },
        include: includeAset,
      });
      return res.status(200).json({ result: detail });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal mengubah aset",
        error: err.toString(),
      });
    }
  },

  postMutasi: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const current = await aset.findByPk(req.params.id, { transaction });
      if (!current) {
        await transaction.rollback();
        return res.status(404).json({ message: "Aset tidak ditemukan" });
      }

      const unitKerjaTujuanId = toInt(req.body.unitKerjaTujuanId);
      const penanggungjawabTujuanId = toInt(req.body.penanggungjawabTujuanId);
      if (!unitKerjaTujuanId) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Unit kerja tujuan wajib dipilih" });
      }
      if (unitKerjaTujuanId === current.unitKerjaId) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Unit kerja tujuan harus berbeda dari unit kerja saat ini",
        });
      }
      if (!req.body.tanggal) {
        await transaction.rollback();
        return res.status(400).json({ message: "Tanggal mutasi wajib diisi" });
      }

      await mutasiAset.create(
        {
          asetId: current.id,
          unitKerjaAsalId: current.unitKerjaId,
          unitKerjaTujuanId,
          penanggungjawabAsalId: current.penanggungjawabId,
          penanggungjawabTujuanId:
            penanggungjawabTujuanId || current.penanggungjawabId,
          tanggal: req.body.tanggal,
          keterangan: req.body.keterangan?.trim() || null,
        },
        { transaction },
      );

      await current.update(
        {
          unitKerjaId: unitKerjaTujuanId,
          penanggungjawabId:
            penanggungjawabTujuanId || current.penanggungjawabId,
        },
        { transaction },
      );

      await transaction.commit();
      const result = await findDetailAset(current.id);
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        message: "Gagal mencatat mutasi aset",
        error: err.toString(),
      });
    }
  },

  hapusAset: async (req, res) => {
    try {
      const deleted = await aset.destroy({ where: { id: req.params.id } });
      if (!deleted) {
        return res.status(404).json({ message: "Aset tidak ditemukan" });
      }
      return res.status(200).json({ message: "Aset berhasil dihapus" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal menghapus aset",
        error: err.toString(),
      });
    }
  },
};
