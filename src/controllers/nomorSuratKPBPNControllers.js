const {
  nomorSuratKPBPN,
  mitra,
  jenisMitra,
  asalMinyak,
  nomorUrutSuratJalanAsal,
} = require("../models");
const {
  ID_TEMPLATE_PENGAJUAN,
  susunNomorPengajuan,
} = require("../lib/nomorPengajuanKpbpn");

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
  if (item.id === 3) return "Pengajuan Barang & Jasa";
  return item.nomor || `Nomor #${item.id}`;
};

const gabungNomorAsal = (kodeAsal, nomorUrut) =>
  `${String(kodeAsal || "").trim()}${String(nomorUrut).padStart(3, "0")}`;

const mapMitraNomorUrut = (item) => {
  const data = item.toJSON();
  const nomorUrutBast = parseInt(data.nomorUrut, 10) || 0;
  return {
    ...data,
    nomorUrut: nomorUrutBast,
    nomorBerikutnya: nomorUrutBast + 1,
  };
};

const mapNomorUrutSuratJalan = (itemMitra, itemAsal, nomorUrut) => ({
  id: `${itemMitra.id}-${itemAsal.id}`,
  mitraId: itemMitra.id,
  asalMinyakId: itemAsal.id,
  mitraNama: itemMitra.nama,
  mitraKode: itemMitra.kode,
  asalNomor: itemAsal.nomor,
  asalNama: itemAsal.asal,
  nomorUrut,
  nomorBerikutnya: nomorUrut + 1,
  nomorGabunganTerakhir: nomorUrut
    ? gabungNomorAsal(itemAsal.nomor, nomorUrut)
    : "-",
  nomorGabunganBerikutnya: gabungNomorAsal(itemAsal.nomor, nomorUrut + 1),
});

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
      const [resultNomorSurat, resultMitra, resultAsalMinyak, resultCounter] =
        await Promise.all([
          nomorSuratKPBPN.findAll({
            order: [["id", "ASC"]],
          }),
          mitra.findAll({
            ...mitraInclude,
            order: [["nama", "ASC"]],
          }),
          asalMinyak.findAll({
            order: [
              ["nomor", "ASC"],
              ["asal", "ASC"],
            ],
          }),
          nomorUrutSuratJalanAsal.findAll(),
        ]);

      const counterMap = new Map(
        resultCounter.map((item) => [
          `${item.mitraId}:${item.asalMinyakId}`,
          parseInt(item.nomorUrut, 10) || 0,
        ]),
      );
      const resultNomorUrutSuratJalan = [];
      for (const itemMitra of resultMitra) {
        for (const itemAsal of resultAsalMinyak) {
          const nomorUrut =
            counterMap.get(`${itemMitra.id}:${itemAsal.id}`) || 0;
          resultNomorUrutSuratJalan.push(
            mapNomorUrutSuratJalan(itemMitra, itemAsal, nomorUrut),
          );
        }
      }

      return res.status(200).json({
        resultNomorSurat: resultNomorSurat.map((item) => {
          const data = item.toJSON();
          const nomorUrut = parseInt(data.nomorUrut, 10) || 0;
          const hasil = {
            ...data,
            label: labelNomorSurat(data),
            nomorUrut,
          };
          if (Number(data.id) === ID_TEMPLATE_PENGAJUAN) {
            const sekarang = new Date();
            const tanggal = `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, "0")}-${String(sekarang.getDate()).padStart(2, "0")}`;
            hasil.nomorBerikutnya = nomorUrut + 1;
            hasil.contohBerikutnya = susunNomorPengajuan(
              data.nomor,
              nomorUrut + 1,
              tanggal,
            );
          }
          return hasil;
        }),
        resultMitra: resultMitra.map(mapMitraNomorUrut),
        resultNomorUrutSuratJalan,
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

      const perubahan = { nomorUrut };
      if (Number(id) === ID_TEMPLATE_PENGAJUAN && req.body.nomor != null) {
        const pola = String(req.body.nomor || "").trim();
        if (!pola.includes("NOMOR")) {
          return res.status(400).json({
            error: "Format nomor wajib memuat kata NOMOR",
          });
        }
        if (pola.length > 255) {
          return res.status(400).json({ error: "Format nomor terlalu panjang" });
        }
        perubahan.nomor = pola;
      }

      await existing.update(perubahan);

      const result = await nomorSuratKPBPN.findByPk(id);
      const sekarang = new Date();
      const tanggal = `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, "0")}-${String(sekarang.getDate()).padStart(2, "0")}`;
      return res.status(200).json({
        message:
          Number(id) === ID_TEMPLATE_PENGAJUAN
            ? "Nomor pengajuan berhasil diperbarui"
            : `Nomor urut ${labelNomorSurat(result)} berhasil diperbarui`,
        result: {
          ...result.toJSON(),
          label: labelNomorSurat(result),
          nomorBerikutnya: (parseInt(result.nomorUrut, 10) || 0) + 1,
          contohBerikutnya:
            Number(id) === ID_TEMPLATE_PENGAJUAN
              ? susunNomorPengajuan(
                  result.nomor,
                  (parseInt(result.nomorUrut, 10) || 0) + 1,
                  tanggal,
                )
              : undefined,
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

      if (jenis === "suratJalan") {
        return res.status(400).json({
          error:
            "Nomor urut surat jalan diatur per mitra dan kode asal minyak",
        });
      }

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

      const result = await mitra.findByPk(id, mitraInclude);

      return res.status(200).json({
        message: `Nomor urut BAST mitra ${result.nama} berhasil diperbarui`,
        result: mapMitraNomorUrut(result),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  updateNomorUrutSuratJalanAsal: async (req, res) => {
    try {
      const mitraId = parseInt(req.body.mitraId, 10);
      const asalMinyakId = parseInt(req.body.asalMinyakId, 10);
      const nomorUrut = parseNomorUrut(req.body.nomorUrut);

      if (!mitraId || !asalMinyakId) {
        return res.status(400).json({
          error: "Mitra dan asal minyak wajib dipilih",
        });
      }
      if (nomorUrut === null) {
        return res.status(400).json({
          error: "Nomor urut harus berupa angka 0 atau lebih",
        });
      }

      const [dbMitra, dbAsal] = await Promise.all([
        mitra.findByPk(mitraId),
        asalMinyak.findByPk(asalMinyakId),
      ]);
      if (!dbMitra) {
        return res.status(404).json({ error: "Mitra tidak ditemukan" });
      }
      if (!dbAsal) {
        return res.status(404).json({ error: "Asal minyak tidak ditemukan" });
      }

      const [row] = await nomorUrutSuratJalanAsal.findOrCreate({
        where: { mitraId, asalMinyakId },
        defaults: { nomorUrut },
      });
      if ((parseInt(row.nomorUrut, 10) || 0) !== nomorUrut) {
        await row.update({ nomorUrut });
      }

      return res.status(200).json({
        message: `Nomor urut surat jalan ${dbMitra.nama} asal ${dbAsal.nomor || dbAsal.asal} berhasil diperbarui`,
        result: mapNomorUrutSuratJalan(dbMitra, dbAsal, nomorUrut),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
};
