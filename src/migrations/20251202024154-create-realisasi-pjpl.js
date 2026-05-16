"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("realisasiPJPLs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tanggalAwal: {
        type: Sequelize.DATE,
      },
      tanggalAkhir: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM("diajukan", "ditolak", "diterima"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("realisasiPJPLs");
  },
};
