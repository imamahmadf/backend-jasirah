"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("itemPengajuanBarjasKpbpns", "estimasiHarga", {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE itemPengajuanBarjasKpbpns SET estimasiHarga = 0 WHERE estimasiHarga IS NULL",
    );
    await queryInterface.changeColumn("itemPengajuanBarjasKpbpns", "estimasiHarga", {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
