"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hasilKerjaKualitatifPJPLs", {
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
      nilai: {
        type: Sequelize.INTEGER,
      },
      catatan: {
        type: Sequelize.STRING,
      },
      kualitatifPJPLId: {
        type: Sequelize.INTEGER,
      },
      realisasiPJPLId: {
        type: Sequelize.INTEGER,
      },
      pejabatVerifikatorId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hasilKerjaKualitatifPJPLs");
  },
};
