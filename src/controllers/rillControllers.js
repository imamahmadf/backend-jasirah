const {
  rincianBPD,
  rill,
  daftarUnitKerja,
  sequelize,
  user,
  userRole,
  role,
  profile,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postRill: async (req, res) => {
    console.log(req.body);
    const { item, nilai, rincianBPDId, personilId, status, nilaiBPD } =
      req.body;
    const transaction = await sequelize.transaction();
    try {
      if (!status) {
        var rillBPD = await rincianBPD.create(
          {
            personilId,
            item: "Pengeluaran rill",
            nilai,
            jenisId: 5,
            qty: 1,
            satuan: "-",
          },
          { transaction }
        );
      }
      await rill.create(
        {
          rincianBPDId: !status ? rillBPD.id : rincianBPDId,
          item,
          nilai,
        },
        { transaction }
      );

      await rincianBPD.update(
        { nilai: parseInt(nilai) + nilaiBPD },
        { where: { id: !status ? rillBPD.id : rincianBPDId }, transaction }
      );

      await transaction.commit();
      return res.status(200).json({
        message: "berhasil tambah data",
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({
        message: err,
      });
    }
  },
  tes: async (req, res) => {
    try {
      const resultUser = await user.findOne({
        where: { email: "tes@mail.com" },
        include: [
          { model: userRole, include: [{ model: role, attributes: ["nama"] }] },
          {
            model: profile,
            attributes: ["id", "nama", "profilePic"],
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id"],
                as: "unitKerja-profile",
              },
            ],
          },
        ],
      });
      return res.status(200).json({ resultUser });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editRill: async (req, res) => {
    console.log(req.body);
    const { nilai, id, item, oldNilai, rincianBPDId, nilaiBPD } = req.body;
    try {
      const result = await rill.update(
        {
          item,
          nilai,
        },
        {
          where: { id },
        }
      );

      await rincianBPD.update(
        {
          nilai: nilai - oldNilai + nilaiBPD,
        },
        {
          where: { id: rincianBPDId },
        }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  deleteRill: async (req, res) => {
    try {
      const { id, nilai } = req.body;
      const rincianBPDFE = req.body.rincianBPD;
      console.log(rincianBPDFE, nilai, "CEKK");
      if (nilai === rincianBPDFE.nilai) {
        await rincianBPD.destroy({ where: { id: rincianBPDFE.id } });
      } else {
        await rincianBPD.update(
          {
            nilai: rincianBPDFE.nilai - nilai,
          },
          {
            where: { id: rincianBPDFE.id },
          }
        );
      }
      const result = await rill.destroy({
        where: { id },
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
