"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daftarUnitKerjas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      unitKerja: {
        type: Sequelize.STRING,
      },
      indukUnitKerjaId: {
        type: Sequelize.INTEGER,
      },
      kode: {
        type: Sequelize.STRING,
      },
      asal: {
        type: Sequelize.STRING,
      },
      // templateSuratTugas: {
      //   type: Sequelize.STRING,
      // },
      // templateNotaDinas: {
      //   type: Sequelize.STRING,
      // },
      // templateSuratTugasSingkat: {
      //   type: Sequelize.STRING,
      // },
      // tempalteKuitansi: {
      //   type: Sequelize.STRING,
      // },
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
    await queryInterface.dropTable("daftarUnitKerjas");
  },
};
