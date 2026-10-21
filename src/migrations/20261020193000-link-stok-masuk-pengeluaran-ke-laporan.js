"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE stokMasuks AS sm
      INNER JOIN (
        SELECT sm2.id AS stokId, MIN(lp.id) AS laporanId
        FROM stokMasuks AS sm2
        INNER JOIN laporanPersediaans AS lp
          ON DATE(sm2.tanggal) >= DATE(lp.tanggalAwal)
         AND DATE(sm2.tanggal) <= DATE(lp.tanggalAkhir)
        WHERE sm2.laporanPersediaanId IS NULL
          AND sm2.pengeluaranId IS NOT NULL
        GROUP BY sm2.id
      ) AS matched ON matched.stokId = sm.id
      SET sm.laporanPersediaanId = matched.laporanId
    `);
  },

  async down() {},
};
