const { Op } = require("sequelize");
const { stasiunPengumpulMinyak, tanki, suratJalan } = require("../models");
const { notifyDashboardChange } = require("../services/dashboardKPBPNService");

module.exports = {
  getStasiunPengumpulMinyak: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const offset = limit * page;
    const search = req.query.search?.trim();

    const whereCondition = {};
    if (search) {
      whereCondition.nama = { [Op.like]: `%${search}%` };
    }

    try {
      const result = await stasiunPengumpulMinyak.findAll({
        where: whereCondition,
        limit,
        offset,
        order: [["nama", "ASC"]],
        include: [
          { model: tanki, as: "tankis", attributes: ["id"] },
          { model: suratJalan, as: "suratJalans", attributes: ["id"] },
        ],
      });

      const totalRows = await stasiunPengumpulMinyak.count({
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

  addStasiunPengumpulMinyak: async (req, res) => {
    try {
      const { nama } = req.body;
      const namaTrim = nama?.trim();

      if (!namaTrim) {
        return res.status(400).json({ error: "Nama stasiun wajib diisi" });
      }

      const result = await stasiunPengumpulMinyak.create({ nama: namaTrim });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "stasiunPengumpulMinyak:created",
        title: "Stasiun Pengumpul Minyak Baru",
        description: `Stasiun ${namaTrim} ditambahkan`,
        entity: "stasiunPengumpulMinyak",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  editStasiunPengumpulMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama } = req.body;
      const namaTrim = nama?.trim();

      if (!namaTrim) {
        return res.status(400).json({ error: "Nama stasiun wajib diisi" });
      }

      const existing = await stasiunPengumpulMinyak.findByPk(id);
      if (!existing) {
        return res
          .status(404)
          .json({ error: "Stasiun pengumpul minyak tidak ditemukan" });
      }

      await stasiunPengumpulMinyak.update(
        { nama: namaTrim },
        { where: { id } },
      );

      const result = await stasiunPengumpulMinyak.findByPk(id);

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "stasiunPengumpulMinyak:updated",
        title: "Stasiun Pengumpul Minyak Diperbarui",
        description: `Stasiun ${namaTrim} diperbarui`,
        entity: "stasiunPengumpulMinyak",
        entityId: result.id,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteStasiunPengumpulMinyak: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await stasiunPengumpulMinyak.findByPk(id);
      if (!existing) {
        return res
          .status(404)
          .json({ error: "Stasiun pengumpul minyak tidak ditemukan" });
      }

      await stasiunPengumpulMinyak.destroy({ where: { id } });

      const io = req.app.get("socketio");
      await notifyDashboardChange(io, {
        type: "stasiunPengumpulMinyak:deleted",
        title: "Stasiun Pengumpul Minyak Dihapus",
        description: `Stasiun ${existing.nama} dihapus`,
        entity: "stasiunPengumpulMinyak",
        entityId: existing.id,
      });

      return res.status(200).json({ message: "Berhasil dihapus" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
