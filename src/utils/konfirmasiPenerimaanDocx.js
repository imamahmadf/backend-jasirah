const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

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
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function formatAngka(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(num);
}

function withSatuan(value, satuan) {
  const angka = formatAngka(value);
  if (angka === null) return "-";
  const namaSatuan = String(satuan || "").trim();
  return namaSatuan ? `${angka} ${namaSatuan}` : angka;
}

function formatPukul(time) {
  if (!time) return "-";
  const match = String(time).trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return "-";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function buildKonfirmasiPenerimaanRenderData(record) {
  const suratJalan = record?.suratJalan;
  const mitra = suratJalan?.mitra;
  const transportir = suratJalan?.transportir;
  const satuan =
    record?.satuanVolume?.satuan || suratJalan?.satuanVolume?.satuan || "";
  const tanggalDasar = record?.createdAt || record?.tanggal || new Date();
  const tanggalObj = new Date(tanggalDasar);
  const tanggalValid = !Number.isNaN(tanggalObj.getTime());

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };
  const volume = toNumber(record?.volume);
  const volumeAir = toNumber(record?.volumeAir);
  const volumeAkhir = toNumber(record?.volumeAkhir);
  const selisih =
    volume !== null && volumeAir !== null && volumeAkhir !== null
      ? volume - volumeAir - volumeAkhir
      : null;

  return {
    nomor: record?.nomor || "-",
    hari: tanggalValid ? HARI[tanggalObj.getDay()] : "-",
    tanggal: tanggalValid ? String(tanggalObj.getDate()) : "-",
    bulan: tanggalValid ? BULAN[tanggalObj.getMonth()] : "-",
    tahun: tanggalValid ? String(tanggalObj.getFullYear()) : "-",
    pukul: formatPukul(record?.jamKedatangan),
    namaMitra:
      [mitra?.jenisMitra?.jenis, mitra?.nama].filter(Boolean).join(" ") || "-",
    plat: transportir?.plat || "-",
    namaSupir: suratJalan?.supir?.nama || "-",
    noSuratJalan: suratJalan?.nomor || "-",
    KapasitasMobil: withSatuan(
      transportir?.kapasitas,
      transportir?.satuanVolume?.satuan,
    ),
    volume: withSatuan(record?.volume, satuan),
    volumeAir: withSatuan(record?.volumeAir, satuan),
    volumeAkhir: withSatuan(record?.volumeAkhir, satuan),
    selisihVolume: withSatuan(selisih, satuan),
    bsnw: formatAngka(record?.BSNW) ?? "-",
    gs: formatAngka(record?.SG) ?? "-",
    api: formatAngka(record?.api) ?? "-",
    catatan: record?.catatan || "-",
  };
}

function buildKonfirmasiPenerimaanDocx(record, templatePath) {
  if (!templatePath || !fs.existsSync(templatePath)) {
    throw new Error(
      "Template konfirmasi penerimaan aktif tidak ditemukan. Unggah dan aktifkan template pada menu Template Dokumen KPBPN.",
    );
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });

  doc.render(buildKonfirmasiPenerimaanRenderData(record));
  return doc.getZip().generate({ type: "nodebuffer" });
}

function sanitizeDownloadFileName(name) {
  return String(name || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function buildKonfirmasiPenerimaanDownloadBaseName(record) {
  const storedNomor = String(record?.nomor || "").trim();
  const nomor = storedNomor.split(/[\\/]/)[0].trim() || String(record?.id || "konfirmasi");
  const kode = String(record?.suratJalan?.mitra?.kode || "").trim() || "KODE";
  const tanggalDasar = record?.createdAt || record?.tanggal || new Date();
  const tanggalObj = new Date(tanggalDasar);
  const bulan = Number.isNaN(tanggalObj.getTime())
    ? "-"
    : (BULAN[tanggalObj.getMonth()] || "-").toUpperCase();

  return sanitizeDownloadFileName(
    `${nomor}_${kode}_${bulan}_Berita Acara Pengukuran Minyak Bumi`,
  );
}

module.exports = {
  buildKonfirmasiPenerimaanDocx,
  buildKonfirmasiPenerimaanRenderData,
  buildKonfirmasiPenerimaanDownloadBaseName,
};
