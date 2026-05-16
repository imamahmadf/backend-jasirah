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
  sequelize,
} = require("../models");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { generateQrWithLogo } = require("../lib/qrcodeWithLogo");
const ImageModule = require("docxtemplater-image-module-free");
let sizeOf;
try {
  sizeOf = require("image-size");
} catch (_) {
  sizeOf = null;
}
const { env } = require("../config");
module.exports = {
  cetakKwitansi: async (req, res) => {
    const {
      data,
      kwitansiGlobalId,
      templateId,
      subKegiatan,
      KPAFE,
      bendaharaFE,
      penerima,
      jenisPerjalananFE,
      totalFE,
      indukUnitKerjaFE,
      PPTKFE,
      verifikasi,
    } = req.body;

    const formatRupiah = (angka) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(angka);

    function formatTerbilang(angka) {
      const satuan = [
        "",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima",
        "Enam",
        "Tujuh",
        "Delapan",
        "Sembilan",
        "Sepuluh",
        "Sebelas",
      ];

      if (angka < 12) {
        return satuan[angka];
      } else if (angka < 20) {
        return formatTerbilang(angka - 10) + " Belas";
      } else if (angka < 100) {
        return (
          formatTerbilang(Math.floor(angka / 10)) +
          " Puluh " +
          formatTerbilang(angka % 10)
        );
      } else if (angka < 200) {
        return "Seratus " + formatTerbilang(angka - 100);
      } else if (angka < 1000) {
        return (
          formatTerbilang(Math.floor(angka / 100)) +
          " Ratus " +
          formatTerbilang(angka % 100)
        );
      } else if (angka < 2000) {
        return "Seribu " + formatTerbilang(angka - 1000);
      } else if (angka < 1000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000)) +
          " Ribu " +
          formatTerbilang(angka % 1000)
        );
      } else if (angka < 1000000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000000)) +
          " Juta " +
          formatTerbilang(angka % 1000000)
        );
      } else if (angka < 1000000000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000000000)) +
          " Milyar " +
          formatTerbilang(angka % 1000000000)
        );
      }
    }
    try {
      const terbilang = formatTerbilang(totalFE) + "Rupiah";

      // Jika verifikasi null/undefined, ambil dari DB; jika masih null, generate dan simpan
      let verifikasiCode = verifikasi;

      if (!verifikasiCode) {
        const randomCode = (
          Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
        ).toUpperCase();
        await kwitGlobal.update(
          { verifikasi: randomCode },
          { where: { id: kwitansiGlobalId } },
        );
        verifikasiCode = randomCode;
      }

      const resultTemplate = await templateKwitGlobal.findOne({
        where: { id: templateId },
        attributes: ["id", "dokumen"],
      });

      // Load file ke PizZip
      // Generate QR Code (contoh: link validasi surat)
      const isProduction = env.NODE_ENV === "production";
      // const baseUrl = isProduction
      //   ? env.APP_BASE_URL_PROD || "https://pena.dinkes.paserkab.go.id"
      //   : env.APP_BASE_URL_DEV || "http://localhost:5173";
      const baseUrl = "https://pena.dinkes.paserkab.go.id";
      const logoPath = path.join(
        __dirname,
        "../public/template-keuangan/penaLogo.png",
      );
      const qrDataUrl = await generateQrWithLogo(
        `${baseUrl}/verifikasi/${verifikasiCode}`,
        { sizePx: 500, logoPath, logoScale: 0.22 },
      );
      // Path file template
      const templatePath = path.join(
        __dirname,
        "../public",
        resultTemplate.dokumen,
      );

      // Baca file template
      const content = fs.readFileSync(templatePath, "binary");
      function base64DataURLToArrayBuffer(dataURL) {
        const base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;
        if (!base64Regex.test(dataURL)) {
          throw new Error("Data URL bukan base64 image yang valid");
        }
        const stringBase64 = dataURL.replace(base64Regex, "");
        return Buffer.from(stringBase64, "base64");
      }

      const imageOpts = {
        getImage: function (tagValue) {
          if (Buffer.isBuffer(tagValue)) return tagValue;
          if (
            typeof tagValue === "string" &&
            tagValue.startsWith("data:image/")
          ) {
            return base64DataURLToArrayBuffer(tagValue);
          }
          return tagValue;
        },
        getSize: function (img, tagValue, tagName) {
          if (tagName === "foto") {
            try {
              const pageWidthPx = 600; // lebar efektif A4 di Word
              const margin = 40; // total margin kiri + kanan (px)
              const targetWidthPx = pageWidthPx - margin;

              let buffer = null;
              if (Buffer.isBuffer(tagValue)) buffer = tagValue;
              else if (
                typeof tagValue === "string" &&
                tagValue.startsWith("data:image/")
              ) {
                const base64 = tagValue.split(",")[1];
                buffer = Buffer.from(base64, "base64");
              }

              if (buffer && sizeOf) {
                const dim = sizeOf(buffer);
                if (dim?.width && dim?.height) {
                  const ratio = targetWidthPx / dim.width;
                  const newWidth = targetWidthPx;
                  const newHeight = Math.round(dim.height * ratio);

                  return [newWidth, newHeight];
                }
              }

              // fallback
              return [pageWidthPx - margin, 800];
            } catch (_) {
              return [560, 800]; // fallback dengan margin
            }
          }

          // default untuk gambar lain (mis. qrCode)
          return [100, 100];
        },
      };
      const imageModule = new ImageModule(imageOpts);
      // Load file ke PizZip
      const zip = new PizZip(content);

      // Inisialisasi Docxtemplater dengan imageModule
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule],
      });
      console.log("QR Code Length:", qrDataUrl.length);

      doc.render({
        bendaharaNama: bendaharaFE.pegawai_bendahara.nama,
        bendaharaNip: bendaharaFE.pegawai_bendahara.nip,
        bendaharaJabatan: bendaharaFE.jabatan,
        // untukPembayaran: bendaharaFE.sumberDana.untukPembayaran || "",
        data,
        KPAJabatan: KPAFE.jabatan,
        indukUnitKerja: indukUnitKerjaFE,
        qrCode: qrDataUrl,
        tanggalBerangkat: "",
        tujuan: "",
        jumlah: "",

        pegawaiNama: penerima.nama,
        pegawaiNip: penerima.nip,

        KPANama: KPAFE.pegawai_KPA.nama,
        KPANip: KPAFE.pegawai_KPA.nip,

        PPTKNama: PPTKFE.pegawai_PPTK.nama,
        PPTKNip: PPTKFE.pegawai_PPTK.nip,
        PPTKJabatan: PPTKFE.jabatan,

        kodeRekening: subKegiatan.kodeRekening + jenisPerjalananFE.kodeRekening,
        total: formatRupiah(totalFE),
        terbilang,
        // BPD,
        subKegiatan: subKegiatan.subKegiatan,
        jenisPerjalanan: jenisPerjalananFE.jenis,

        tahun: "2025",
      });
      // Simpan hasil dokumen ke buffer
      const buffer = doc.getZip().generate({ type: "nodebuffer" });

      // Buat path untuk menyimpan file hasil
      const outputFileName = `Kwitansi_Global_${Date.now()}.docx`;
      const outputPath = path.join(
        __dirname,
        "../public/output",
        outputFileName,
      );

      // Simpan file hasil ke server
      fs.writeFileSync(outputPath, buffer);
      res.download(outputPath, outputFileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error generating file");
        }
        // Hapus file setelah dikirim
        fs.unlinkSync(outputPath);
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getKwitGlobal: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);

    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId);
    const offset = limit * page;

    console.log(req.query, "ini dri frontend");
    try {
      const result = await kwitGlobal.findAll({
        limit,
        where: { unitKerjaId },
        offset,
        order: [["id", "DESC"]],
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
            as: "subKegiatan",
          },
          { model: pegawai, attributes: ["id", "nama"], as: "pegawai" },
          { model: jenisPerjalanan, attributes: ["id", "jenis"] },
          {
            model: KPA,
            as: "KPA",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
              },
            ],
          },

          {
            model: PPTK,
            as: "PPTK",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_PPTK",
              },
            ],
          },

          {
            model: bendahara,
            as: "bendahara",
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama"],
                as: "pegawai_bendahara",
              },
            ],
            attributes: ["id", "jabatan"],
          },
          {
            model: perjalanan,
            attributes: ["id"],
            include: [
              {
                model: personil,
                attributes: ["id"],
                include: [
                  {
                    model: rincianBPD,
                    attributes: ["id", "qty", "nilai"],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Menghitung total dari rincianBPD untuk setiap kwitGlobal
      const resultWithTotal = result.map((kwit) => {
        let total = 0;

        // Loop melalui semua perjalanan
        kwit.perjalanans?.forEach((perjalanan) => {
          // Loop melalui semua personil
          perjalanan.personils?.forEach((personil) => {
            // Loop melalui semua rincianBPD dan hitung total
            personil.rincianBPDs?.forEach((rincian) => {
              total += (rincian.qty || 0) * (rincian.nilai || 0);
            });
          });
        });

        // Tambahkan field total ke data kwitGlobal
        const kwitData = kwit.toJSON();
        kwitData.total = total;

        // Hapus perjalanans dari response untuk mengurangi ukuran data
        delete kwitData.perjalanans;

        return kwitData;
      });

      const totalRows = await kwitGlobal.count({
        limit,
        where: { unitKerjaId },
        offset,
      });
      const totalPage = Math.ceil(totalRows / limit);
      const resultKPA = await KPA.findAll({
        where: { unitKerjaId },
        attributes: ["id"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai_KPA",
          },
        ],
      });
      const resultBendahara = await bendahara.findAll({
        where: { indukUnitKerjaId },
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama"],
            as: "pegawai_bendahara",
          },
        ],
      });
      const resultDaftarSubKegiatan = await daftarSubKegiatan.findAll({
        attributes: ["id", "subKegiatan", "kodeRekening"],
        where: {
          unitKerjaId,
        },
      });
      const resultTemplate = await templateKwitGlobal.findAll({});
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});
      const resultPPTK = await PPTK.findAll({
        where: { unitKerjaId },
        attributes: ["id"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai_PPTK",
          },
        ],
      });
      return res.status(200).json({
        result: resultWithTotal,
        resultKPA,
        resultBendahara,
        resultJenisPerjalanan,
        resultTemplate,
        resultDaftarSubKegiatan,
        resultPPTK,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  postKwitGlobal: async (req, res) => {
    const {
      pegawaiId,
      KPAId,
      bendaharaId,
      templateKwitGlobalId,
      jenisPerjalananId,
      unitKerjaId,
      subKegiatanId,
      PPTKId,
    } = req.body;

    try {
      const result = await kwitGlobal.create({
        pegawaiId,
        KPAId,
        bendaharaId,
        templateKwitGlobalId,
        jenisPerjalananId,
        unitKerjaId,
        subKegiatanId,
        PPTKId,
        status: "dibuat",
      });
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getPerjalananKwitGlobal: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.findAll({
        where: { id },
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan", "kodeRekening", "unitKerjaId"],
            as: "subKegiatan",
          },
          { model: pegawai, attributes: ["id", "nama", "nip"], as: "pegawai" },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
          },
          {
            model: templateKwitGlobal,
            attributes: ["id", "nama"],
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
            model: PPTK,
            as: "PPTK",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_PPTK",
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

      const resultSubKegiatan = await daftarSubKegiatan.findAll({
        where: { unitKerjaId: result[0].subKegiatan.unitKerjaId },
        // attributes: ["id", "subKegiatan", "kodeRekening", "unitKerjaId"],
      });
      console.log(result[0].subKegiatan.unitKerjaId, "ini result perjalanan");
      return res.status(200).json({ result, resultSubKegiatan });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getAllPerjalanan: async (req, res) => {
    const id = req.params.id;

    try {
      const kwitGlobalId = await kwitGlobal.findOne({ where: { id } });

      const result = await perjalanan.findAll({
        order: [
          ["id", "DESC"],
          [{ model: personil }, "id", "ASC"],
        ],
        where: {
          subKegiatanId: kwitGlobalId.subKegiatanId,
          kwitGlobalId: null,
        },
        attributes: ["id", "asal", "noSuratTugas"],
        include: [
          {
            model: personil,
            required: true,
            include: [
              {
                model: pegawai,
                required: true,
              },
              {
                model: status,
                attributes: ["id", "statusKuitansi"],
                required: true,
                // where: {
                //   id: {
                //     [Op.in]: [2, 3], // ambil data dengan id 1,2,3
                //   },
                // },
              },
              {
                model: rincianBPD,
                attributes: ["id", "item", "nilai", "qty"],
                include: [{ model: jenisRincianBPD, attributes: ["jenis"] }],
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
                attributes: ["id", "nama", "durasi"],
              },
            ],
          },

          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },

          {
            model: jenisPerjalanan,
            where: { id: kwitGlobalId.jenisPerjalananId },
            required: true,
            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
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

  addPerjalanan: async (req, res) => {
    const { selectedIds, id } = req.body;

    try {
      // Validasi input
      if (
        !selectedIds ||
        !Array.isArray(selectedIds) ||
        selectedIds.length === 0
      ) {
        return res.status(400).json({
          message: "selectedIds harus berupa array yang tidak kosong",
          code: 400,
        });
      }

      if (!id) {
        return res.status(400).json({
          message: "id kwitGlobal harus disediakan",
          code: 400,
        });
      }

      // Update semua perjalanan berdasarkan selectedIds
      const result = await perjalanan.update(
        { kwitGlobalId: id },
        {
          where: {
            id: selectedIds,
          },
        },
      );

      return res.status(200).json({
        message: "Perjalanan berhasil diupdate",
        updatedCount: result[0], // Sequelize mengembalikan array dengan jumlah baris yang diupdate
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  ajukan: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.update(
        {
          status: "diajukan",
        },
        { where: { id } },
      );
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  tolak: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.update(
        {
          status: "ditolak",
        },
        { where: { id } },
      );
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  updateSubKegiatan: async (req, res) => {
    const { id, subKegiatanId, jenisPerjalananId } = req.body;
    try {
      const result = await kwitGlobal.update(
        {
          subKegiatanId,
          jenisPerjalananId,
        },
        { where: { id } },
      );
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  verifikasi: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.update(
        {
          status: "diterima",
        },
        { where: { id } },
      );
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  hapusPerjalanan: async (req, res) => {
    const { perjalananIds } = req.body;
    console.log(perjalananIds, "ini perjalanan ids");
    try {
      if (!Array.isArray(perjalananIds) || perjalananIds.length === 0) {
        return res.status(400).json({
          message: "perjalananIds harus berupa array dan tidak kosong",
          code: 400,
        });
      }
      const result = await perjalanan.update(
        { kwitGlobalId: null },
        {
          where: {
            id: { [Op.in]: perjalananIds },
          },
        },
      );
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  hapusKwitansi: async (req, res) => {
    const { id } = req.params;

    try {
      await perjalanan.update(
        { kwitGlobalId: null },
        { where: { kwitGlobalId: id } },
      );

      const result = await kwitGlobal.destroy({
        where: {
          id,
        },
      });
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getAllKwitGlobal: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = req.query.unitKerjaId
      ? parseInt(req.query.unitKerjaId)
      : null;
    const indukUnitKerjaId = req.query.indukUnitKerjaId
      ? parseInt(req.query.indukUnitKerjaId)
      : null;
    const sumberDanaId = req.query.sumberDanaId
      ? parseInt(req.query.sumberDanaId)
      : null;
    const jenisPerjalananId = req.query.jenisPerjalananId
      ? parseInt(req.query.jenisPerjalananId)
      : null;
    const filterUnitKerjaId = req.query.filterUnitKerjaId
      ? parseInt(req.query.filterUnitKerjaId)
      : null;
    const filterStatus = req.query.status || null;
    const filterTanggalAwal = req.query.tanggalAwal || null;
    const filterTanggalAkhir = req.query.tanggalAkhir || null;

    const offset = limit * page;

    console.log(req.query, "ini dri frontend");
    try {
      // Build where clause for main query
      const whereClause = {};

      // Status filter: use filterStatus if provided, otherwise default to ["diajukan", "diterima"]
      if (filterStatus) {
        whereClause.status = filterStatus;
      } else {
        whereClause.status = {
          [Op.in]: ["diajukan", "diterima"],
        };
      }

      // Unit Kerja filter
      if (unitKerjaId) {
        whereClause.unitKerjaId = unitKerjaId;
      } else if (filterUnitKerjaId) {
        whereClause.unitKerjaId = filterUnitKerjaId;
      }

      // Jenis Perjalanan filter
      if (jenisPerjalananId) {
        whereClause.jenisPerjalananId = jenisPerjalananId;
      }

      // Tanggal filter
      if (filterTanggalAwal || filterTanggalAkhir) {
        whereClause.createdAt = {};
        if (filterTanggalAwal) {
          whereClause.createdAt[Op.gte] = new Date(filterTanggalAwal);
        }
        if (filterTanggalAkhir) {
          // Set waktu ke akhir hari (23:59:59)
          const akhirHari = new Date(filterTanggalAkhir);
          akhirHari.setHours(23, 59, 59, 999);
          whereClause.createdAt[Op.lte] = akhirHari;
        }
      }

      // Build bendahara filter for include
      const bendaharaFilter = {};
      if (sumberDanaId) {
        bendaharaFilter.sumberDanaId = sumberDanaId;
      }
      if (indukUnitKerjaId) {
        bendaharaFilter.indukUnitKerjaId = indukUnitKerjaId;
      }

      const result = await kwitGlobal.findAll({
        limit,
        offset,
        where: whereClause,
        order: [
          [
            sequelize.literal(
              "CASE WHEN status = 'diajukan' THEN 0 WHEN status = 'diterima' THEN 1 ELSE 2 END",
            ),
            "ASC",
          ],
          ["createdAt", "DESC"],
        ],
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
            as: "subKegiatan",
          },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            as: "unitKerja",
          },
          { model: pegawai, attributes: ["id", "nama"], as: "pegawai" },
          { model: jenisPerjalanan, attributes: ["id", "jenis"] },
          {
            model: KPA,
            as: "KPA",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
              },
            ],
          },
          {
            model: bendahara,
            as: "bendahara",
            where:
              Object.keys(bendaharaFilter).length > 0
                ? bendaharaFilter
                : undefined,
            required: Object.keys(bendaharaFilter).length > 0 ? true : false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama"],
                as: "pegawai_bendahara",
              },
              {
                model: sumberDana,
              },
            ],
            // Include semua kolom yang diperlukan untuk join ke related models
            attributes: [
              "id",
              "jabatan",
              "sumberDanaId",
              "indukUnitKerjaId",
              "pegawaiId",
            ],
          },
          {
            model: perjalanan,
            attributes: ["id"],
            include: [
              {
                model: personil,
                attributes: ["id"],
                include: [
                  {
                    model: rincianBPD,
                    attributes: ["id", "qty", "nilai"],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Menghitung total dari rincianBPD untuk setiap kwitGlobal
      const resultWithTotal = result.map((kwit) => {
        let total = 0;

        // Loop melalui semua perjalanan
        kwit.perjalanans?.forEach((perjalanan) => {
          // Loop melalui semua personil
          perjalanan.personils?.forEach((personil) => {
            // Loop melalui semua rincianBPD dan hitung total
            personil.rincianBPDs?.forEach((rincian) => {
              total += (rincian.qty || 0) * (rincian.nilai || 0);
            });
          });
        });

        // Tambahkan field total ke data kwitGlobal
        const kwitData = kwit.toJSON();
        kwitData.total = total;

        // Hapus perjalanans dari response untuk mengurangi ukuran data
        delete kwitData.perjalanans;

        return kwitData;
      });

      // Count query dengan where yang sama
      const countWhereClause = { ...whereClause };

      const totalRows = await kwitGlobal.count({
        where: countWhereClause,
        include: [
          ...(Object.keys(bendaharaFilter).length > 0
            ? [
                {
                  model: bendahara,
                  as: "bendahara",
                  where: bendaharaFilter,
                  required: true,
                },
              ]
            : []),
        ],
        distinct: true,
      });
      const totalPage = Math.ceil(totalRows / limit);

      // Get additional data for dropdowns
      // Use unitKerjaId if available, otherwise use filterUnitKerjaId
      const finalUnitKerjaId = unitKerjaId || filterUnitKerjaId;

      const resultKPA = await KPA.findAll({
        where: finalUnitKerjaId ? { unitKerjaId: finalUnitKerjaId } : {},
        attributes: ["id"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai_KPA",
          },
        ],
      });

      const resultBendahara = await bendahara.findAll({
        where: indukUnitKerjaId ? { indukUnitKerjaId } : {},
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama"],
            as: "pegawai_bendahara",
          },
        ],
      });

      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});

      const resultTemplate = await templateKwitGlobal.findAll({});

      const resultDaftarSubKegiatan = await daftarSubKegiatan.findAll({
        attributes: ["id", "subKegiatan", "kodeRekening"],
        where: finalUnitKerjaId ? { unitKerjaId: finalUnitKerjaId } : {},
      });

      return res.status(200).json({
        result: resultWithTotal,
        resultKPA,
        resultBendahara,
        resultJenisPerjalanan,
        resultTemplate,
        resultDaftarSubKegiatan,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  updateKwitGlobal: async (req, res) => {
    const { id, pegawaiId, KPAId, bendaharaId, templateKwitGlobalId } =
      req.body;

    try {
      const result = await kwitGlobal.update(
        {
          pegawaiId,
          KPAId,
          bendaharaId,
          templateKwitGlobalId,
        },
        {
          where: {
            id,
          },
        },
      );
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
