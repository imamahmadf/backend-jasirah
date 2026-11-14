"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("pengajuanBarjasKpbpns");
    const kolom = {
      type: Sequelize.DATE,
      allowNull: true,
    };
    if (!table.waktuSetujuMengetahui) {
      await queryInterface.addColumn(
        "pengajuanBarjasKpbpns",
        "waktuSetujuMengetahui",
        kolom,
      );
    }
    if (!table.waktuSetujuMenyetujui) {
      await queryInterface.addColumn(
        "pengajuanBarjasKpbpns",
        "waktuSetujuMenyetujui",
        kolom,
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("pengajuanBarjasKpbpns");
    if (table.waktuSetujuMenyetujui) {
      await queryInterface.removeColumn(
        "pengajuanBarjasKpbpns",
        "waktuSetujuMenyetujui",
      );
    }
    if (table.waktuSetujuMengetahui) {
      await queryInterface.removeColumn(
        "pengajuanBarjasKpbpns",
        "waktuSetujuMengetahui",
      );
    }
  },
};
