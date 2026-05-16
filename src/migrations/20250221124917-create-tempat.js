"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tempats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      perjalananId: {
        type: Sequelize.INTEGER,
      },
      tempat: {
        type: Sequelize.STRING,
      },
      jenisId: {
        type: Sequelize.INTEGER,
      },
      dalamKotaId: {
        type: Sequelize.INTEGER,
      },
      tanggalBerangkat: {
        type: Sequelize.DATE,
      },
      tanggalPulang: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("tempats");
  },
};
