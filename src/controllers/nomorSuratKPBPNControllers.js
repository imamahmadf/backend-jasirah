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

const mapMitraNomorUrut = (item) => {
  const data = item.toJSON();
  const nomorUrutBast = parseInt(data.nomorUrut, 10) || 0;
  const nomorUrutSuratJalan = parseInt(data.nomorUrutSuratJalan, 10) || 0;
  return {
    ...data,
    nomorUrut: nomorUrutBast,
    nomorUrutSuratJalan,
    nomorBerikutnya: nomorUrutBast + 1,
    nomorBerikutnyaSuratJalan: nomorUrutSuratJalan + 1,
  };
};

const mitraInclude = {
  attributes: [
    "id",
    "nama",
    "kode",
    "nomorUrut",
    "nomorUrutSuratJalan",
    "jenisMitraId",
  ],
  include: [{ model: jenisMitra, attributes: ["id", "jenis", "kode"] }],
};

module.exports = {
  getNomorUrut: async (req, res) => {
    try {
      const [resultNomorSurat, resultMitra] = await Promise.all([
        nomorSuratKPBPN.findAll({
          order: [["id", "ASC"]],
        }),
        mitra.findAll({
          ...mitraInclude,
          order: [["nama", "ASC"]],
        }),
      ]);

      return res.status(200).json({
        resultNomorSurat: resultNomorSurat.map((item) => ({
          ...item.toJSON(),
          label: labelNomorSurat(item),
        })),
        resultMitra: resultMitra.map(mapMitraNomorUrut),
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
      const jenis = req.body.jenis === "suratJalan" ? "suratJalan" : "bast";
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

      const field = jenis === "suratJalan" ? "nomorUrutSuratJalan" : "nomorUrut";
      await mitra.update({ [field]: nomorUrut }, { where: { id } });

      const result = await mitra.findByPk(id, mitraInclude);
      const labelJenis = jenis === "suratJalan" ? "surat jalan" : "BAST";

      return res.status(200).json({
        message: `Nomor urut ${labelJenis} mitra ${result.nama} berhasil diperbarui`,
        result: mapMitraNomorUrut(result),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
