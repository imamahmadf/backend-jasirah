const {
  pegawai,
  daftarNomorSurat,
  jenisSurat,
  sumberDana,
  kwitGlobal,
  bendahara,
  jenisPerjalanan,
  KPA,
  templateKwitGlobal,
  perjalanan,
  daftarSubKegiatan,
  status,
  tipePerjalanan,
  personil,
  rincianBPD,
  jenisRincianBPD,
  rill,
  tempat,
  dalamKota,
  PPTK,
  daftarUnitKerja,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getVerifikasi: async (req, res) => {
    const verifikasi = req.params.id;
    try {
      const result = await kwitGlobal.findOne({
        where: { verifikasi },
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan", "kodeRekening"],
            as: "subKegiatan",
          },

          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            as: "unitKerja",
          },

          { model: pegawai, attributes: ["id", "nama", "nip"], as: "pegawai" },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
          },
          {
            model: KPA,
            as: "KPA",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_KPA",
              },
            ],
          },
          {
            model: bendahara,
            as: "bendahara",
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_bendahara",
              },
            ],
            attributes: ["id", "jabatan"],
          },
          {
            model: perjalanan,
            attributes: ["id", "untuk", "asal", "noSuratTugas"],
            include: [
              {
                model: personil,
                attributes: ["id"],
                include: [
                  {
                    model: pegawai,
                  },
                  {
                    model: status,
                    attributes: ["id", "statusKuitansi"],
                    // required: true,
                    // where: {
                    //   id: 3,
                    // },
                  },
                  {
                    model: rincianBPD,
                    attributes: ["id", "item", "nilai", "qty"],
                  },
                ],
              },

              {
                model: tempat,
                attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
                include: [
                  {
                    model: dalamKota,
                    as: "dalamKota",
                    attributes: ["id", "nama"],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
