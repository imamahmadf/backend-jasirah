"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pengeluarans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tanggal: {
        type: Sequelize.DATE,
      },
      deskripsi: {
        type: Sequelize.STRING,
      },
      unitKerjaId: {
        type: Sequelize.INTEGER,
      },
      metodePembayaranId: {
        type: Sequelize.INTEGER,
      },
      jenisPengeluaranId: {
        type: Sequelize.INTEGER,
      },
      statusPembayaranId: {
        type: Sequelize.INTEGER,
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      pegawaiId: {
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
    await queryInterface.dropTable("pengeluarans");
  },
};
