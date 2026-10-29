const { nomorSuratKPBPN, pengajuanBarjasKpbpn } = require("../models");

const ID_TEMPLATE_PENGAJUAN = 3;
const POLA_DEFAULT = "PBJ/NOMOR/BULAN/TAHUN";
const BULAN_ROMAWI = [
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

const susunNomorPengajuan = (pola, urut, tanggal) => {
  const [year, month] = String(tanggal || "").split("-");
  const romawi = BULAN_ROMAWI[Number(month) - 1] || "";
  const nomorUrut = String(urut).padStart(3, "0");
  return String(pola || POLA_DEFAULT)
    .split("NOMOR")
    .join(nomorUrut)
    .split("BULAN")
    .join(romawi)
    .split("TAHUN")
    .join(year || "");
};

const buatNomorPengajuan = async (tanggal, transaction) => {
  const template = await nomorSuratKPBPN.findByPk(ID_TEMPLATE_PENGAJUAN, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const pola = template?.nomor || POLA_DEFAULT;
  let urut = (parseInt(template?.nomorUrut, 10) || 0) + 1;

  let nomor = susunNomorPengajuan(pola, urut, tanggal);
  for (let langkah = 0; langkah < 1000; langkah += 1) {
    const bentrok = await pengajuanBarjasKpbpn.findOne({
      attributes: ["id"],
      where: { nomor },
      transaction,
    });
    if (!bentrok) break;
    urut += 1;
    nomor = susunNomorPengajuan(pola, urut, tanggal);
  }

  if (template) {
    await template.update({ nomorUrut: urut }, { transaction });
  }
  return nomor;
};

module.exports = {
  ID_TEMPLATE_PENGAJUAN,
  POLA_DEFAULT,
  susunNomorPengajuan,
  buatNomorPengajuan,
};
