"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [ada] = await queryInterface.sequelize.query(
      "SELECT id FROM nomorSuratKPBPNs WHERE id = 3 LIMIT 1",
    );
    if (ada.length) return;

    const [pengajuan] = await queryInterface.sequelize.query(
      "SELECT nomor FROM pengajuanBarjasKpbpns",
    );
    let nomorUrut = 0;
    for (const row of pengajuan) {
      const bagian = String(row.nomor || "").split("/")[1];
      const angka = parseInt(bagian, 10);
      if (!Number.isNaN(angka) && angka > nomorUrut) nomorUrut = angka;
    }

    const now = new Date();
    await queryInterface.bulkInsert("nomorSuratKPBPNs", [
      {
        id: 3,
        nomor: "PBJ/NOMOR/BULAN/TAHUN",
        nomorUrut,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("nomorSuratKPBPNs", { id: 3 });
  },
};
