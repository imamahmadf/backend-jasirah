"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pengeluarans", "statusDokumen", {
      type: Sequelize.ENUM("sudah", "belum"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("pengeluarans", "statusDokumen");
  },
};
