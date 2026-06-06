const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");

const templatePath = path.join(
  __dirname,
  "../src/public/slip-gaji/template-slip-gaji-bulanan.docx",
);

const zip = new PizZip(fs.readFileSync(templatePath, "binary"));
let xml = zip.file("word/document.xml").asText();

xml = xml.replace(/Jumlah Hari Kerja/g, "Keterangan");
xml = xml.replace(/Upah Per\/Hari/g, "Nominal");
xml = xml.replace(/UpahPerHari/g, "Nominal");
xml = xml.replace(/Upah Per Hari/g, "Nominal");
xml = xml.replace(/Upah Per/g, "Nominal");

xml = xml.replace(/(<w:t>)Lembur(<\/w:t>)/g, (match, open, close, offset, source) => {
  const before = source.substring(Math.max(0, offset - 800), offset);
  if (before.includes("Keterangan") || before.includes("Nominal")) {
    return `${open}Jumlah${close}`;
  }
  return match;
});

zip.file("word/document.xml", xml);
fs.writeFileSync(templatePath, zip.generate({ type: "nodebuffer" }));
console.log("Template slip bulanan berhasil diperbarui.");
