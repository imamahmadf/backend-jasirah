const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");

const templatePath = path.join(
  __dirname,
  "../src/public/slip-gaji/template-slip-gaji-bulanan.docx",
);

const quadrants = ["kiriAtas", "kananAtas", "kiriBawah", "kananBawah"];

const zip = new PizZip(fs.readFileSync(templatePath, "binary"));
let xml = zip.file("word/document.xml").asText();

let searchStart = 0;

for (const quadrant of quadrants) {
  const periodeNeedle = `Periode : {${quadrant}.periode}`;
  const periodeIdx = xml.indexOf(periodeNeedle, searchStart);

  if (periodeIdx < 0) {
    throw new Error(`Placeholder ${periodeNeedle} tidak ditemukan`);
  }

  const beforePeriode = xml.slice(0, periodeIdx);
  const ptNeedle = "<w:t>PT JASIRAH DIZA BERJAYA</w:t>";
  const ptIdx = beforePeriode.lastIndexOf(ptNeedle);

  if (ptIdx < 0) {
    throw new Error(`Header PT JASIRAH untuk ${quadrant} tidak ditemukan`);
  }

  xml =
    xml.slice(0, ptIdx) +
    `<w:t>{#${quadrant}Filled}${ptNeedle.slice(5)}` +
    xml.slice(ptIdx + ptNeedle.length);

  const takeHomeNeedle = `<w:t>TAKE HOME PAY : Rp {${quadrant}.takeHomePay}</w:t>`;
  xml = xml.replace(
    takeHomeNeedle,
    `<w:t>TAKE HOME PAY : Rp {${quadrant}.takeHomePay}{/${quadrant}Filled}</w:t>`,
  );

  searchStart = periodeIdx + 1;
}

zip.file("word/document.xml", xml);
fs.writeFileSync(templatePath, zip.generate({ type: "nodebuffer" }));
console.log("Template slip bulanan: conditional filled per kuadran ditambahkan.");
