const {
  rincianBPD,
  rill,
  daftarUnitKerja,
  sequelize,
  user,
  userRole,
  role,
  profile,
  bangunan,
  jenisBangunan,
  kondisiBangunan,
  penghuni,
  rehabBangunan,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postBangunan: async (req, res) => {
    console.log(req.body);
    const {
      indukUnitKerjaId,
      nama,
      alamat,
      jenisBangunanId,
      luasTanah,
      luasBangunan,
      tahunPembangunan,
      kondisiBangunanId,
      EMBD,
      sertifikatTanah,
      kepemilikanTanah,
    } = req.body;

    try {
      await bangunan.create({
        indukUnitKerjaId,
        nama,
        alamat,
        jenisBangunanId,
        luasTanah,
        luasBangunan,
        tahunPembangunan,
        kondisiBangunanId,
        EMBD,
        sertifikatTanah,
        kepemilikanTanah,
      });

      return res.status(200).json({
        message: "berhasil tambah data",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err,
      });
    }
  },
  getBangunan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId);
    const jenisBangunanId = parseInt(req.query.jenisBangunanId);
    const kondisiBangunanId = parseInt(req.query.kondisiBangunanId);
    const nama = parseInt(req.query.nama) || "";
    const whereCondition = { nama: { [Op.like]: "%" + nama + "%" } };

    if (indukUnitKerjaId) {
      whereCondition.indukUnitKerjaId = indukUnitKerjaId;
    }
    if (jenisBangunanId) {
      whereCondition.jenisBangunanId = jenisBangunanId;
    }
    if (kondisiBangunanId) {
      whereCondition.kondisiBangunanId = kondisiBangunanId;
    }

    try {
      const result = await bangunan.findAndCountAll({
        limit,
        where: whereCondition,
        offset,
        include: [
          {
            model: jenisBangunan,
          },

          {
            model: kondisiBangunan,
          },
          {
            model: penghuni,
          },
          {
            model: rehabBangunan,
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
