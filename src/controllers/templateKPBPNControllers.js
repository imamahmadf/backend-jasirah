const fs = require("fs");
const path = require("path");
const { templateKPBPN, sequelize } = require("../models");

const JENIS_DOKUMEN = ["BAST", "BAPenerimaan", "suratJalan"];
const STATUS_VALUES = ["aktif", "nonaktif"];

const deleteFileIfExists = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, "../public", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error(err);
    });
  }
};

const deactivateOtherTemplates = async (jenisDokumen, excludeId, transaction) => {
  await templateKPBPN.update(
    { status: "nonaktif" },
    {
      where: { jenisDokumen },
      transaction,
    },
  );

  if (excludeId) {
    await templateKPBPN.update(
      { status: "aktif" },
      {
        where: { id: excludeId },
        transaction,
      },
    );
  }
};

module.exports = {
  getAllTemplateKPBPN: async (req, res) => {
    try {
      const { jenisDokumen, status } = req.query;
      const where = {};

      if (jenisDokumen && JENIS_DOKUMEN.includes(jenisDokumen)) {
        where.jenisDokumen = jenisDokumen;
      }

      if (status && STATUS_VALUES.includes(status)) {
        where.status = status;
      }

      const result = await templateKPBPN.findAll({
        where,
        order: [
          ["jenisDokumen", "ASC"],
          ["id", "DESC"],
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error("Error getAllTemplateKPBPN:", err);
      return res.status(500).json({
        message: err.message || "Gagal mengambil data template KPBPN",
        code: 500,
      });
    }
  },

  addTemplateKPBPN: async (req, res) => {
    const { nama, jenisDokumen, status = "aktif" } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({ message: "Nama template wajib diisi", code: 400 });
    }

    if (!jenisDokumen || !JENIS_DOKUMEN.includes(jenisDokumen)) {
      return res.status(400).json({
        message: "Jenis dokumen tidak valid",
        code: 400,
      });
    }

    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        message: "Status harus aktif atau nonaktif",
        code: 400,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Harap unggah file .docx", code: 400 });
    }

    const transaction = await sequelize.transaction();

    try {
      const filePath = `/template-kpbpn/${req.file.filename}`;
      const newTemplate = await templateKPBPN.create(
        {
          nama: nama.trim(),
          jenisDokumen,
          template: filePath,
          status,
        },
        { transaction },
      );

      if (status === "aktif") {
        await deactivateOtherTemplates(jenisDokumen, newTemplate.id, transaction);
      }

      await transaction.commit();

      return res.status(201).json({
        message: "Template KPBPN berhasil ditambahkan",
        result: newTemplate,
      });
    } catch (err) {
      await transaction.rollback();
      if (req.file) {
        deleteFileIfExists(`/template-kpbpn/${req.file.filename}`);
      }
      console.error("Error addTemplateKPBPN:", err);
      return res.status(500).json({
        message: err.message || "Gagal menambahkan template KPBPN",
        code: 500,
      });
    }
  },

  editTemplateKPBPN: async (req, res) => {
    const id = parseInt(req.params.id);
    const { nama, jenisDokumen, status } = req.body;

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID template tidak valid", code: 400 });
    }

    if (!nama || !nama.trim()) {
      return res.status(400).json({ message: "Nama template wajib diisi", code: 400 });
    }

    if (!jenisDokumen || !JENIS_DOKUMEN.includes(jenisDokumen)) {
      return res.status(400).json({
        message: "Jenis dokumen tidak valid",
        code: 400,
      });
    }

    if (status && !STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        message: "Status harus aktif atau nonaktif",
        code: 400,
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const existingTemplate = await templateKPBPN.findByPk(id, { transaction });

      if (!existingTemplate) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Template KPBPN tidak ditemukan",
          code: 404,
        });
      }

      const updateData = {
        nama: nama.trim(),
        jenisDokumen,
      };

      if (status) {
        updateData.status = status;
      }

      if (req.file) {
        deleteFileIfExists(existingTemplate.template);
        updateData.template = `/template-kpbpn/${req.file.filename}`;
      }

      await templateKPBPN.update(updateData, {
        where: { id },
        transaction,
      });

      if (status === "aktif") {
        await deactivateOtherTemplates(jenisDokumen, id, transaction);
      }

      await transaction.commit();

      const result = await templateKPBPN.findByPk(id);

      return res.status(200).json({
        message: "Template KPBPN berhasil diupdate",
        result,
      });
    } catch (err) {
      await transaction.rollback();
      if (req.file) {
        deleteFileIfExists(`/template-kpbpn/${req.file.filename}`);
      }
      console.error("Error editTemplateKPBPN:", err);
      return res.status(500).json({
        message: err.message || "Gagal mengupdate template KPBPN",
        code: 500,
      });
    }
  },

  updateStatusTemplateKPBPN: async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID template tidak valid", code: 400 });
    }

    if (!status || !STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        message: "Status harus aktif atau nonaktif",
        code: 400,
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const existingTemplate = await templateKPBPN.findByPk(id, { transaction });

      if (!existingTemplate) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Template KPBPN tidak ditemukan",
          code: 404,
        });
      }

      await templateKPBPN.update({ status }, { where: { id }, transaction });

      if (status === "aktif") {
        await deactivateOtherTemplates(
          existingTemplate.jenisDokumen,
          id,
          transaction,
        );
      }

      await transaction.commit();

      const result = await templateKPBPN.findByPk(id);

      return res.status(200).json({
        message: "Status template KPBPN berhasil diupdate",
        result,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Error updateStatusTemplateKPBPN:", err);
      return res.status(500).json({
        message: err.message || "Gagal mengupdate status template KPBPN",
        code: 500,
      });
    }
  },

  deleteTemplateKPBPN: async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID template tidak valid", code: 400 });
    }

    try {
      const existingTemplate = await templateKPBPN.findByPk(id);

      if (!existingTemplate) {
        return res.status(404).json({
          message: "Template KPBPN tidak ditemukan",
          code: 404,
        });
      }

      deleteFileIfExists(existingTemplate.template);
      await templateKPBPN.destroy({ where: { id } });

      return res.status(200).json({
        message: "Template KPBPN berhasil dihapus",
      });
    } catch (err) {
      console.error("Error deleteTemplateKPBPN:", err);
      return res.status(500).json({
        message: err.message || "Gagal menghapus template KPBPN",
        code: 500,
      });
    }
  },

  downloadTemplateKPBPN: async (req, res) => {
    try {
      const { filePath } = req.query;

      if (!filePath) {
        return res.status(400).json({ message: "Path file wajib diisi", code: 400 });
      }

      const normalizedPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
      const fullPath = path.join(__dirname, "../public", normalizedPath);

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: "File tidak ditemukan", code: 404 });
      }

      const fileName = path.basename(fullPath);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      return res.download(fullPath);
    } catch (err) {
      console.error("Error downloadTemplateKPBPN:", err);
      return res.status(500).json({
        message: err.message || "Gagal mengunduh template KPBPN",
        code: 500,
      });
    }
  },
};
