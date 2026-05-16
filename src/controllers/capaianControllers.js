const {
  rincianBPD,
  rill,
  daftarUnitKerja,
  sequelize,
  user,
  userRole,
  role,
  profile,
  program,
  kegiatan,
  subKegPer,
  indikator,
  target,
  satuanIndikator,
  tahunAnggaran,
  jenisAnggaran,
  capaian,
  namaTarget,
  targetTriwulan,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postCapaian: async (req, res) => {
    const { targetId, nilai, bulan, anggaran, bukti } = req.body;
    console.log(req.body);
    try {
      const result = await capaian.create({
        targetId,
        nilai,
        bulan,
        anggaran,
        bukti,
        status: "pengajuan",
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  // getAllCapaian: async (req, res) => {
  //   const { id } = req.params;

  //   try {
  //     const result = await capaian.findAll({
  //       include: [
  //         {
  //           model: target,
  //           required: true,
  //           include: [
  //             {
  //               model: indikator,
  //               required: true,
  //               include: [
  //                 {
  //                   model: subKegPer,
  //                   where: { unitKerjaId: id },
  //                   required: true,
  //                 },
  //               ],
  //             },
  //             {
  //               model: targetTriwulan,
  //             },
  //           ],
  //         },
  //       ],
  //     });
  //     return res.status(200).json({ result });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // },
  getAllCapaian: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await target.findAll({
        include: [
          { model: capaian, required: true },
          {
            model: targetTriwulan,
            include: [{ model: namaTarget }],
            required: true,
          },
          {
            model: tahunAnggaran,
            include: [{ model: jenisAnggaran }],
            required: true,
          },
          {
            model: indikator,
            required: true,
            where: { unitKerjaId: id },
            include: [
              { model: program },
              { model: kegiatan },
              { model: subKegPer },
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
  terimaCapaian: async (req, res) => {
    const { id } = req.params;
    const status = req.body.status;
    console.log(id, req.body);
    try {
      const result = await capaian.update({ status }, { where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editCapaian: async (req, res) => {
    const { id } = req.params;
    const { nilai, bulan, anggaran, bukti } = req.body;
    console.log(id, req.body);
    try {
      const result = await capaian.update(
        { nilai, bulan, anggaran, bukti },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
