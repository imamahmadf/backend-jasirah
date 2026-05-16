"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kwitGlobals", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pegawaiId: {
        type: Sequelize.INTEGER,
      },
      KPAId: {
        type: Sequelize.INTEGER,
      },
      bendaharaId: {
        type: Sequelize.INTEGER,
      },
      templateKwitGlobalId: {
        type: Sequelize.INTEGER,
      },
      unitKerjaId: {
        type: Sequelize.INTEGER,
      },
      jenisPerjalananId: {
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
    await queryInterface.dropTable("kwitGobals");
  },
};
