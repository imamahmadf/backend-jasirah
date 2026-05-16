const {
  indukUnitKerja,
  kadis,
  sequelize,
  templateKeuangan,
  templateAset,
  user,
  userRole,
  perjalanan,
  role,
  profile,
  templateKwitGlobal,
  templateAllKwitansi,
} = require("../models");
const fs = require("fs");
module.exports = {
  getTemplateKeuangan: async (req, res) => {
    try {
      const result = await templateKeuangan.findAll({
        attributes: ["id", "nama", "template"],
      });

      const resultGlobal = await templateKwitGlobal.findAll({});
      return res.status(200).json({ result, resultGlobal });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getTemplateKadis: async (req, res) => {
    try {
      const result = await kadis.findAll({});
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getTemplateAset: async (req, res) => {
    try {
      const result = await templateAset.findAll({});
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  addTemplateKeuanganGlobal: async (req, res) => {
    const { nama } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filePath = `/template-keuangan/${req.file.filename}`;
      await templateKwitGlobal.create({
        dokumen: filePath,
        nama,
      });
      return res.status(200).json({ message: "template berhasil diupload" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  addTemplateKeuangan: async (req, res) => {
    const { nama } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filePath = `/template-keuangan/${req.file.filename}`;
      await templateKeuangan.create({
        template: filePath,
        nama,
      });
      return res.status(200).json({ message: "template berhasil diupload" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  uploadTemplate: async (req, res) => {
    const { id, jenis, kode } = req.body;
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filename = req.body.oldFile;
      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }

      const filePath = `/template/${req.file.filename}`;

      if (jenis == 1) {
        await indukUnitKerja.update(
          {
            templateSuratTugas: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      } else if (jenis == 2) {
        await indukUnitKerja.update(
          {
            templateNotaDinas: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      } else if (jenis == 3) {
        await indukUnitKerja.update(
          {
            templateSuratTugasSingkat: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      } else if (jenis == 4) {
        await indukUnitKerja.update(
          {
            telaahan: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      } else if (jenis == 5) {
        await indukUnitKerja.update(
          {
            templateSPD: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      }

      return res.status(200).json({
        message: "File template berhasil diunggah",
        filePath,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  uploadTemplateKadis: async (req, res) => {
    const { id, nomorSurat, jenis } = req.body;
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filename = req.body.oldFile;
      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }

      const filePath = `/template/${req.file.filename}`;

      if (id) {
        // Update existing record
        const updateData = { nomorSurat };

        if (jenis == 1) {
          updateData.template = filePath;
        } else if (jenis == 2) {
          updateData.templateSPD = filePath;
        } else {
          // Default to template if jenis is not specified or unknown
          updateData.template = filePath;
        }

        await kadis.update(updateData, {
          where: { id },
        });
      } else {
        // Create new record
        const createData = { nomorSurat };

        if (jenis == 1) {
          createData.template = filePath;
        } else if (jenis == 2) {
          createData.templateSPD = filePath;
        } else {
          // Default to template if jenis is not specified or unknown
          createData.template = filePath;
        }

        await kadis.create(createData);
      }

      return res.status(200).json({
        message: "File template berhasil diunggah",
        filePath,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  uploadTemplateAset: async (req, res) => {
    const { id, nomorSurat } = req.body;
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filename = req.body.oldFile;
      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        const filePath = `/template/${req.file.filename}`;

        await templateAset.update(
          {
            dokumen: filePath, // Nama asli
            nomorSurat,
          },
          {
            where: { id },
          }
        );
      } else {
        await templateAset.create({
          dokumen: `/template/${req.file.filename}`, // Nama asli
          nomorSurat,
        });
      }

      return res.status(200).json({
        message: "File template berhasil diunggah",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getTemplate: async (req, res) => {
    console.log(req.params.id, "template");
    const id = req.params.id;
    try {
      const result = await indukUnitKerja.findOne({
        attributes: [
          "id",
          "indukUnitKerja",
          "templateSuratTugas",
          "templateNotaDinas",
          "templateSuratTugasSingkat",
          "telaahan",
          "templateSPD",
        ],
        where: { id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  downloadTemplateKeuangan: async (req, res) => {
    try {
      const { fileName } = req.query; // ← Ganti dari req.body ke req.query
      const filePath = `${__dirname}/../public/${fileName}`;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      return res.download(filePath);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunduh file" });
    }
  },

  downloadUndangan: async (req, res) => {
    try {
      const { fileName } = req.query; // ← Ganti dari req.body ke req.query
      const filePath = `${__dirname}/../public/${fileName}`;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      return res.download(filePath);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunduh file" });
    }
  },
  deleteTempateKeuangan: async (req, res) => {
    const id = req.params.id;
    const filename = req.body.fileName;
    try {
      const result = await templateKeuangan.destroy({ where: { id } });

      const path = `${__dirname}/../public${filename}`;
      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  deleteTempateGlobal: async (req, res) => {
    const id = req.params.id;
    const filename = req.body.fileName;
    try {
      const result = await templateKwitGlobal.destroy({ where: { id } });

      const path = `${__dirname}/../public${filename}`;
      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  // ==================== Edit Template Keuangan ====================
  editTemplateKeuangan: async (req, res) => {
    const id = req.params.id;
    const { nama } = req.body;
    try {
      const existingTemplate = await templateKeuangan.findByPk(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template tidak ditemukan" });
      }

      const updateData = { nama };

      if (req.file) {
        // Hapus file lama jika ada
        if (existingTemplate.template) {
          const oldPath = `${__dirname}/../public${existingTemplate.template}`;
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
        updateData.template = `/template-keuangan/${req.file.filename}`;
      }

      await templateKeuangan.update(updateData, { where: { id } });
      return res.status(200).json({ message: "Template berhasil diupdate" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengupdate template" });
    }
  },

  // ==================== Edit Template Keuangan Global ====================
  editTemplateKeuanganGlobal: async (req, res) => {
    const id = req.params.id;
    const { nama } = req.body;
    try {
      const existingTemplate = await templateKwitGlobal.findByPk(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template tidak ditemukan" });
      }

      const updateData = { nama };

      if (req.file) {
        // Hapus file lama jika ada
        if (existingTemplate.dokumen) {
          const oldPath = `${__dirname}/../public${existingTemplate.dokumen}`;
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
        updateData.dokumen = `/template-keuangan/${req.file.filename}`;
      }

      await templateKwitGlobal.update(updateData, { where: { id } });
      return res.status(200).json({ message: "Template berhasil diupdate" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengupdate template" });
    }
  },

  uploadUndangan: async (req, res) => {
    const id = parseInt(req.body.id);
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filename = req.body.oldFile;
      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }

      const filePath = `/bukti/${req.file.filename}`;

      await perjalanan.update(
        {
          undangan: filePath, // Nama asli
        },
        {
          where: { id },
        }
      );

      return res.status(200).json({
        message: "File template berhasil diunggah",
        filePath,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  // ==================== Template All Kwitansi ====================
  getTemplateAllKwitansi: async (req, res) => {
    try {
      const result = await templateAllKwitansi.findAll({
        attributes: ["id", "nama", "template"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengambil data template" });
    }
  },

  addTemplateAllKwitansi: async (req, res) => {
    const { nama } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filePath = `/template-keuangan/${req.file.filename}`;
      await templateAllKwitansi.create({
        template: filePath,
        nama,
      });
      return res.status(200).json({ message: "Template berhasil diupload" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  updateTemplateAllKwitansi: async (req, res) => {
    const id = req.params.id;
    const { nama } = req.body;
    try {
      const existingTemplate = await templateAllKwitansi.findByPk(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template tidak ditemukan" });
      }

      const updateData = { nama };

      if (req.file) {
        // Hapus file lama jika ada
        if (existingTemplate.template) {
          const oldPath = `${__dirname}/../public${existingTemplate.template}`;
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
        updateData.template = `/template-keuangan/${req.file.filename}`;
      }

      await templateAllKwitansi.update(updateData, { where: { id } });
      return res.status(200).json({ message: "Template berhasil diupdate" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengupdate template" });
    }
  },

  deleteTemplateAllKwitansi: async (req, res) => {
    const id = req.params.id;
    const filename = req.body.fileName;
    try {
      const result = await templateAllKwitansi.destroy({ where: { id } });

      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }
      return res.status(200).json({ result, message: "Template berhasil dihapus" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat menghapus template" });
    }
  },
};
