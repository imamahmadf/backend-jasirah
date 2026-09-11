const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");
const { generateQrWithLogo } = require("../lib/qrcodeWithLogo");
const { env } = require("../config");

let sizeOf;
try {
  sizeOf = require("image-size");
} catch (_) {
  sizeOf = null;
}

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

function formatTanggalIndonesia(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTanggalJamIndonesia(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  const menit = String(d.getMinutes()).padStart(2, "0");
  return `${HARI[d.getDay()]} ${d.getDate()} ${BULAN[d.getMonth()].toLowerCase()} ${d.getFullYear()} pukul ${d.getHours()}:${menit}`;
}

function base64DataURLToArrayBuffer(dataURL) {
  const base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;
  if (!base64Regex.test(dataURL)) {
    throw new Error("Data URL bukan base64 image yang valid");
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  return Buffer.from(stringBase64, "base64");
}

function createImageModule() {
  const imageOpts = {
    getImage(tagValue) {
      if (Buffer.isBuffer(tagValue)) return tagValue;
      if (typeof tagValue === "string" && tagValue.startsWith("data:image/")) {
        return base64DataURLToArrayBuffer(tagValue);
      }
      return tagValue;
    },
    getSize(img, tagValue, tagName) {
      if (tagName === "foto") {
        try {
          const pageWidthPx = 600;
          const margin = 40;
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
              return [targetWidthPx, Math.round(dim.height * ratio)];
            }
          }

          return [pageWidthPx - margin, 800];
        } catch (_) {
          return [560, 800];
        }
      }

      return [100, 100];
    },
  };

  return new ImageModule(imageOpts);
}

function buildSuratJalanRenderData(record) {
  return {
    nomorSurat: record.nomor || "-",
    tanggal: formatTanggalIndonesia(record.tanggal),
    namaMitra:
      [record.mitra?.jenisMitra?.jenis, record.mitra?.nama]
        .filter(Boolean)
        .join(" ") || "-",
    alamat: record.mitra?.alamat || "-",
    penanggungJawab: record.mitra?.penanggungJawab || "-",
    telepon: record.mitra?.kontak || "-",
    plat: record.transportir?.plat || "-",
    volume: String(record.volume ?? "-"),
    namaSupir: record.supir?.nama || "-",
    teleponSupir: record.supir?.nik || "-",
    tujuan:
      record.stasiunPengumpulMinyak?.nama ||
      record.daftarUnitKerja?.unitKerja ||
      "-",
    asalMinyak: record.asalMinyak
      ? [record.asalMinyak.nomor, record.asalMinyak.asal]
          .filter(Boolean)
          .join(" - ") || "-"
      : "-",
    jamDatang: formatTanggalJamIndonesia(record?.jamDatang),
    jamPergi: formatTanggalJamIndonesia(record?.jamPergi),
    jenisTransportir:
      record?.transportir?.jenisTransportir?.jenis ||
      record?.jenisTransportir?.jenis ||
      "-",
  };
}

async function buildSuratJalanDocxFromRecord(
  record,
  verifikasiCode,
  templatePath,
) {
  if (!templatePath || !fs.existsSync(templatePath)) {
    throw new Error(
      "Template surat jalan aktif tidak ditemukan. Unggah dan aktifkan template pada menu Template Dokumen KPBPN.",
    );
  }

  if (!verifikasiCode) {
    throw new Error("Kode verifikasi surat jalan tidak ditemukan");
  }

  const isProduction = env.NODE_ENV === "production";
  const baseUrl = isProduction
    ? env.APP_BASE_URL_PROD || "https://jasirahcore.cloud/"
    : env.APP_BASE_URL_DEV || "https://jasirahcore.cloud/";

  const logoPath = path.join(__dirname, "../public/surat-jalan/logoKPBPN.png");

  const qrDataUrl = await generateQrWithLogo(
    `${baseUrl}/verifikasi/${verifikasiCode}`,
    { sizePx: 400, logoPath, logoScale: 0.3 },
  );

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const imageModule = createImageModule();
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [imageModule],
  });

  doc.render({
    ...buildSuratJalanRenderData(record),
    qrCode: qrDataUrl,
  });

  return doc.getZip().generate({ type: "nodebuffer" });
}

function sanitizeDownloadFileName(name) {
  return String(name || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function getRomanMonthFromDate(date) {
  const months = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return "-";
  return months[d.getMonth()] || "-";
}

function buildSuratJalanDownloadBaseName(record) {
  const kodeAsal = String(record?.asalMinyak?.nomor || "").trim();
  const storedNomor = String(record?.nomor || "").trim();
  const storedHead = storedNomor.split(/[\\/]/)[0].trim();

  let nomorSurat = storedHead;
  if (!nomorSurat) {
    const urut = parseInt(record?.mitra?.nomorUrutSuratJalan, 10);
    const paddedUrut = Number.isFinite(urut)
      ? String(Math.max(urut, 0)).padStart(3, "0")
      : "";
    nomorSurat =
      `${kodeAsal}${paddedUrut}` || String(record?.id || "surat-jalan");
  }

  const kodeMitra = String(record?.mitra?.kode || "").trim() || "KODE";
  const bulan = getRomanMonthFromDate(record?.tanggal);

  return sanitizeDownloadFileName(
    `${nomorSurat}_${kodeMitra}_${bulan}_Surat Jalan Pengiriman Minyak Bumi`,
  );
}

module.exports = {
  buildSuratJalanDocxFromRecord,
  buildSuratJalanRenderData,
  buildSuratJalanDownloadBaseName,
  formatTanggalIndonesia,
  formatTanggalJamIndonesia,
};
