const {
  mitra,
  transportir,
  supir,
  daftarUnitKerja,
  pegawai,
  jenisTransportir,
  satuanVolume,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getMitra: async (req, res) => {
    try {
      const resultMitra = await mitra.findAll({ include: [{ model: supir }] });
      const resultTransportir = await transportir.findAll({
        include: [{ model: jenisTransportir }, { model: satuanVolume }],
      });
      const resultJenisTransportir = await jenisTransportir.findAll({});
      const resultSatuanVolume = await satuanVolume.findAll({});
      return res.status(200).json({
        resultMitra,
        resultTransportir,
        resultJenisTransportir,
        resultSatuanVolume,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addMitra: async (req, res) => {
    try {
      const { nama, alamat, npwp, kontak, penanggungJawab, kode } = req.body;
      const result = await mitra.create({
        nama,
        alamat,
        npwp,
        kontak,
        penanggungJawab,
        kode,
        nomorUrut: 0,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addTransportir: async (req, res) => {
    try {
      const { plat, kapasitas, jenisTransportirId, satuanVolumeId } = req.body;
      const filePath = "transportir";
      let foto = null;
      if (req.file) {
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }

      const result = await transportir.create({
        plat,
        foto,
        jenisTransportirId,
        satuanVolumeId: satuanVolumeId ? parseInt(satuanVolumeId) : null,
        kapasitas: parseInt(kapasitas),
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  addSupir: async (req, res) => {
    try {
      const { nama, nik, mitraId } = req.body;
      const filePath = "supir";
      const { ktp: ktpFile, foto: fotoFile } = req.files || {};

      let ktp = null;
      let foto = null;

      if (ktpFile?.[0]) {
        ktp = `/${filePath}/${ktpFile[0].filename}`;
      }
      if (fotoFile?.[0]) {
        foto = `/${filePath}/${fotoFile[0].filename}`;
      }

      const result = await supir.create({
        nama,
        nik,
        ktp,
        foto,
        mitraId: parseInt(mitraId),
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
