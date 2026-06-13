"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pengisianTankis", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      konfirmasiPenerimaanId: {
        type: Sequelize.INTEGER,
      },
      tangkiId: {
        type: Sequelize.INTEGER,
      },
      flowMeter: {
        type: Sequelize.INTEGER,
      },
      gross: {
        type: Sequelize.INTEGER,
      },
      net: {
        type: Sequelize.INTEGER,
      },
      penampilanVisual: {
        type: Sequelize.STRING,
      },
      warna: {
        type: Sequelize.STRING,
      },
      kandunganAir: {
        type: Sequelize.INTEGER,
      },
      BSW: {
        type: Sequelize.INTEGER,
      },
      catatan: {
        type: Sequelize.STRING,
      },
      saksi: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("pengisianTankis");
  },
};
