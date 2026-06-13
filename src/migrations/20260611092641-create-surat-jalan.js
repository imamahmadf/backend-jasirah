"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("suratJalans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nomor: {
        type: Sequelize.STRING,
      },
      tanggal: {
        type: Sequelize.DATE,
      },
      mitraId: {
        type: Sequelize.INTEGER,
      },
      transportirId: {
        type: Sequelize.INTEGER,
      },
      unitKerjaId: {
        type: Sequelize.INTEGER,
      },
      volume: {
        type: Sequelize.INTEGER,
      },
      supirId: {
        type: Sequelize.INTEGER,
      },
      statusSuratJalanId: {
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
    await queryInterface.dropTable("suratJalans");
  },
};
