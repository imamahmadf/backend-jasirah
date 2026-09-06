const { Op } = require("sequelize");
const { asalMinyak, suratJalan } = require("../models");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

module.exports = {
  getAsalMinyak: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const offset = limit * page;
    const search = req.query.search?.trim();

    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { nomor: { [Op.like]: `%${search}%` } },
        { asal: { [Op.like]: `%${search}%` } },
      ];
    }

    try {
      const result = await asalMinyak.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [["nomor", "ASC"]],
        include: [
          { model: suratJalan, as: "suratJalans", attributes: ["id"] },
        ],
      });

      const totalRows = await asalMinyak.count({
        where: whereCondition,
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  addAsalMinyak: async (req, res) => {
    try {
      const nomorTrim = req.body.nomor?.trim();
      const asalTrim = req.body.asal?.trim();

      if (!nomorTrim || !asalTrim) {
        return res.status(400).json({ error: "Nomor dan asal wajib diisi" });
      }

      const nomorDipakai = await asalMinyak.findOne({
        where: { nomor: nomorTrim },
      });
      if (nomorDipakai) {
        return res.status(400).json({ error: "Nomor asal minyak sudah digunakan" });
      }

      const result = await asalMinyak.create({
        nomor: nomorTrim,
        asal: asalTrim,
      });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "asalMinyak:created",
        title: "Asal Minyak Baru",
        description: `Asal minyak ${nomorTrim} - ${asalTrim} ditambahkan`,
        entity: "asalMinyak",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  editAsalMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const nomorTrim = req.body.nomor?.trim();
      const asalTrim = req.body.asal?.trim();

      if (!nomorTrim || !asalTrim) {
        return res.status(400).json({ error: "Nomor dan asal wajib diisi" });
      }

      const existing = await asalMinyak.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Asal minyak tidak ditemukan" });
      }

      const nomorDipakai = await asalMinyak.findOne({
        where: {
          nomor: nomorTrim,
          id: { [Op.ne]: id },
        },
      });
      if (nomorDipakai) {
        return res.status(400).json({ error: "Nomor asal minyak sudah digunakan" });
      }

      await asalMinyak.update(
        { nomor: nomorTrim, asal: asalTrim },
        { where: { id } },
      );

      const result = await asalMinyak.findByPk(id);

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "asalMinyak:updated",
        title: "Asal Minyak Diperbarui",
        description: `Asal minyak ${nomorTrim} - ${asalTrim} diperbarui`,
        entity: "asalMinyak",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteAsalMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await asalMinyak.findByPk(id, {
        include: [{ model: suratJalan, as: "suratJalans", attributes: ["id"] }],
      });

      if (!existing) {
        return res.status(404).json({ error: "Asal minyak tidak ditemukan" });
      }

      if ((existing.suratJalans || []).length > 0) {
        return res.status(400).json({
          error:
            "Asal minyak tidak dapat dihapus karena masih digunakan surat jalan",
        });
      }

      await asalMinyak.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "asalMinyak:deleted",
        title: "Asal Minyak Dihapus",
        description: `Asal minyak ${existing.nomor || ""} - ${existing.asal || ""} dihapus`,
        entity: "asalMinyak",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
