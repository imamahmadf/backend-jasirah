"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("perjalanans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      untuk: {
        type: Sequelize.STRING,
      },
      asal: {
        type: Sequelize.STRING,
      },
      dasar: {
        type: Sequelize.STRING,
      },
      noNotaDinas: {
        type: Sequelize.STRING,
      },
      nomorSuratKeluarId: {
        type: Sequelize.INTEGER,
      },
      pelayananKesehatanId: {
        type: Sequelize.INTEGER,
      },
      noSuratTugas: {
        type: Sequelize.STRING,
      },
      tanggalPengajuan: {
        type: Sequelize.DATE,
      },
      ttdSuratTugasId: {
        type: Sequelize.INTEGER,
      },
      PPTKId: {
        type: Sequelize.INTEGER,
      },
      bendaharaId: {
        type: Sequelize.INTEGER,
      },
      KPAId: {
        type: Sequelize.INTEGER,
      },
      ttdNotaDinasId: {
        type: Sequelize.INTEGER,
      },
      // ttdPPTKId: {
      //   type: Sequelize.INTEGER,
      // },
      subKegiatanId: {
        type: Sequelize.INTEGER,
      },
      jenisId: {
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
    await queryInterface.dropTable("perjalanans");
  },
};
