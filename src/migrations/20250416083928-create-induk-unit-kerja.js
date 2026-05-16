"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("indukUnitKerjas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kodeInduk: {
        type: Sequelize.STRING,
      },
      indukUnitKerja: {
        type: Sequelize.STRING,
      },
      templateSuratTugas: {
        type: Sequelize.STRING,
      },
      templateNotaDinas: {
        type: Sequelize.STRING,
      },
      templateSuratTugasSingkat: {
        type: Sequelize.STRING,
      },
      BLUDId: {
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
    await queryInterface.dropTable("indukUnitKerjas");
  },
};
