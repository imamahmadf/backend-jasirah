const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");
const sharp = require("sharp");

const PUBLIC_ROOT = path.resolve(__dirname, "../public");
const ukuranFoto = new Map();

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

function formatTanggalOnly(value) {
  if (!value) return "-";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  const monthIndex = Number(month) - 1;
  if (!year || !day || monthIndex < 0 || monthIndex > 11) return "-";
  return `${Number(day)} ${BULAN[monthIndex]} ${year}`;
}

function formatRupiah(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatJumlah(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(
    number,
  );
}

function labelJenis(jenis) {
  if (jenis === "jasa") return "Jasa";
  if (jenis === "barang") return "Barang";
  return "-";
}

function labelLevel(level) {
  if (level === "urgent") return "Urgent";
  return "Normal";
}

function bacaPathFoto(relPath) {
  if (!relPath) return null;
  const normalized = String(relPath).replace(/^[/\\]+/, "");
  const fullPath = path.resolve(PUBLIC_ROOT, normalized);
  const relative = path.relative(PUBLIC_ROOT, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

async function siapkanFoto(relPath) {
  const fullPath = bacaPathFoto(relPath);
  if (!fullPath) return null;

  try {
    const png = await sharp(fullPath)
      .rotate()
      .resize({ width: 360, height: 360, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    const meta = await sharp(png).metadata();
    const maxWidth = 92;
    const maxHeight = 92;
    const width = meta.width || maxWidth;
    const height = meta.height || maxHeight;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
    ukuranFoto.set(dataUrl, [
      Math.max(24, Math.round(width * ratio)),
      Math.max(24, Math.round(height * ratio)),
    ]);
    return dataUrl;
  } catch (err) {
    console.error("Gagal menyiapkan foto pengajuan:", err.message);
    return null;
  }
}

function createImageModule() {
  return new ImageModule({
    getImage(tagValue) {
      if (typeof tagValue !== "string" || !tagValue.startsWith("data:image/")) {
        return Buffer.alloc(0);
      }
      return Buffer.from(tagValue.slice(tagValue.indexOf(",") + 1), "base64");
    },
    getSize(_img, tagValue) {
      return ukuranFoto.get(tagValue) || [92, 92];
    },
  });
}

function pastikanTempatFoto(zip) {
  const relsPath = "word/_rels/document.xml.rels";
  if (!zip.file(relsPath)) {
    zip.file(
      relsPath,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
    );
  }

  const documentFile = zip.file("word/document.xml");
  if (!documentFile) return;
  let xml = documentFile.asText();
  if (!xml.includes("xmlns:r=")) {
    xml = xml.replace(
      "<w:document ",
      '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" ',
    );
  }
  const awalPemohon = xml.indexOf("{pemohon}");
  if (awalPemohon >= 0 && !xml.includes("{mengetahui}")) {
    const kepala = xml.slice(0, awalPemohon);
    let ekor = xml.slice(awalPemohon);
    ekor = ekor.replace(
      '<w:t xml:space="preserve"> </w:t>',
      '<w:t xml:space="preserve">{mengetahui}</w:t>',
    );
    ekor = ekor.replace(
      '<w:t xml:space="preserve"> </w:t>',
      '<w:t xml:space="preserve">{menyetujui}</w:t>',
    );
    xml = kepala + ekor;
  }
  if (!xml.includes("{%foto}")) {
    xml = xml.replace(
      "<w:sectPr>",
      `<w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Foto item</w:t></w:r></w:p><w:p><w:r><w:t>{#items}{no}. {uraian}</w:t></w:r></w:p><w:p><w:r><w:t>{#adaFoto}</w:t></w:r></w:p><w:p><w:r><w:t>{%foto}</w:t></w:r></w:p><w:p><w:r><w:t>{/adaFoto}</w:t></w:r></w:p><w:p><w:r><w:t>{^adaFoto}Tidak ada foto{/adaFoto}</w:t></w:r></w:p><w:p><w:r><w:t>{/items}</w:t></w:r></w:p><w:sectPr>`,
    );
  }
  zip.file("word/document.xml", xml);
}

async function buildPengajuanRenderData(record) {
  ukuranFoto.clear();
  const items = record.itemPengajuanBarjasKpbpns || [];
  const totalEstimasi = items.reduce(
    (sum, item) => sum + Number(item.jumlah) * Number(item.estimasiHarga || 0),
    0,
  );
  const adaEstimasi = items.some(
    (item) => item.estimasiHarga != null && item.estimasiHarga !== "",
  );
  const totalAktual = items.reduce((sum, item) => {
    if (item.hargaAktual == null || item.hargaAktual === "") return sum;
    return sum + Number(item.jumlah) * Number(item.hargaAktual);
  }, 0);
  const adaHargaAktual = items.some(
    (item) => item.hargaAktual != null && item.hargaAktual !== "",
  );

  return {
    nomorSurat: record.nomor || "-",
    tanggal: formatTanggalOnly(record.tanggal),
    tanggalDibutuhkan: formatTanggalOnly(record.tanggalDibutuhkan),
    jenis: labelJenis(record.jenis),
    level: labelLevel(record.level),
    status: record.statusPengajuanKpbpn?.nama || "-",
    pemohon: record.userKPBPN?.nama || "-",
    mengetahui: record.mengetahui?.nama || "-",
    menyetujui: record.menyetujui?.nama || "-",
    lokasi: record.lokasi || "-",
    keperluan: record.keperluan || "-",
    catatan: record.catatan || "-",
    alasanPenolakan: record.alasanPenolakan || "-",
    totalEstimasi: adaEstimasi ? formatRupiah(totalEstimasi) : "-",
    totalAktual: adaHargaAktual ? formatRupiah(totalAktual) : "-",
    items: await Promise.all(
      items.map(async (item, index) => {
        const uraian = [item.nama, item.spesifikasi].filter(Boolean).join("\n");
        const adaEstimasiItem =
          item.estimasiHarga != null && item.estimasiHarga !== "";
        const subtotalEstimasi = adaEstimasiItem
          ? Number(item.jumlah) * Number(item.estimasiHarga)
          : null;
        const subtotalAktual =
          item.hargaAktual == null || item.hargaAktual === ""
            ? null
            : Number(item.jumlah) * Number(item.hargaAktual);
        const foto = await siapkanFoto(item.foto);

        return {
          no: String(index + 1),
          uraian: uraian || "-",
          jumlah: `${formatJumlah(item.jumlah)} ${item.satuan || ""}`.trim(),
          keterangan: item.keterangan || "-",
          estimasi: adaEstimasiItem ? formatRupiah(item.estimasiHarga) : "-",
          subtotalEstimasi:
            subtotalEstimasi == null ? "-" : formatRupiah(subtotalEstimasi),
          hargaAktual:
            item.hargaAktual == null || item.hargaAktual === ""
              ? "-"
              : formatRupiah(item.hargaAktual),
          subtotalAktual:
            subtotalAktual == null ? "-" : formatRupiah(subtotalAktual),
          adaFoto: Boolean(foto),
          foto,
        };
      }),
    ),
  };
}

async function buildPengajuanDocxFromRecord(record, templatePath) {
  if (!templatePath || !fs.existsSync(templatePath)) {
    throw new Error(
      "Template pengajuan aktif tidak ditemukan. Unggah dan aktifkan template pada menu Template Dokumen KPBPN.",
    );
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  pastikanTempatFoto(zip);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [createImageModule()],
  });

  doc.render(await buildPengajuanRenderData(record));
  return doc.getZip().generate({ type: "nodebuffer" });
}

function buildPengajuanDownloadBaseName(record) {
  const nomor = String(record?.nomor || record?.id || "pengajuan")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return `${nomor}_Pengajuan Barang Jasa`;
}

module.exports = {
  buildPengajuanDocxFromRecord,
  buildPengajuanRenderData,
  buildPengajuanDownloadBaseName,
};
