const { nomorSuratKPBPN, mitra, jenisMitra } = require("../models");

const parseNomorUrut = (value) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

const labelNomorSurat = (item) => {
  if (item.id === 1) return "Surat Jalan";
  if (item.id === 2) return "BAST";
  return item.nomor || `Nomor #${item.id}`;
};

module.exports = {
  getNomorUrut: async (req, res) => {
    try {
      const [resultNomorSurat, resultMitra] = await Promise.all([
        nomorSuratKPBPN.findAll({
          order: [["id", "ASC"]],
        }),
        mitra.findAll({
          attributes: ["id", "nama", "kode", "nomorUrut", "jenisMitraId"],
          include: [{ model: jenisMitra, attributes: ["id", "jenis", "kode"] }],
          order: [["nama", "ASC"]],
        }),
      ]);

      return res.status(200).json({
        resultNomorSurat: resultNomorSurat.map((item) => ({
          ...item.toJSON(),
          label: labelNomorSurat(item),
          nomorBerikutnya: (parseInt(item.nomorUrut, 10) || 0) + 1,
        })),
        resultMitra: resultMitra.map((item) => ({
          ...item.toJSON(),
          nomorBerikutnya: (parseInt(item.nomorUrut, 10) || 0) + 1,
        })),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updateNomorSuratKPBPN: async (req, res) => {
    try {
      const { id } = req.params;
      const nomorUrut = parseNomorUrut(req.body.nomorUrut);

      if (nomorUrut === null) {
        return res.status(400).json({
          error: "Nomor urut harus berupa angka 0 atau lebih",
        });
      }

      const existing = await nomorSuratKPBPN.findByPk(id);
      if (!existing) {
        return res.status(404).json({
          error: "Data nomor surat tidak ditemukan",
        });
      }

      await nomorSuratKPBPN.update({ nomorUrut }, { where: { id } });

      const result = await nomorSuratKPBPN.findByPk(id);
      return res.status(200).json({
        message: `Nomor urut ${labelNomorSurat(result)} berhasil diperbarui`,
        result: {
          ...result.toJSON(),
          label: labelNomorSurat(result),
          nomorBerikutnya: (parseInt(result.nomorUrut, 10) || 0) + 1,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updateNomorUrutMitra: async (req, res) => {
    try {
      const { id } = req.params;
      const nomorUrut = parseNomorUrut(req.body.nomorUrut);

      if (nomorUrut === null) {
        return res.status(400).json({
          error: "Nomor urut harus berupa angka 0 atau lebih",
        });
      }

      const existing = await mitra.findByPk(id);
      if (!existing) {
        return res.status(404).json({ error: "Mitra tidak ditemukan" });
      }

      await mitra.update({ nomorUrut }, { where: { id } });

      const result = await mitra.findByPk(id, {
        attributes: ["id", "nama", "kode", "nomorUrut", "jenisMitraId"],
        include: [{ model: jenisMitra, attributes: ["id", "jenis", "kode"] }],
      });

      return res.status(200).json({
        message: `Nomor urut BAST mitra ${result.nama} berhasil diperbarui`,
        result: {
          ...result.toJSON(),
          nomorBerikutnya: (parseInt(result.nomorUrut, 10) || 0) + 1,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
