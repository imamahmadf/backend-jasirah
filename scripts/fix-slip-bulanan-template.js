const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");

const templatePath = path.join(
  __dirname,
  "../src/public/slip-gaji/template-slip-gaji-bulanan.docx",
);

const zip = new PizZip(fs.readFileSync(templatePath, "binary"));
let xml = zip.file("word/document.xml").asText();

const brokenPatterns = [
  [
    /\{<\/w:t><\/w:r><w:proofErr w:type="spellStart"\/><w:r><w:rPr>[\s\S]*?<w:t>kiriAtas\.gajiDiterima<\/w:t><\/w:r><w:proofErr w:type="spellEnd"\/><w:r><w:rPr>[\s\S]*?<w:t>\}/g,
    "{kiriAtas.gajiDiterima}",
  ],
  [
    /\{<\/w:t><\/w:r><w:proofErr w:type="spellStart"\/><w:r><w:rPr>[\s\S]*?<w:t>kiriAtas\.takeHomePay<\/w:t><\/w:r><w:proofErr w:type="spellEnd"\/><w:r><w:rPr>[\s\S]*?<w:t>\}/g,
    "{kiriAtas.takeHomePay}",
  ],
  [
    /\{<\/w:t><\/w:r><w:proofErr w:type="spellStart"\/><w:r><w:rPr>[\s\S]*?<w:t>kiriBawah\.gajiDiterima<\/w:t><\/w:r><w:proofErr w:type="spellEnd"\/><w:r><w:rPr>[\s\S]*?<w:t>\}/g,
    "{kiriBawah.gajiDiterima}",
  ],
  [
    /\{<\/w:t><\/w:r><w:proofErr w:type="spellStart"\/><w:r><w:rPr>[\s\S]*?<w:t>kiriBawah\.takeHomePay<\/w:t><\/w:r><w:proofErr w:type="spellEnd"\/><w:r><w:rPr>[\s\S]*?<w:t>\}/g,
    "{kiriBawah.takeHomePay}",
  ],
  [
    /\{<\/w:t><\/w:r><w:proofErr w:type="spellStart"\/><w:r><w:rPr>[\s\S]*?<w:t>kananAtas\.takeHomePay<\/w:t><\/w:r><w:proofErr w:type="spellEnd"\/><w:r><w:rPr>[\s\S]*?<w:t>\}/g,
    "{kananAtas.takeHomePay}",
  ],
  [
    /\{<\/w:t><\/w:r><w:proofErr w:type="spellStart"\/><w:r><w:rPr>[\s\S]*?<w:t>kananBawah\.takeHomePay<\/w:t><\/w:r><w:proofErr w:type="spellEnd"\/><w:r><w:rPr>[\s\S]*?<w:t>\}/g,
    "{kananBawah.takeHomePay}",
  ],
];

brokenPatterns.forEach(([pattern, replacement]) => {
  xml = xml.replace(pattern, replacement);
});

zip.file("word/document.xml", xml);
fs.writeFileSync(templatePath, zip.generate({ type: "nodebuffer" }));
console.log("Placeholder template slip bulanan berhasil diperbaiki.");
